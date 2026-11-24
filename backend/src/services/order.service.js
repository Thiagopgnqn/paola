import { PrismaClient } from '@prisma/client';
import { generateWhatsAppLink } from '../utils/whatsapp.js';
import { sendMetaPurchaseEvent } from './meta.service.js';
import {
  quoteCart,
  normalizeCustomerKey,
} from '../pricing-engine/index.js';
import { getStoreSettings } from './settings.service.js';
import { isDbDown } from './dbState.js';

const prisma = new PrismaClient();

export const formatVariantDescription = (variant) => {
  if (!variant) return null;
  const parts = [];
  if (variant.type) parts.push(variant.type);
  if (variant.size) parts.push(`Talle: ${variant.size}`);
  if (variant.color) parts.push(`Color: ${variant.color}`);
  if (variant.flavor) parts.push(`Aroma/Sabor: ${variant.flavor}`);
  if (variant.volume) parts.push(variant.volume);
  return parts.length > 0 ? parts.join(' · ') : `SKU ${variant.sku}`;
};

export const createOrder = async (data, userId) => {
  if (isDbDown()) {
    const err = new Error('Base de datos no disponible para crear pedidos.');
    err.status = 503;
    throw err;
  }

  const settings = await getStoreSettings();

  const result = await prisma.$transaction(async (tx) => {
    const rawItems = Array.isArray(data.items) ? data.items : [];
    if (rawItems.length === 0) {
      throw new Error('El carrito está vacío');
    }

    const productIds = rawItems.map((i) => i.productId);
    const now = new Date();
    const historyDays = settings.priceHistoryDays || 30;
    const historyThreshold = new Date(now.getTime() - historyDays * 24 * 60 * 60 * 1000);

    // Cargar entidades requeridas para el motor de precios y control de stock
    const [products, promotions, campaigns, coupons, priceHistory] = await Promise.all([
      tx.product.findMany({
        where: { id: { in: productIds } },
        include: {
          variants: true,
          category: { include: { parent: true } },
          productTags: { include: { tag: true } },
        },
      }),
      tx.promotion.findMany({
        where: { active: true },
        include: { targets: true, campaign: true },
      }),
      tx.campaign.findMany({ where: { active: true } }),
      tx.coupon.findMany({ where: { active: true } }),
      tx.priceHistory.findMany({
        where: {
          productId: { in: productIds },
          changedAt: { gte: historyThreshold },
        },
      }),
    ]);

    const customerKey = normalizeCustomerKey({
      email: data.customerEmail,
      phone: data.customerPhone,
    });

    let couponRedemptions = [];
    if (customerKey) {
      couponRedemptions = await tx.couponRedemption.findMany({
        where: { customerKey },
      });
    }

    // Preparar ítems para el motor de precios y validar existencias
    const preparedItems = rawItems.map((item) => {
      const product = products.find((p) => p.id === item.productId);
      if (!product || !product.active) {
        throw new Error(`Producto ${item.productId} no encontrado o inactivo`);
      }

      let variant = null;
      if (item.variantId) {
        variant = (product.variants || []).find((v) => v.id === item.variantId && v.active);
        if (!variant) {
          throw new Error(`Variante ${item.variantId} no encontrada o inactiva para ${product.name}`);
        }
        if (variant.stock < item.quantity) {
          throw new Error(`Stock insuficiente para la variante de ${product.name}`);
        }
      } else if (product.stock < item.quantity) {
        throw new Error(`Stock insuficiente para el producto ${product.name}`);
      }

      return {
        productId: product.id,
        variantId: variant ? variant.id : null,
        variantDescription:
          item.variantDescription || (variant ? formatVariantDescription(variant) : null),
        quantity: item.quantity,
        product,
        variant,
      };
    });

    // AUTORIDAD DEL SERVIDOR: Recalcular precios, promociones y cupones
    const quote = quoteCart(
      { items: preparedItems },
      {
        couponCode: data.couponCode,
        paymentMethod: data.paymentMethod,
        customerEmail: data.customerEmail,
        customerPhone: data.customerPhone,
        shippingContext: {
          deliveryMethod: data.deliveryMethod,
          postalCode: data.customerPostalCode,
          province: data.customerProvince,
        },
        promotions,
        campaigns,
        coupons,
        couponRedemptions,
        priceHistory,
        now,
        historyDays,
        freeShippingThreshold: settings.freeShippingThreshold,
        baseShippingCost: settings.shippingCost,
        transferDiscountPercent: settings.transferDiscountEnabled ? settings.transferDiscountPercent : 0,
      }
    );

    // Si el usuario intentó ingresar un cupón y hubo error de validación, abortar
    if (data.couponCode && quote.couponError) {
      throw new Error(`Cupón inválido: ${quote.couponError}`);
    }

    // Descontar stock y armar itemsData con snapshot inmutable
    const itemsData = [];
    for (const quotedItem of quote.items) {
      itemsData.push({
        productId: quotedItem.productId,
        variantId: quotedItem.variantId,
        variantDescription: quotedItem.variantDescription,
        quantity: quotedItem.quantity,
        originalUnitPrice: quotedItem.originalUnitPrice,
        discountAmount: quotedItem.discountAmount,
        unitPrice: quotedItem.unitPrice,
        subtotal: quotedItem.subtotal,
        promotionId: quotedItem.promotionId,
        campaignId: quotedItem.campaignId,
      });

      if (quotedItem.variantId) {
        await tx.productVariant.update({
          where: { id: quotedItem.variantId },
          data: {
            stock: { decrement: quotedItem.quantity },
          },
        });
      }

      await tx.product.update({
        where: { id: quotedItem.productId },
        data: {
          stock: { decrement: quotedItem.quantity },
          soldCount: { increment: quotedItem.quantity },
        },
      });
    }

    // Actualizar cupón si fue aplicado
    if (quote.coupon) {
      await tx.coupon.update({
        where: { id: quote.coupon.id },
        data: {
          usedCount: { increment: 1 },
        },
      });
    }

    // Crear la orden con snapshots completos
    const order = await tx.order.create({
      data: {
        userId,
        customerName: data.customerName,
        customerPhone: data.customerPhone,
        customerEmail: data.customerEmail,
        customerAddress: data.customerAddress,
        deliveryMethod: data.deliveryMethod,
        comments: data.comments,
        subtotal: quote.subtotal,
        couponCode: quote.coupon ? quote.coupon.code : null,
        couponDiscount: quote.couponDiscount,
        paymentMethodDiscount: quote.paymentMethodDiscount,
        shippingDiscount: quote.shipping.discount,
        shippingTotal: quote.shipping.finalCost,
        total: quote.total,
        utm_source: data.utm_source || null,
        utm_medium: data.utm_medium || null,
        utm_campaign: data.utm_campaign || null,
        items: {
          create: itemsData,
        },
        ...(quote.coupon && customerKey
          ? {
              redemptions: {
                create: {
                  couponId: quote.coupon.id,
                  customerKey,
                },
              },
            }
          : {}),
      },
      include: {
        items: {
          include: {
            product: true,
            variant: true,
            promotion: true,
            campaign: true,
          },
        },
        redemptions: true,
      },
    });

    const whatsappLink = generateWhatsAppLink(
      {
        ...order,
        customerProvince: data.customerProvince,
        customerCity: data.customerCity,
        customerPostalCode: data.customerPostalCode,
      },
      order.items
    );

    return { order, whatsappLink, quote };
  });

  sendMetaPurchaseEvent(result.order, result.order.items);
  return result;
};

