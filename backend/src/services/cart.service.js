import { PrismaClient } from '@prisma/client';
import {
  quoteCart as engineQuoteCart,
  normalizeCustomerKey,
} from '../pricing-engine/index.js';
import { getStoreSettings } from './settings.service.js';
import { isDbDown } from './dbState.js';

const prisma = new PrismaClient();

export const getCartQuote = async ({
  items = [],
  couponCode = null,
  paymentMethod = null,
  customerEmail = null,
  customerPhone = null,
  shippingContext = {},
}) => {
  if (isDbDown()) {
    const err = new Error('Base de datos no disponible para cotizar el carrito.');
    err.status = 503;
    throw err;
  }

  const settings = await getStoreSettings();
  const productIds = items.map((i) => i.productId).filter(Boolean);
  const now = new Date();
  const historyDays = settings.priceHistoryDays || 30;
  const historyThreshold = new Date(now.getTime() - historyDays * 24 * 60 * 60 * 1000);

  let products = [];
  let promotions = [];
  let campaigns = [];
  let coupons = [];
  let redemptions = [];
  let priceHistory = [];

  try {
    const [dbProducts, dbPromotions, dbCampaigns, dbCoupons, dbHistory] = await Promise.all([
      prisma.product.findMany({
        where: { id: { in: productIds } },
        include: {
          variants: true,
          category: {
            include: { parent: true },
          },
          productTags: {
            include: { tag: true },
          },
        },
      }),
      prisma.promotion.findMany({
        where: { active: true },
        include: {
          targets: true,
          campaign: true,
        },
      }),
      prisma.campaign.findMany({
        where: { active: true },
      }),
      prisma.coupon.findMany({
        where: { active: true },
      }),
      prisma.priceHistory.findMany({
        where: {
          productId: { in: productIds },
          changedAt: { gte: historyThreshold },
        },
      }),
    ]);

    products = dbProducts;
    promotions = dbPromotions;
    campaigns = dbCampaigns;
    coupons = dbCoupons;
    priceHistory = dbHistory;

    const customerKey = normalizeCustomerKey({ email: customerEmail, phone: customerPhone });
    if (customerKey && coupons.length > 0) {
      redemptions = await prisma.couponRedemption.findMany({
        where: { customerKey },
      });
    }
  } catch (dbErr) {
    console.error('[CART SERVICE] Error al consultar datos para cotización:', dbErr.message);
    const err = new Error('Base de datos no disponible para cotizar el carrito.');
    err.status = 503;
    throw err;
  }

  // Emparejar cada ítem con su producto y variante real
  const preparedItems = items.map((rawItem) => {
    const product = products.find((p) => p.id === rawItem.productId);
    if (!product) {
      throw new Error(`Producto ${rawItem.productId} no encontrado o fuera de catálogo`);
    }

    let variant = null;
    if (rawItem.variantId) {
      variant = (product.variants || []).find((v) => v.id === rawItem.variantId);
      if (!variant) {
        throw new Error(`Variante ${rawItem.variantId} no encontrada para ${product.name}`);
      }
    }

    return {
      productId: product.id,
      variantId: variant ? variant.id : null,
      variantDescription: rawItem.variantDescription || null,
      quantity: Math.max(1, Number(rawItem.quantity || 1)),
      product,
      variant,
    };
  });

  return engineQuoteCart(
    { items: preparedItems },
    {
      couponCode,
      paymentMethod,
      customerEmail,
      customerPhone,
      shippingContext,
      promotions,
      campaigns,
      coupons,
      couponRedemptions: redemptions,
      priceHistory,
      now,
      historyDays,
      freeShippingThreshold: settings.freeShippingThreshold,
      baseShippingCost: settings.shippingCost,
      transferDiscountPercent: settings.transferDiscountEnabled ? settings.transferDiscountPercent : 0,
    }
  );
};
