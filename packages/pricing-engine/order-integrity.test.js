import { describe, it, expect, beforeEach } from 'vitest';
import {
  quoteCart,
  getItemPricing,
  validateCompareAtPrice,
  normalizeCustomerKey,
} from './index.js';
import { isDbDown, markDbDown, resetDbState } from '../../backend/src/services/dbState.js';
import * as cartService from '../../backend/src/services/cart.service.js';
import * as orderService from '../../backend/src/services/order.service.js';

describe('Punto 2 — Integridad de Pedidos, Precios y Backend Real', () => {
  const now = new Date('2026-10-25T12:00:00Z');

  const mockProduct = {
    id: 'prod_aceite_01',
    name: 'Aceite Sensorial Love Potion',
    price: 13000,
    active: true,
    stock: 5,
    category: { id: 'cat_cosmetica', name: 'Cosmética íntima' },
  };

  const mockVela = {
    id: 'prod_vela_01',
    name: 'Vela de Soja Aromatizada',
    price: 12000,
    active: true,
    stock: 2,
    category: { id: 'cat_cosmetica', name: 'Cosmética íntima' },
  };

  // Historial establecido con 40 días de antigüedad (>= 30 días)
  const validHistory = [
    {
      id: 'ph_1',
      productId: 'prod_aceite_01',
      oldPrice: 13000,
      newPrice: 13000,
      changedAt: new Date(now.getTime() - 40 * 86400000).toISOString(),
    },
    {
      id: 'ph_2',
      productId: 'prod_vela_01',
      oldPrice: 12000,
      newPrice: 12000,
      changedAt: new Date(now.getTime() - 40 * 86400000).toISOString(),
    },
  ];

  beforeEach(() => {
    resetDbState();
  });

  // 1. Pedido con promoción y cupón acumulable
  it('1. Calcula correctamente pedido con promoción y cupón válidos', () => {
    const promo = {
      id: 'promo_10',
      name: '10% OFF en Cosmética',
      kind: 'PERCENT',
      value: 10,
      active: true,
      targets: [{ targetType: 'CATEGORY', targetId: 'cat_cosmetica' }],
    };

    const coupon = {
      id: 'coupon_bienvenida',
      code: 'BIENVENIDA',
      kind: 'FIXED_AMOUNT',
      value: 1000,
      active: true,
      stackableWithPromotions: true,
      minOrderAmount: 5000,
    };

    const quote = quoteCart(
      {
        items: [
          { productId: mockProduct.id, quantity: 1, product: mockProduct },
          { productId: mockVela.id, quantity: 1, product: mockVela },
        ],
      },
      {
        couponCode: 'BIENVENIDA',
        paymentMethod: 'TRANSFER',
        shippingContext: { deliveryMethod: 'PICKUP' },
        promotions: [promo],
        coupons: [coupon],
        priceHistory: validHistory,
        now,
        transferDiscountPercent: 10,
      }
    );

    // Subtotal regular: 13000 + 12000 = 25000
    expect(quote.subtotal).toBe(25000);
    // 10% promo: 1300 + 1200 = 2500 de descuento
    expect(quote.itemDiscountsTotal).toBe(2500);
    expect(quote.subtotalAfterPromotions).toBe(22500);
    // Cupón fijo $1000:
    expect(quote.couponDiscount).toBe(1000);
    // Subtotal tras cupón: 22500 - 1000 = 21500
    // Descuento transferencia 10% aplicado SOLO a subtotal (21500 * 0.10) = 2150:
    expect(quote.paymentMethodDiscount).toBe(2150);
    // Total pickup (sin costo de envío): 21500 - 2150 = 19350
    expect(quote.total).toBe(19350);
  });

  // 2. Cliente envía precios adulterados -> El servidor los ignora y recalcula con autoridad
  it('2. El servidor ignora precios o descuentos manipulados por el cliente y recalcula con autoridad', () => {
    // Cliente envía un payload manipulado con precio = $10 y descuento falso = $100000
    const tamperedPayload = {
      items: [
        {
          productId: mockProduct.id,
          quantity: 2,
          unitPrice: 10, // Adulterado
          price: 10, // Adulterado
          discountAmount: 99999, // Adulterado
          total: 20, // Adulterado
          product: mockProduct, // Producto real tiene precio 13000
        },
      ],
      clientSubtotal: 20,
      clientTotal: 20,
    };

    const quote = quoteCart(tamperedPayload, {
      paymentMethod: 'CASH',
      shippingContext: { deliveryMethod: 'PICKUP' },
      promotions: [],
      priceHistory: validHistory,
      now,
    });

    // Servidor calcula 2 * 13000 = 26000, ignorando completamente los $10 y $20 del cliente
    expect(quote.items[0].originalUnitPrice).toBe(13000);
    expect(quote.items[0].unitPrice).toBe(13000);
    expect(quote.subtotal).toBe(26000);
    expect(quote.total).toBe(26000);
  });

  // 3. Cupón agotado
  it('3. Rechaza cupón agotado o con límite de usos superado', () => {
    const exhaustedCoupon = {
      id: 'coupon_hot',
      code: 'LIMITADO',
      kind: 'PERCENT',
      value: 20,
      active: true,
      usageLimitTotal: 5,
      usedCount: 5, // Ya alcanzó su límite
    };

    const quote = quoteCart(
      {
        items: [{ productId: mockProduct.id, quantity: 1, product: mockProduct }],
      },
      {
        couponCode: 'LIMITADO',
        paymentMethod: 'CASH',
        shippingContext: { deliveryMethod: 'PICKUP' },
        coupons: [exhaustedCoupon],
        priceHistory: validHistory,
        now,
      }
    );

    expect(quote.couponDiscount).toBe(0);
    expect(quote.couponError).toContain('límite de usos');
  });

  // 4. Dos pedidos simultáneos compitiendo por el último stock
  it('4. Simulación de concurrencia: dos pedidos compitiendo por el último stock', async () => {
    let currentStock = 1;

    const processOrderAttempt = async (orderId, quantityRequested) => {
      // Simula transacción atómica
      if (currentStock < quantityRequested) {
        throw new Error('Stock insuficiente para el producto');
      }
      currentStock -= quantityRequested;
      return { orderId, success: true, remainingStock: currentStock };
    };

    // Pedido A y Pedido B intentan comprar 1 unidad simultáneamente
    const results = await Promise.allSettled([
      processOrderAttempt('order_A', 1),
      processOrderAttempt('order_B', 1),
    ]);

    const successful = results.filter((r) => r.status === 'fulfilled');
    const rejected = results.filter((r) => r.status === 'rejected');

    // Exactamente 1 tiene éxito y el otro es rechazado por falta de stock
    expect(successful.length).toBe(1);
    expect(rejected.length).toBe(1);
    expect(rejected[0].reason.message).toBe('Stock insuficiente para el producto');
    expect(currentStock).toBe(0);
  });

  // 5. Servidor caído -> 503
  it('5. La cotización de carrito y pedidos falla con error 503 cuando la base de datos está caída', async () => {
    markDbDown(60000);

    expect(isDbDown()).toBe(true);

    await expect(
      cartService.getCartQuote({
        items: [{ productId: 'p1', quantity: 1 }],
      })
    ).rejects.toMatchObject({
      status: 503,
      message: expect.stringContaining('Base de datos no disponible'),
    });

    await expect(
      orderService.createOrder({
        items: [{ productId: 'p1', quantity: 1 }],
      })
    ).rejects.toMatchObject({
      status: 503,
      message: expect.stringContaining('Base de datos no disponible'),
    });
  });

  // 6. Honestidad de precios: producto sin historial de al menos 30 días NO muestra precio tachado
  it('6. Producto sin historial de al menos 30 días no muestra precio tachado en modo real', () => {
    const promo = {
      id: 'promo_20',
      name: '20% OFF',
      kind: 'PERCENT',
      value: 20,
      active: true,
      targets: [{ targetType: 'ALL' }],
    };

    // Historial con 0 días de antigüedad (creado hoy en import-catalog o seed)
    const freshTodayHistory = [
      {
        id: 'ph_today',
        productId: mockProduct.id,
        oldPrice: 13000,
        newPrice: 13000,
        changedAt: now.toISOString(), // 0 días < 30 días
      },
    ];

    const pricing = getItemPricing(
      { product: mockProduct, quantity: 1 },
      { promotions: [promo], priceHistory: freshTodayHistory, now, historyDays: 30 }
    );

    expect(pricing.finalPrice).toBe(10400); // 13000 - 20%
    expect(pricing.compareAtPrice).toBeNull(); // PROHIBIDO tachar sin al menos 30 días de historial
  });
});
