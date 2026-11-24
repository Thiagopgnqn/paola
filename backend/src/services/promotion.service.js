import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const snapshotPath = path.resolve(__dirname, '../../prisma/catalog-snapshot.json');

const loadSnapshot = () => {
  try {
    if (fs.existsSync(snapshotPath)) {
      return JSON.parse(fs.readFileSync(snapshotPath, 'utf-8'));
    }
  } catch {}
  return { promotions: [] };
};

const saveSnapshot = (data) => {
  try {
    fs.writeFileSync(snapshotPath, JSON.stringify(data, null, 2), 'utf-8');
  } catch {}
};

export const getPromotions = async (filters = {}) => {
  const { campaignId, kind, active, search } = filters;
  try {
    const where = {};
    if (campaignId) where.campaignId = campaignId;
    if (kind) where.kind = kind;
    if (active !== undefined && active !== '') where.active = active === 'true' || active === true;
    if (search) where.name = { contains: search, mode: 'insensitive' };

    return await prisma.promotion.findMany({
      where,
      orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
      include: {
        targets: true,
        campaign: true,
      },
    });
  } catch (err) {
    const snap = loadSnapshot();
    let list = snap.promotions || [];
    if (campaignId) list = list.filter((p) => p.campaignId === campaignId);
    if (kind) list = list.filter((p) => p.kind === kind);
    if (active !== undefined && active !== '') {
      const boolVal = active === 'true' || active === true;
      list = list.filter((p) => Boolean(p.active) === boolVal);
    }
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((p) => p.name.toLowerCase().includes(q));
    }
    return list;
  }
};

export const getPromotionById = async (id) => {
  try {
    const promo = await prisma.promotion.findUnique({
      where: { id },
      include: { targets: true, campaign: true },
    });
    if (!promo) throw new Error('Promoción no encontrada');
    return promo;
  } catch (err) {
    const snap = loadSnapshot();
    const found = (snap.promotions || []).find((p) => p.id === id);
    if (!found) throw new Error('Promoción no encontrada');
    return found;
  }
};

export const createPromotion = async (data) => {
  const { targets = [], ...promoData } = data;
  try {
    return await prisma.$transaction(async (tx) => {
      const created = await tx.promotion.create({
        data: {
          campaignId: promoData.campaignId || null,
          name: promoData.name,
          kind: promoData.kind,
          value: promoData.value != null ? promoData.value : null,
          minQuantity: promoData.minQuantity != null ? promoData.minQuantity : null,
          minOrderAmount: promoData.minOrderAmount != null ? promoData.minOrderAmount : null,
          maxDiscountAmount: promoData.maxDiscountAmount != null ? promoData.maxDiscountAmount : null,
          tiers: promoData.tiers ? (typeof promoData.tiers === 'string' ? promoData.tiers : JSON.stringify(promoData.tiers)) : null,
          buyQuantity: promoData.buyQuantity != null ? promoData.buyQuantity : null,
          payQuantity: promoData.payQuantity != null ? promoData.payQuantity : null,
          bundleSkus: promoData.bundleSkus ? (typeof promoData.bundleSkus === 'string' ? promoData.bundleSkus : JSON.stringify(promoData.bundleSkus)) : null,
          paymentMethod: promoData.paymentMethod || null,
          stackable: Boolean(promoData.stackable),
          startsAt: promoData.startsAt ? new Date(promoData.startsAt) : null,
          endsAt: promoData.endsAt ? new Date(promoData.endsAt) : null,
          active: promoData.active !== false,
          usageLimit: promoData.usageLimit != null ? promoData.usageLimit : null,
          priority: Number(promoData.priority || 0),
        },
      });

      if (Array.isArray(targets) && targets.length > 0) {
        await tx.promotionTarget.createMany({
          data: targets.map((t) => ({
            promotionId: created.id,
            targetType: t.targetType,
            targetId: t.targetId || null,
            excluded: Boolean(t.excluded),
          })),
        });
      }

      return tx.promotion.findUnique({
        where: { id: created.id },
        include: { targets: true, campaign: true },
      });
    });
  } catch (err) {
    console.error('[PROMOTION WRITE] Base de datos no disponible para crear promoción:', err.message);
    const dbErr = new Error('Base de datos no disponible para crear promociones.');
    dbErr.status = 503;
    throw dbErr;
  }
};

export const updatePromotion = async (id, data) => {
  const { targets, ...promoData } = data;
  try {
    return await prisma.$transaction(async (tx) => {
      await tx.promotion.update({
        where: { id },
        data: {
          ...promoData,
          startsAt: promoData.startsAt !== undefined ? (promoData.startsAt ? new Date(promoData.startsAt) : null) : undefined,
          endsAt: promoData.endsAt !== undefined ? (promoData.endsAt ? new Date(promoData.endsAt) : null) : undefined,
        },
      });

      if (Array.isArray(targets)) {
        await tx.promotionTarget.deleteMany({ where: { promotionId: id } });
        if (targets.length > 0) {
          await tx.promotionTarget.createMany({
            data: targets.map((t) => ({
              promotionId: id,
              targetType: t.targetType,
              targetId: t.targetId || null,
              excluded: Boolean(t.excluded),
            })),
          });
        }
      }

      return tx.promotion.findUnique({
        where: { id },
        include: { targets: true, campaign: true },
      });
    });
  } catch (err) {
    console.error('[PROMOTION WRITE] Base de datos no disponible para actualizar promoción:', err.message);
    const dbErr = new Error('Base de datos no disponible para actualizar promociones.');
    dbErr.status = 503;
    throw dbErr;
  }
};

export const deletePromotion = async (id) => {
  try {
    return await prisma.promotion.delete({ where: { id } });
  } catch (err) {
    console.error('[PROMOTION WRITE] Base de datos no disponible para eliminar promoción:', err.message);
    const dbErr = new Error('Base de datos no disponible para eliminar promociones.');
    dbErr.status = 503;
    throw dbErr;
  }
};

export const togglePromotion = async (id) => {
  const current = await getPromotionById(id);
  return updatePromotion(id, { active: !current.active });
};
