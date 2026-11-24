import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { PrismaClient } from '@prisma/client';
import { isDbDown, markDbDown } from './dbState.js';

const prisma = new PrismaClient();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const snapshotPath = path.resolve(__dirname, '../../prisma/catalog-snapshot.json');

const slugify = (text = '') =>
  text
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const loadSnapshot = () => {
  try {
    if (fs.existsSync(snapshotPath)) {
      return JSON.parse(fs.readFileSync(snapshotPath, 'utf-8'));
    }
  } catch {}
  return { collections: [] };
};

const saveSnapshot = (data) => {
  try {
    fs.writeFileSync(snapshotPath, JSON.stringify(data, null, 2), 'utf-8');
  } catch {}
};

export const getCollections = async () => {
  try {
    if (isDbDown()) throw new Error('DB_DOWN');
    return await prisma.collection.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        products: {
          include: {
            product: {
              select: { id: true, name: true, sku: true, price: true, imageUrl: true },
            },
          },
          orderBy: { order: 'asc' },
        },
      },
    });
  } catch (err) {
    markDbDown();
    const snap = loadSnapshot();
    return snap.collections || [];
  }
};

export const getCollectionById = async (id) => {
  try {
    if (isDbDown()) throw new Error('DB_DOWN');
    const coll = await prisma.collection.findUnique({
      where: { id },
      include: {
        products: {
          include: {
            product: true,
          },
          orderBy: { order: 'asc' },
        },
      },
    });
    if (!coll) throw new Error('Colección no encontrada');
    return coll;
  } catch (err) {
    if (err.message === 'Colección no encontrada') throw err;
    markDbDown();
    const snap = loadSnapshot();
    const found = (snap.collections || []).find((c) => c.id === id);
    if (!found) throw new Error('Colección no encontrada');
    return found;
  }
};

export const createCollection = async (data) => {
  const { productIds = [], ...collData } = data;
  const slug = collData.slug ? slugify(collData.slug) : slugify(collData.name);

  try {
    if (isDbDown()) throw new Error('DB_DOWN');
    return await prisma.$transaction(async (tx) => {
      const created = await tx.collection.create({
        data: {
          name: collData.name,
          slug,
          description: collData.description || null,
          active: collData.active !== false,
        },
      });

      if (Array.isArray(productIds) && productIds.length > 0) {
        await tx.collectionProduct.createMany({
          data: productIds.map((pId, idx) => ({
            collectionId: created.id,
            productId: pId,
            order: idx,
          })),
        });
      }

      return tx.collection.findUnique({
        where: { id: created.id },
        include: {
          products: {
            include: { product: true },
            orderBy: { order: 'asc' },
          },
        },
      });
    });
  } catch (err) {
    markDbDown();
    const snap = loadSnapshot();
    if (!Array.isArray(snap.collections)) snap.collections = [];
    const newColl = {
      id: `coll_${Date.now()}`,
      name: collData.name,
      slug,
      description: collData.description || null,
      active: collData.active !== false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      products: productIds.map((pId, idx) => ({
        collectionId: `coll_${Date.now()}`,
        productId: pId,
        order: idx,
      })),
    };
    snap.collections.unshift(newColl);
    saveSnapshot(snap);
    return newColl;
  }
};

export const updateCollection = async (id, data) => {
  const { productIds, ...collData } = data;
  if (collData.slug) collData.slug = slugify(collData.slug);

  try {
    if (isDbDown()) throw new Error('DB_DOWN');
    return await prisma.$transaction(async (tx) => {
      await tx.collection.update({
        where: { id },
        data: collData,
      });

      if (Array.isArray(productIds)) {
        await tx.collectionProduct.deleteMany({ where: { collectionId: id } });
        if (productIds.length > 0) {
          await tx.collectionProduct.createMany({
            data: productIds.map((pId, idx) => ({
              collectionId: id,
              productId: pId,
              order: idx,
            })),
          });
        }
      }

      return tx.collection.findUnique({
        where: { id },
        include: {
          products: {
            include: { product: true },
            orderBy: { order: 'asc' },
          },
        },
      });
    });
  } catch (err) {
    markDbDown();
    const snap = loadSnapshot();
    const idx = (snap.collections || []).findIndex((c) => c.id === id);
    if (idx === -1) throw new Error('Colección no encontrada');
    snap.collections[idx] = {
      ...snap.collections[idx],
      ...collData,
      updatedAt: new Date().toISOString(),
    };
    saveSnapshot(snap);
    return snap.collections[idx];
  }
};

export const deleteCollection = async (id) => {
  try {
    if (isDbDown()) throw new Error('DB_DOWN');
    return await prisma.collection.delete({ where: { id } });
  } catch (err) {
    markDbDown();
    const snap = loadSnapshot();
    snap.collections = (snap.collections || []).filter((c) => c.id !== id);
    saveSnapshot(snap);
    return { message: 'Colección eliminada' };
  }
};