export const getOrders = async (filters) => {
  const { page = 1, limit = 10, status } = filters;
  const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
  const take = parseInt(limit, 10);

  const where = {};
  if (status) where.status = status;

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take,
      include: {
        items: {
          include: {
            product: true,
            variant: true,
            promotion: true,
            campaign: true,
          },
        },
      },
    }),
    prisma.order.count({ where }),
  ]);

  return { orders, total, page: parseInt(page, 10), limit: parseInt(limit, 10) };
};

export const getOrderById = async (id) => {
  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      items: {
        include: {
          product: true,
          variant: true,
          promotion: true,
          campaign: true,
        },
      },
      redemptions: true,
    },
  });
  if (!order) throw new Error('Order not found');
  return order;
};

export const updateOrderStatus = async (id, status) => {
  return prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!order) throw new Error('Order not found');

    if (status === 'CANCELLED' && order.status !== 'CANCELLED') {
      for (const item of order.items) {
        if (item.variantId) {
          await tx.productVariant.update({
            where: { id: item.variantId },
            data: { stock: { increment: item.quantity } },
          });
        }
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: { increment: item.quantity },
            soldCount: { decrement: item.quantity },
          },
        });
      }
    } else if (order.status === 'CANCELLED' && status !== 'CANCELLED') {
      for (const item of order.items) {
        if (item.variantId) {
          await tx.productVariant.update({
            where: { id: item.variantId },
            data: { stock: { decrement: item.quantity } },
          });
        }
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: { decrement: item.quantity },
            soldCount: { increment: item.quantity },
          },
        });
      }
    }

    return tx.order.update({
      where: { id },
      data: { status },
      include: {
        items: {
          include: {
            product: true,
            variant: true,
            promotion: true,
            campaign: true,
          },
        },
      },
    });
  });
};
