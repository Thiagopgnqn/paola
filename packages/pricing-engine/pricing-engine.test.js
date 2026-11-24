import { describe, it, expect } from 'vitest';
import {
  roundARS,
  isPeriodActive,
  validateCompareAtPrice,
  getItemPricing,
  quoteCart,
  getEffectiveCampaignStatus,
} from './index.js';

describe('Pricing Engine — Nocturna SexShop', () => {
  // Base mock product & variant
  const mockProduct = {
    id: 'prod_vibrador_luna',
    name: 'Vibrador Luna',
    price: 30000,
    badge: 'Popular',
    categoryId: 'cat_vibradores',
    sku: 'VIB-01',
    variants: [],
  };

  const mockProductWithVariants = {
    id: 'prod_baby_doll',
    name: 'Baby Doll Venecia',
    price: 32000,
    categoryId: 'cat_lenceria',
    sku: 'GRP-LENCERIA',
    variants: [
      { id: 'var_s', sku: 'LENC-S', size: 'S', price: 32000, stock: 10 },
      { id: 'var_xl', sku: 'LENC-XL', size: 'XL', price: 36000, stock: 5 },
    ],
  };

  const now = new Date('2026-10-25T15:00:00Z');

  // Valid price history records (recorded 40 days ago, establishing >= 30 days of verified antiquity)
  const validHistory = [
    {
      id: 'ph_1',
      productId: 'prod_vibrador_luna',
      variantId: null,
      oldPrice: 30000,
      newPrice: 30000,
      changedAt: new Date('2026-09-15T12:00:00Z').toISOString(),
    },
    {
      id: 'ph_2',
      productId: 'prod_baby_doll',
      variantId: 'var_xl',
      oldPrice: 36000,
      newPrice: 36000,
      changedAt: new Date('2026-09-15T12:00:00Z').toISOString(),
    },
  ];

  // 1. Porcentaje (PERCENT)
  it('1. Aplica correctamente promoción porcentual (PERCENT)', () => {
    const promo = {
      id: 'promo_perc',
      name: '20% OFF en Vibradores',
      kind: 'PERCENT',
      value: 20,
      active: true,
      targets: [{ targetType: 'PRODUCT', targetId: 'prod_vibrador_luna' }],
    };

    const res = getItemPricing(
      { product: mockProduct, quantity: 1 },
      { promotions: [promo], priceHistory: validHistory, now }
    );

    expect(res.listPrice).toBe(30000);
    expect(res.finalPrice).toBe(24000); // 30000 * 0.8
    expect(res.savingsAmount).toBe(6000);
    expect(res.discountPercent).toBe(20);
    expect(res.promotionLabel).toBe('20% OFF en Vibradores');
  });

  // 2. Monto fijo (FIXED_AMOUNT)
  it('2. Aplica correctamente descuento de monto fijo (FIXED_AMOUNT)', () => {
    const promo = {
      id: 'promo_fixed_amt',
      name: '$5.000 OFF Directo',
      kind: 'FIXED_AMOUNT',
      value: 5000,
      active: true,
      targets: [{ targetType: 'ALL' }],
    };

    const res = getItemPricing(
      { product: mockProduct, quantity: 1 },
      { promotions: [promo], priceHistory: validHistory, now }
    );

    expect(res.listPrice).toBe(30000);
    expect(res.finalPrice).toBe(25000);
    expect(res.savingsAmount).toBe(5000);
  });

  // 3. Precio fijo (FIXED_PRICE)
  it('3. Aplica correctamente precio fijo promocional (FIXED_PRICE)', () => {
    const promo = {
      id: 'promo_fixed_price',
      name: 'Precio Fijo Hot Sale $22.000',
      kind: 'FIXED_PRICE',
      value: 22000,
      active: true,
      targets: [{ targetType: 'PRODUCT', targetId: 'prod_vibrador_luna' }],
    };

    const res = getItemPricing(
      { product: mockProduct, quantity: 1 },
      { promotions: [promo], priceHistory: validHistory, now }
    );

    expect(res.listPrice).toBe(30000);
    expect(res.finalPrice).toBe(22000);
    expect(res.savingsAmount).toBe(8000);
  });

  // 4. 2x1 y 3x2 con cantidades impares (BUY_X_PAY_Y)
  it('4. Aplica 2x1 y 3x2 en carrito manejando cantidades impares bonificando la de menor valor', () => {
    const promo2x1 = {
      id: 'promo_2x1',
      name: '2x1 en Todo',
      kind: 'BUY_X_PAY_Y',
      buyQuantity: 2,
      payQuantity: 1,
      active: true,
      targets: [{ targetType: 'ALL' }],
    };

    // Caso 2x1 con 3 unidades de $10.000 cada una (impar: 1 gratis, 2 pagadas)
    const cartOdd = {
      items: [
        {
          product: { id: 'p1', name: 'Item 1', price: 10000 },
          quantity: 3,
        },
      ],
    };

    const quote2x1 = quoteCart(cartOdd, { promotions: [promo2x1], now, baseShippingCost: 0 });
    expect(quote2x1.subtotal).toBe(30000);
    expect(quote2x1.cartDiscountsTotal).toBe(10000); // 1 unidad gratis
    expect(quote2x1.total).toBe(20000);

    // Caso 3x2 con 5 unidades de $10.000 (1 gratis por el combo de 3, las otras 2 se pagan completas)
    const promo3x2 = {
      id: 'promo_3x2',
      name: '3x2 en Todo',
      kind: 'BUY_X_PAY_Y',
      buyQuantity: 3,
      payQuantity: 2,
      active: true,
      targets: [{ targetType: 'ALL' }],
    };

    const cart5Items = {
      items: [
        {
          product: { id: 'p1', name: 'Item 1', price: 10000 },
          quantity: 5,
        },
      ],
    };

    const quote3x2 = quoteCart(cart5Items, { promotions: [promo3x2], now, baseShippingCost: 0 });
    expect(quote3x2.subtotal).toBe(50000);
    expect(quote3x2.cartDiscountsTotal).toBe(10000); // 1 unidad bonificada
    expect(quote3x2.total).toBe(40000); // paga 4 de 5
  });

  // 5. Combo (BUNDLE_PRICE)
  it('5. Aplica combo/bundle promocional cuando están presentes los productos requeridos', () => {
    const promoBundle = {
      id: 'promo_combo_pareja',
      name: 'Combo Parejas: Vibrador + Gel a $35.000',
      kind: 'BUNDLE_PRICE',
      bundleSkus: ['VIB-01', 'GEL-01'],
      value: 35000,
      active: true,
    };

    const cartWithBundle = {
      items: [
        { product: { id: 'p1', name: 'Vibrador', sku: 'VIB-01', price: 30000 }, quantity: 1 },
        { product: { id: 'p2', name: 'Gel Lubricante', sku: 'GEL-01', price: 12000 }, quantity: 1 },
      ],
    };

    // Subtotal regular: 30000 + 12000 = 42000. Combo: 35000. Descuento: 7000.
    const res = quoteCart(cartWithBundle, { promotions: [promoBundle], now, baseShippingCost: 0 });
    expect(res.subtotal).toBe(42000);
    expect(res.cartDiscountsTotal).toBe(7000);
    expect(res.total).toBe(35000);
  });

  // 6. Escalonado (TIERED)
  it('6. Aplica descuento escalonado según volumen (TIERED)', () => {
    const promoTiered = {
      id: 'promo_tiered',
      name: 'Descuento por Cantidad',
      kind: 'TIERED',
      active: true,
      tiers: [
        { minQuantity: 3, discountPercent: 10 },
        { minQuantity: 5, discountPercent: 20 },
      ],
      targets: [{ targetType: 'ALL' }],
    };

    // 4 unidades: alcanza el primer nivel (10% off)
    const cart4 = {
      items: [{ product: { id: 'p1', name: 'Preservativos', price: 5000 }, quantity: 4 }],
    };
    const res4 = quoteCart(cart4, { promotions: [promoTiered], now, baseShippingCost: 0 });
    expect(res4.subtotal).toBe(20000);
    expect(res4.cartDiscountsTotal).toBe(2000); // 10% de 20000
    expect(res4.total).toBe(18000);

    // 5 unidades: alcanza el segundo nivel (20% off)
    const cart5 = {
      items: [{ product: { id: 'p1', name: 'Preservativos', price: 5000 }, quantity: 5 }],
    };
    const res5 = quoteCart(cart5, { promotions: [promoTiered], now, baseShippingCost: 0 });
    expect(res5.subtotal).toBe(25000);
    expect(res5.cartDiscountsTotal).toBe(5000); // 20% de 25000
    expect(res5.total).toBe(20000);
  });

  // 7. Promoción acumulable vs no acumulable
  it('7. Resuelve promociones acumulables y no acumulables seleccionando la más conveniente', () => {
    const promoA = {
      id: 'pA',
      name: '10% OFF',
      kind: 'PERCENT',
      value: 10,
      stackable: false,
      active: true,
      targets: [{ targetType: 'ALL' }],
    };

    const promoB = {
      id: 'pB',
      name: '25% OFF Especial',
      kind: 'PERCENT',
      value: 25,
      stackable: false,
      active: true,
      targets: [{ targetType: 'ALL' }],
    };

    // Gana la más conveniente para el cliente (25% en vez de 10%)
    const res = getItemPricing(
      { product: mockProduct, quantity: 1 },
      { promotions: [promoA, promoB], priceHistory: validHistory, now }
    );
    expect(res.finalPrice).toBe(22500);
    expect(res.promotionLabel).toBe('25% OFF Especial');
    expect(res.savingsAmount).toBe(7500);

    // Con acumulables: 10% + 10% acumulable
    const stack1 = {
      id: 's1',
      name: '10% OFF Inicial',
      kind: 'PERCENT',
      value: 10,
      stackable: true,
      active: true,
      targets: [{ targetType: 'ALL' }],
    };
    const stack2 = {
      id: 's2',
      name: 'Extra 10% OFF Acumulable',
      kind: 'PERCENT',
      value: 10,
      stackable: true,
      active: true,
      targets: [{ targetType: 'ALL' }],
    };

    const resStack = getItemPricing(
      { product: mockProduct, quantity: 1 },
      { promotions: [stack1, stack2], priceHistory: validHistory, now }
    );
    // 30000 - 10% = 27000; 27000 - 10% = 24300
    expect(resStack.finalPrice).toBe(24300);
  });

  // 8. Cupón acumulable y no acumulable
  it('8. Maneja cupones acumulables y no acumulables con promociones vigentes', () => {
    const promo = {
      id: 'p1',
      name: '15% OFF Promo',
      kind: 'PERCENT',
      value: 15,
      active: true,
      targets: [{ targetType: 'ALL' }],
    };

    const couponNonStackable = {
      id: 'c_non_stack',
      code: 'SOLOESTO',
      kind: 'PERCENT',
      value: 10,
      stackableWithPromotions: false,
      active: true,
    };

    const couponStackable = {
      id: 'c_stack',
      code: 'EXTRAVIP',
      kind: 'FIXED_AMOUNT',
      value: 3000,
      stackableWithPromotions: true,
      active: true,
    };

    const cart = {
      items: [{ product: mockProduct, quantity: 1 }],
    };

    // Cupón NO acumulable cuando ya hay una promoción aplicada: debe ser rechazado con mensaje claro
    const resBlocked = quoteCart(cart, {
      promotions: [promo],
      coupons: [couponNonStackable],
      couponCode: 'SOLOESTO',
      now,
    });
    expect(resBlocked.couponDiscount).toBe(0);
    expect(resBlocked.couponError).toContain('no es acumulable');

    // Cupón acumulable con promoción: aplica sobre el saldo remanente
    const resAllowed = quoteCart(cart, {
      promotions: [promo],
      coupons: [couponStackable],
      couponCode: 'EXTRAVIP',
      now,
      baseShippingCost: 0,
    });
    // Subtotal: 30000. Promo 15%: -4500 -> 25500. Cupón: -3000 -> 22500.
    expect(resAllowed.itemDiscountsTotal).toBe(4500);
    expect(resAllowed.couponDiscount).toBe(3000);
    expect(resAllowed.total).toBe(22500);
  });

  // 9. Cupón vencido, agotado y límite por cliente
  it('9. Valida cupón vencido, agotado por límite total y excedido por cliente (email/teléfono)', () => {
    const expiredCoupon = {
      id: 'c_exp',
      code: 'VENCIDO',
      kind: 'FIXED_AMOUNT',
      value: 2000,
      endsAt: new Date('2026-10-01T00:00:00Z').toISOString(),
      active: true,
    };

    const exhaustedCoupon = {
      id: 'c_exh',
      code: 'AGOTADO',
      kind: 'FIXED_AMOUNT',
      value: 2000,
      usageLimitTotal: 5,
      usedCount: 5,
      active: true,
    };

    const perCustomerCoupon = {
      id: 'c_cust',
      code: 'UNOUSO',
      kind: 'FIXED_AMOUNT',
      value: 2000,
      usageLimitPerCustomer: 1,
      active: true,
    };

    const redemptions = [
      {
        id: 'red_1',
        couponId: 'c_cust',
        customerKey: 'email:juan@ejemplo.com',
        orderId: 'ord_1',
        createdAt: '2026-10-20T00:00:00Z',
      },
    ];

    const cart = { items: [{ product: mockProduct, quantity: 1 }] };

    // Vencido
    const resExp = quoteCart(cart, { coupons: [expiredCoupon], couponCode: 'VENCIDO', now });
    expect(resExp.couponError).toContain('vencido');
    expect(resExp.couponDiscount).toBe(0);

    // Agotado
    const resExh = quoteCart(cart, { coupons: [exhaustedCoupon], couponCode: 'AGOTADO', now });
    expect(resExh.couponError).toContain('límite de usos');
    expect(resExh.couponDiscount).toBe(0);

    // Límite por cliente ya alcanzado
    const resCust = quoteCart(cart, {
      coupons: [perCustomerCoupon],
      couponRedemptions: redemptions,
      couponCode: 'UNOUSO',
      customerEmail: 'juan@ejemplo.com',
      now,
    });
    expect(resCust.couponError).toContain('máximo de veces permitido');
    expect(resCust.couponDiscount).toBe(0);

    // Mismo cupón por cliente con otro email: sí aplica
    const resCustOk = quoteCart(cart, {
      coupons: [perCustomerCoupon],
      couponRedemptions: redemptions,
      couponCode: 'UNOUSO',
      customerEmail: 'maria@ejemplo.com',
      now,
      baseShippingCost: 0,
    });
    expect(resCustOk.couponDiscount).toBe(2000);
  });

  // 10. Descuento por transferencia bancaria
  it('10. Aplica descuento de pago por transferencia bancaria (TRANSFER)', () => {
    const cart = { items: [{ product: mockProduct, quantity: 1 }] }; // $30.000
    const res = quoteCart(cart, {
      paymentMethod: 'TRANSFER',
      transferDiscountPercent: 10,
      baseShippingCost: 0,
      now,
    });

    expect(res.paymentMethodDiscount).toBe(3000); // 10% de 30000
    expect(res.total).toBe(27000);
  });

  // 11. Envío gratis por monto superado
  it('11. Bonifica el envío si se supera el umbral de compra o mediante cupón FREE_SHIPPING', () => {
    // Umbral configurado en $50.000. Carrito de $60.000 (2 x $30.000)
    const cartThreshold = { items: [{ product: mockProduct, quantity: 2 }] };
    const resThreshold = quoteCart(cartThreshold, {
      freeShippingThreshold: 50000,
      baseShippingCost: 4500,
      now,
    });

    expect(resThreshold.shipping.baseCost).toBe(4500);
    expect(resThreshold.shipping.discount).toBe(4500);
    expect(resThreshold.shipping.finalCost).toBe(0);
    expect(resThreshold.shipping.isFree).toBe(true);

    // Carrito de $30.000 (no supera umbral), pero con cupón FREE_SHIPPING
    const freeShipCoupon = {
      id: 'c_envio',
      code: 'ENVIOGRATIS',
      kind: 'FREE_SHIPPING',
      value: 0,
      active: true,
    };
    const cartSmall = { items: [{ product: mockProduct, quantity: 1 }] };
    const resCoupon = quoteCart(cartSmall, {
      coupons: [freeShipCoupon],
      couponCode: 'ENVIOGRATIS',
      freeShippingThreshold: 50000,
      baseShippingCost: 4500,
      now,
    });

    expect(resCoupon.shipping.finalCost).toBe(0);
    expect(resCoupon.shipping.isFree).toBe(true);
  });

  // 12. Vigencia de fechas: antes, durante y después
  it('12. Evalúa vigencia temporal antes, durante y después del período programado', () => {
    const promoSchedule = {
      id: 'p_sched',
      name: 'CyberWeek',
      kind: 'PERCENT',
      value: 30,
      startsAt: '2026-11-01T00:00:00Z',
      endsAt: '2026-11-07T23:59:59Z',
      active: true,
      targets: [{ targetType: 'ALL' }],
    };

    // Antes de comenzar (Octubre 2026) -> No aplica
    const resBefore = getItemPricing(
      { product: mockProduct, quantity: 1 },
      { promotions: [promoSchedule], now: new Date('2026-10-25T12:00:00Z') }
    );
    expect(resBefore.finalPrice).toBe(30000);
    expect(resBefore.savingsAmount).toBe(0);

    // Durante el evento (Noviembre 3, 2026) -> Aplica
    const resDuring = getItemPricing(
      { product: mockProduct, quantity: 1 },
      {
        promotions: [promoSchedule],
        now: new Date('2026-11-03T12:00:00Z'),
        priceHistory: [
          {
            productId: 'prod_vibrador_luna',
            oldPrice: 30000,
            newPrice: 30000,
            changedAt: '2026-11-01T00:00:00Z',
          },
        ],
      }
    );
    expect(resDuring.finalPrice).toBe(21000); // 30% off
    expect(resDuring.savingsAmount).toBe(9000);

    // Después de finalizado (Noviembre 10, 2026) -> No aplica
    const resAfter = getItemPricing(
      { product: mockProduct, quantity: 1 },
      { promotions: [promoSchedule], now: new Date('2026-11-10T12:00:00Z') }
    );
    expect(resAfter.finalPrice).toBe(30000);
    expect(resAfter.savingsAmount).toBe(0);
  });

  // 13. Variantes con diferentes precios
  it('13. Cotiza adecuadamente variantes con precios diferenciados', () => {
    const variantS = mockProductWithVariants.variants[0]; // $32.000
    const variantXL = mockProductWithVariants.variants[1]; // $36.000

    const promo = {
      id: 'promo_xl',
      name: 'Especial XL $4.000 OFF',
      kind: 'FIXED_AMOUNT',
      value: 4000,
      active: true,
      targets: [{ targetType: 'VARIANT', targetId: 'var_xl' }],
    };

    // Variante S (no alcanzada por promo de XL)
    const resS = getItemPricing(
      { product: mockProductWithVariants, variant: variantS, quantity: 1 },
      { promotions: [promo], priceHistory: validHistory, now }
    );
    expect(resS.listPrice).toBe(32000);
    expect(resS.finalPrice).toBe(32000);

    // Variante XL (alcanzada por promo)
    const resXL = getItemPricing(
      { product: mockProductWithVariants, variant: variantXL, quantity: 1 },
      { promotions: [promo], priceHistory: validHistory, now }
    );
    expect(resXL.listPrice).toBe(36000);
    expect(resXL.finalPrice).toBe(32000);
    expect(resXL.savingsAmount).toBe(4000);
  });

  // 14. Tope máximo de descuento (maxDiscountAmount)
  it('14. Respeta el tope máximo de descuento (maxDiscountAmount)', () => {
    const promoCapped = {
      id: 'p_capped',
      name: '50% con Tope de $5.000',
      kind: 'PERCENT',
      value: 50, // 50% de $30.000 sería $15.000
      maxDiscountAmount: 5000,
      active: true,
      targets: [{ targetType: 'ALL' }],
    };

    const res = getItemPricing(
      { product: mockProduct, quantity: 1 },
      { promotions: [promoCapped], priceHistory: validHistory, now }
    );
    expect(res.listPrice).toBe(30000);
    expect(res.savingsAmount).toBe(5000); // Tope aplicado
    expect(res.finalPrice).toBe(25000);
  });

  // 15. Redondeo a pesos enteros
  it('15. Aplica redondeo estricto a pesos enteros argentinos (sin decimales)', () => {
    const promoOddPercent = {
      id: 'p_odd',
      name: '17% OFF',
      kind: 'PERCENT',
      value: 17,
      active: true,
      targets: [{ targetType: 'ALL' }],
    };

    const item = { product: { id: 'p', price: 33333 }, quantity: 1 };
    // 33333 * 0.17 = 5666.61 -> redondeo a 5667 -> precio final 27666
    const res = getItemPricing(item, { promotions: [promoOddPercent], now });
    expect(Number.isInteger(res.finalPrice)).toBe(true);
    expect(Number.isInteger(res.savingsAmount)).toBe(true);
    expect(res.finalPrice).toBe(27666);
    expect(res.savingsAmount).toBe(5667);
  });

  // 16. Total nunca menor a 0
  it('16. Garantiza que el total y precios nunca sean negativos ante descuentos extremos', () => {
    const extremeCoupon = {
      id: 'c_extreme',
      code: 'GRATISTODO',
      kind: 'FIXED_AMOUNT',
      value: 9999999,
      active: true,
    };

    const cart = { items: [{ product: mockProduct, quantity: 1 }] };
    const res = quoteCart(cart, {
      coupons: [extremeCoupon],
      couponCode: 'GRATISTODO',
      baseShippingCost: 0,
      now,
    });

    expect(res.total).toBe(0);
    expect(res.total).toBeGreaterThanOrEqual(0);
  });

  // 17. Honestidad de precios: compareAtPrice no se muestra si no hay historial real
  it('17. Regla de honestidad: compareAtPrice NO se muestra si no existe registro en PriceHistory de los últimos 30 días', () => {
    const promo = {
      id: 'promo_desc',
      name: '20% OFF',
      kind: 'PERCENT',
      value: 20,
      active: true,
      targets: [{ targetType: 'ALL' }],
    };

    // Caso A: SIN historial de precios en la base de datos
    const resSinHistorial = getItemPricing(
      { product: mockProduct, quantity: 1 },
      { promotions: [promo], priceHistory: [], now }
    );
    expect(resSinHistorial.finalPrice).toBe(24000);
    expect(resSinHistorial.compareAtPrice).toBeNull(); // PROHIBIDO inventar precio anterior

    // Caso B: CON historial que valida que el precio de $30.000 estuvo vigente hace 40 días (>= 30 días)
    const resConHistorial = getItemPricing(
      { product: mockProduct, quantity: 1 },
      { promotions: [promo], priceHistory: validHistory, now }
    );
    expect(resConHistorial.finalPrice).toBe(24000);
    expect(resConHistorial.compareAtPrice).toBe(30000); // Comprobado fehacientemente

    // Caso C: Historial reciente sin al menos 30 días de antigüedad (ej. recién creado hoy en import/seed)
    const todayHistory = [
      {
        id: 'ph_today',
        productId: 'prod_vibrador_luna',
        newPrice: 30000,
        changedAt: now.toISOString(), // Creado hoy (0 días de antigüedad < 30 días)
      },
    ];
    const resHistorialHoy = getItemPricing(
      { product: mockProduct, quantity: 1 },
      { promotions: [promo], priceHistory: todayHistory, now }
    );
    expect(resHistorialHoy.compareAtPrice).toBeNull(); // PROHIBIDO tachar precio sin historial de al menos 30 días

    // Caso D: Historial con alteración conflictiva reciente en los últimos 30 días
    const conflictHistory = [
      ...validHistory,
      {
        id: 'ph_change',
        productId: 'prod_vibrador_luna',
        oldPrice: 30000,
        newPrice: 22000,
        changedAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ];
    const resConflict = getItemPricing(
      { product: mockProduct, quantity: 1 },
      { promotions: [promo], priceHistory: conflictHistory, now }
    );
    expect(resConflict.compareAtPrice).toBeNull();
  });

  // 18. Cotización completa y coherencia de snapshots
  it('18. Cotiza carrito con desglose completo y estructura lista para snapshots de orden', () => {
    const promo = {
      id: 'promo_10',
      campaignId: 'camp_hot',
      name: '10% OFF',
      kind: 'PERCENT',
      value: 10,
      active: true,
      targets: [{ targetType: 'ALL' }],
    };

    const coupon = {
      id: 'c_vip',
      code: 'VIP5000',
      kind: 'FIXED_AMOUNT',
      value: 5000,
      stackableWithPromotions: true,
      active: true,
    };

    const cart = {
      items: [
        { product: mockProduct, quantity: 2 }, // 2 * $30.000 = $60.000 (con 10% promo = $54.000)
      ],
    };

    const quote = quoteCart(cart, {
      promotions: [promo],
      coupons: [coupon],
      couponCode: 'VIP5000',
      paymentMethod: 'TRANSFER',
      transferDiscountPercent: 10,
      freeShippingThreshold: 50000,
      baseShippingCost: 4500,
      now,
    });

    // 1. Subtotal original: $60.000
    expect(quote.subtotal).toBe(60000);
    // 2. Descuento por items (10%): $6.000 -> saldo: $54.000
    expect(quote.itemDiscountsTotal).toBe(6000);
    // 3. Cupón acumulable: -$5.000 -> saldo: $49.000
    expect(quote.couponDiscount).toBe(5000);
    // 4. Pago por transferencia (10% sobre $49.000): $4.900 -> saldo: $44.100
    expect(quote.paymentMethodDiscount).toBe(4900);
    // 5. Envío gratis (subtotal original $60.000 >= $50.000): $0
    expect(quote.shipping.isFree).toBe(true);
    expect(quote.shipping.finalCost).toBe(0);
    // 6. Total final: 49.000 - 4.900 = 44.100
    expect(quote.total).toBe(44100);

    // Snapshot por ítem generado correctamente
    const itemSnapshot = quote.items[0];
    expect(itemSnapshot.originalUnitPrice).toBe(30000);
    expect(itemSnapshot.unitPrice).toBe(27000);
    expect(itemSnapshot.discountAmount).toBe(3000);
    expect(itemSnapshot.promotionId).toBe('promo_10');
    expect(itemSnapshot.campaignId).toBe('camp_hot');
  });
});
