import { PrismaClient } from '@prisma/client';
import { isDbDown } from './dbState.js';

const prisma = new PrismaClient();

const DEFAULT_SETTINGS = {
  id: 'default',
  shippingCost: 4500,
  freeShippingThreshold: 45000,
  freePickupEnabled: true,
  transferDiscountPercent: 10,
  transferDiscountEnabled: true,
  priceHistoryDays: 30,
  generalTermsText: 'Venta de calzado por mayor y por menor en Córdoba. Consultá por mínimos mayoristas y disponibilidad de talles.',
  shippingNoticeText: 'Envíos en [ZONA DE ENVÍO] — [COSTOS Y PLAZOS DE ENVÍO].',
  bankTransferInstructions: 'Transferencia bancaria. Te enviaremos los datos de CBU y Alias al confirmar el pedido por WhatsApp.',
};

export const getStoreSettings = async () => {
  if (isDbDown()) {
    console.warn('[SETTINGS] DB marcada como caída, retornando configuración por defecto');
    return DEFAULT_SETTINGS;
  }

  try {
    const settings = await prisma.storeSettings.findUnique({
      where: { id: 'default' },
    });
    if (!settings) {
      return DEFAULT_SETTINGS;
    }
    return settings;
  } catch (err) {
    console.warn('[SETTINGS] Error al consultar base de datos, usando defaults:', err.message);
    return DEFAULT_SETTINGS;
  }
};

export const updateStoreSettings = async (data) => {
  if (isDbDown()) {
    const err = new Error('Base de datos no disponible para actualizar la configuración de la tienda');
    err.status = 503;
    throw err;
  }

  try {
    const updateData = {};
    if (data.shippingCost !== undefined) updateData.shippingCost = Math.max(0, Math.round(Number(data.shippingCost)));
    if (data.freeShippingThreshold !== undefined) updateData.freeShippingThreshold = Math.max(0, Math.round(Number(data.freeShippingThreshold)));
    if (data.freePickupEnabled !== undefined) updateData.freePickupEnabled = Boolean(data.freePickupEnabled);
    if (data.transferDiscountPercent !== undefined) updateData.transferDiscountPercent = Math.max(0, Math.min(100, Math.round(Number(data.transferDiscountPercent))));
    if (data.transferDiscountEnabled !== undefined) updateData.transferDiscountEnabled = Boolean(data.transferDiscountEnabled);
    if (data.priceHistoryDays !== undefined) updateData.priceHistoryDays = Math.max(1, Math.round(Number(data.priceHistoryDays)));
    if (data.generalTermsText !== undefined) updateData.generalTermsText = data.generalTermsText;
    if (data.shippingNoticeText !== undefined) updateData.shippingNoticeText = data.shippingNoticeText;
    if (data.bankTransferInstructions !== undefined) updateData.bankTransferInstructions = data.bankTransferInstructions;

    const saved = await prisma.storeSettings.upsert({
      where: { id: 'default' },
      update: updateData,
      create: {
        id: 'default',
        ...DEFAULT_SETTINGS,
        ...updateData,
      },
    });

    return saved;
  } catch (err) {
    console.error('[SETTINGS] Error al guardar configuración en DB:', err);
    const dbErr = new Error('Base de datos no disponible para guardar la configuración.');
    dbErr.status = 503;
    throw dbErr;
  }
};
