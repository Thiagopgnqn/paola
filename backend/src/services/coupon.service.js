import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { PrismaClient } from '@prisma/client';
import { isDbDown, markDbDown } from './dbState.js';

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
  return { coupons: [] };
};

const saveSnapshot = (data) => {
  try {
    fs.writeFileSync(snapshotPath, JSON.stringify(data, null, 2), 'utf-8');
  } catch {}
};

export const getCoupons = async (filters = {}) => {
  const { search, active } = filters;
  try {
    if (isDbDown()) throw new Error('DB_DOWN');
    const where = {};
    if (active !== undefined && active !== '') where.active = active === 'true' || active === true;
    if (search) where.code = { contains: search, mode: 'insensitive' };

    const items = await prisma.coupon.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        campaign: true,
        _count: { select: { redemptions: true } },
      },
    });
    return items.map((c) => ({ ...c, type: c.kind }));
  } catch (err) {
    markDbDown();
    const snap = loadSnapshot();
    let list = snap.coupons || [];
    if (active !== undefined && active !== '') {
      const boolVal = active === 'true' || active === true;
      list = list.filter((c) => Boolean(c.active) === boolVal);
    }
    if (search) {
      const q = search.toUpperCase();
      list = list.filter((c) => c.code.toUpperCase().includes(q));
    }
    return list.map((c) => ({ ...c, type: c.kind || c.type, kind: c.kind || c.type }));
  }
};

export const getCouponById = async (id) => {
  try {
    if (isDbDown()) throw new Error('DB_DOWN');
    const coupon = await prisma.coupon.findUnique({
      where: { id },
      include: {
        campaign: true,
        redemptions: {
          include: { order: true },
          take: 20,
          orderBy: { createdAt: 'desc' },
        },
      },
    });
    if (!coupon) throw new Error('Cupón no encontrado');
    return { ...coupon, type: coupon.kind };
  } catch (err) {
    if (err.message === 'Cupón no encontrado') throw err;
    markDbDown();
    const snap = loadSnapshot();
    const found = (snap.coupons || []).find((c) => c.id === id);
    if (!found) throw new Error('Cupón no encontrado');
    return { ...found, type: found.kind || found.type, kind: found.kind || found.type };
  }
};

export const createCoupon = async (data) => {
  const normalizedCode = String(data.code).trim().toUpperCase();
  const kind = data.kind || data.type || 'PERCENT';

  try {
    if (isDbDown()) throw new Error('DB_DOWN');
    const created = await prisma.coupon.create({
      data: {
        code: normalizedCode,
        kind,
        value: data.value,
        minOrderAmount: data.minOrderAmount != null ? data.minOrderAmount : null,
        maxDiscountAmount: data.maxDiscountAmount != null ? data.maxDiscountAmount : null,
        startsAt: data.startsAt ? new Date(data.startsAt) : null,
        endsAt: data.endsAt ? new Date(data.endsAt) : null,
        usageLimitTotal: data.usageLimitTotal != null ? data.usageLimitTotal : null,
        usageLimitPerCustomer: data.usageLimitPerCustomer != null ? data.usageLimitPerCustomer : null,
        active: data.active !== false,
        campaignId: data.campaignId || null,
        appliesTo: data.appliesTo || 'ALL',
        stackableWithPromotions: Boolean(data.stackableWithPromotions),
      },
      include: { campaign: true },
    });
    return { ...created, type: created.kind };
  } catch (err) {
    if (err.message && err.message.includes('Ya existe')) throw err;
    markDbDown();
    console.error('[COUPON WRITE] Base de datos no disponible para crear cupón:', err.message);
    const dbErr = new Error('Base de datos no disponible para crear cupones.');
    dbErr.status = 503;
    throw dbErr;
  }
};

export const updateCoupon = async (id, data) => {
  const updateData = { ...data };
  if (updateData.code) updateData.code = String(updateData.code).trim().toUpperCase();
  if (updateData.type && !updateData.kind) updateData.kind = updateData.type;
  delete updateData.type;
  if (updateData.startsAt !== undefined) updateData.startsAt = updateData.startsAt ? new Date(updateData.startsAt) : null;
  if (updateData.endsAt !== undefined) updateData.endsAt = updateData.endsAt ? new Date(updateData.endsAt) : null;

  try {
    if (isDbDown()) throw new Error('DB_DOWN');
    const updated = await prisma.coupon.update({
      where: { id },
      data: updateData,
      include: { campaign: true },
    });
    return { ...updated, type: updated.kind };
  } catch (err) {
    if (err.message === 'Cupón no encontrado') throw err;
    markDbDown();
    console.error('[COUPON WRITE] Base de datos no disponible para actualizar cupón:', err.message);
    const dbErr = new Error('Base de datos no disponible para actualizar cupones.');
    dbErr.status = 503;
    throw dbErr;
  }
};

export const deleteCoupon = async (id) => {
  try {
    if (isDbDown()) throw new Error('DB_DOWN');
    return await prisma.coupon.delete({ where: { id } });
  } catch (err) {
    markDbDown();
    console.error('[COUPON WRITE] Base de datos no disponible para eliminar cupón:', err.message);
    const dbErr = new Error('Base de datos no disponible para eliminar cupones.');
    dbErr.status = 503;
    throw dbErr;
  }
};

export const toggleCoupon = async (id) => {
  const current = await getCouponById(id);
  return updateCoupon(id, { active: !current.active });
};

export const exportCouponsCsv = async () => {
  const coupons = await getCoupons();
  const headers = [
    'Código',
    'Tipo',
    'Valor',
    'Compra Mínima',
    'Tope Descuento',
    'Usos Actuales',
    'Límite Total',
    'Límite Por Cliente',
    'Acumulable con Promos',
    'Estado',
    'Inicio',
    'Fin',
  ];

  const rows = coupons.map((c) => [
    `"${c.code}"`,
    `"${c.kind}"`,
    c.value,
    c.minOrderAmount || '',
    c.maxDiscountAmount || '',
    c.usedCount || 0,
    c.usageLimitTotal || 'Ilimitado',
    c.usageLimitPerCustomer || 'Ilimitado',
    c.stackableWithPromotions ? 'Sí' : 'No',
    c.active ? 'Activo' : 'Inactivo',
    c.startsAt ? `"${new Date(c.startsAt).toISOString().split('T')[0]}"` : '',
    c.endsAt ? `"${new Date(c.endsAt).toISOString().split('T')[0]}"` : '',
  ]);

  return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
};
