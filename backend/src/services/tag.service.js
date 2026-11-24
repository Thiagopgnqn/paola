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
  return { tags: [], productTags: [] };
};

const saveSnapshot = (data) => {
  try {
    fs.writeFileSync(snapshotPath, JSON.stringify(data, null, 2), 'utf-8');
  } catch {}
};

export const getTags = async () => {
  try {
    if (isDbDown()) throw new Error('DB_DOWN');
    return await prisma.tag.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: { select: { products: true } },
      },
    });
  } catch (err) {
    markDbDown();
    const snap = loadSnapshot();
    return snap.tags || [];
  }
};

export const createTag = async (data) => {
  const name = String(data.name).trim();
  const slug = data.slug ? slugify(data.slug) : slugify(name);
  const color = data.color || '#907878';
  try {
    if (isDbDown()) throw new Error('DB_DOWN');
    const created = await prisma.tag.create({
      data: { name, slug },
    });
    return { ...created, color };
  } catch (err) {
    markDbDown();
    const snap = loadSnapshot();
    if (!Array.isArray(snap.tags)) snap.tags = [];
    const existing = snap.tags.find((t) => t.slug === slug || t.name.toLowerCase() === name.toLowerCase());
    if (existing) return existing;
    const newTag = {
      id: `tag_${Date.now()}`,
      name,
      slug,
      color,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    snap.tags.push(newTag);
    saveSnapshot(snap);
    return newTag;
  }
};

export const deleteTag = async (id) => {
  try {
    if (isDbDown()) throw new Error('DB_DOWN');
    return await prisma.tag.delete({ where: { id } });
  } catch (err) {
    markDbDown();
    const snap = loadSnapshot();
    snap.tags = (snap.tags || []).filter((t) => t.id !== id);
    saveSnapshot(snap);
    return { message: 'Etiqueta eliminada' };
  }
};

export const assignTagsToProduct = async (productId, tagIds = []) => {
  try {
    if (isDbDown()) throw new Error('DB_DOWN');
    return await prisma.$transaction(async (tx) => {
      await tx.productTag.deleteMany({ where: { productId } });
      if (tagIds.length > 0) {
        await tx.productTag.createMany({
          data: tagIds.map((tagId) => ({
            productId,
            tagId,
          })),
        });
      }
      return tx.product.findUnique({
        where: { id: productId },
        include: { productTags: { include: { tag: true } } },
      });
    });
  } catch (err) {
    markDbDown();
    const snap = loadSnapshot();
    const prod = (snap.products || []).find((p) => p.id === productId);
    if (!prod) throw new Error('Producto no encontrado');
    const matchedTags = (snap.tags || []).filter((t) => tagIds.includes(t.id));
    prod.tags = matchedTags;
    prod.productTags = matchedTags.map((t) => ({ productId, tagId: t.id, tag: t }));
    saveSnapshot(snap);
    return prod;
  }
};
