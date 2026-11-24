import { describe, it, expect } from 'vitest';
import {
  enrichProductWithPricing,
  validateCompareAtPrice,
  getItemPricing,
  quoteCart,
  DEFAULT_FREE_SHIPPING_THRESHOLD,
  DEFAULT_TRANSFER_DISCOUNT_PERCENT,
  DEFAULT_SHIPPING_COST,
} from './index.js';

describe('Parte 3 — Storefront Pricing Engine & Honesty Rules', () => {
  const sampleProduct = {
    id: 'prod_sandalia_001',
    name: 'Sandalia Plataforma Clásica',
    sku: 'SAN-001',
    price: 30000,
    stock: 5,
    soldCount: 15,
    createdAt: new Date().toISOString(),
    categoryId: 'cat_sandalias',
    category: { id: 'cat_sandalias', name: 'Sandalias' },
    variants: [
      { id: 'var_s', sku: 'SAN-001-N', size: '37', price: 30000, stock: 2, active: true },
      { id: 'var_m', sku: 'SAN-001-B', size: '38', price: 32000, stock: 3, active: true },
    ],
  };

  const promoPercent = {
    id: 'promo_15_off',
    name: '15% OFF en Sandalias',
    kind: 'PERCENT',
    value: 15,
    active: true,
    targets: [{ targetType: 'CATEGORY', targetId: 'cat_sandalias' }],
  };

  const validPriceHistory = [
    {
      productId: 'prod_sandalia_001',
      variantId: null,
      oldPrice: 30000,
      newPrice: 30000,
      changedAt: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      productId: 'prod_sandalia_001',
      variantId: 'var_s',
      oldPrice: 30000,
      newPrice: 30000,
      changedAt: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      productId: 'prod_sandalia_001',
      variantId: 'var_m',
      oldPrice: 32000,
      newPrice: 32000,
      changedAt: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ];

  it('REGLA DE HONESTIDAD: Con historial real comprobado de los últimos 30 días, compareAtPrice es válido', () => {
    const enriched = enrichProductWithPricing(sampleProduct, {
      promotions: [promoPercent],
      priceHistory: validPriceHistory,
      now: new Date(),
    });

    expect(enriched.pricing.finalPrice).toBe(25500); // 30000 - 15%
    expect(enriched.pricing.compareAtPrice).toBe(30000); // Verificado por PriceHistory
    expect(enriched.pricing.savingsAmount).toBe(4500);
    expect(enriched.pricing.discountPercent).toBe(15);
  });

  it('REGLA DE HONESTIDAD: Sin historial comprobado (descuento falso/inflado), compareAtPrice es estrictamente null', () => {
    const enriched = enrichProductWithPricing(sampleProduct, {
      promotions: [promoPercent],
      priceHistory: [], // VACÍO: sin antecedentes reales en los últimos 30 días
      now: new Date(),
    });

    expect(enriched.pricing.finalPrice).toBe(25500);
    expect(enriched.pricing.compareAtPrice).toBeNull(); // NUNCA muestra precio tachado
    expect(enriched.pricing.promotionLabel).toBe('15% OFF en Sandalias');
  });

  it('Badges automáticos: nuevo por fecha de alta, más vendido por ventas y stock bajo', () => {
    const enriched = enrichProductWithPricing(
      {
        ...sampleProduct,
        createdAt: new Date().toISOString(),
        soldCount: 20,
        stock: 2,
        variants: [],
      },
      { promotions: [], priceHistory: [] }
    );

    expect(enriched.isNew).toBe(true);
    expect(enriched.isBestSeller).toBe(true);
    expect(enriched.isLowStock).toBe(true);
  });

  it('Respeto a variantes: el precio y ahorro cambian dinámicamente según la variante elegida', () => {
    const enriched = enrichProductWithPricing(sampleProduct, {
      promotions: [promoPercent],
      priceHistory: validPriceHistory,
      now: new Date(),
    });

    const variantS = enriched.variants.find((v) => v.id === 'var_s');
    const variantM = enriched.variants.find((v) => v.id === 'var_m');

    expect(variantS.pricing.finalPrice).toBe(25500); // 30000 - 15%
    expect(variantS.pricing.compareAtPrice).toBe(30000);
    expect(variantS.pricing.savingsAmount).toBe(4500);

    expect(variantM.pricing.finalPrice).toBe(27200); // 32000 - 15%
    expect(variantM.pricing.compareAtPrice).toBe(32000);
    expect(variantM.pricing.savingsAmount).toBe(4800);
  });

  it('Combos Comprá junto y ahorrá: identifica productos y calcula precio con descuento', () => {
    const prodB = {
      id: 'prod_ojota_001',
      sku: 'OJO-001',
      name: 'Ojota Verano',
      price: 15000,
      active: true,
      variants: [],
    };

    const bundlePromo = {
      id: 'promo_combo_sandalia_ojota',
      name: 'Combo Temporada',
      kind: 'BUNDLE_PRICE',
      value: 38000, // Regular total: 30000 + 15000 = 45000 -> 38000
      bundleSkus: ['SAN-001', 'OJO-001'],
      active: true,
    };

    const enriched = enrichProductWithPricing(sampleProduct, {
      promotions: [bundlePromo],
      allProducts: [sampleProduct, prodB],
    });

    expect(enriched.comboPromotions.length).toBe(1);
    expect(enriched.comboPromotions[0].bundlePrice).toBe(38000);
    expect(enriched.comboPromotions[0].regularTotal).toBe(45000);
    expect(enriched.comboPromotions[0].savings).toBe(7000);
  });

  it('Cotización de Carrito con promoción por cantidad (2x1 en Zapatillas)', () => {
    const promo2x1 = {
      id: 'promo_2x1_zap',
      name: '2x1 en Zapatillas Urbanas',
      kind: 'BUY_X_PAY_Y',
      buyQuantity: 2,
      payQuantity: 1,
      active: true,
      targets: [{ targetType: 'CATEGORY', targetId: 'cat_zapatillas' }],
    };

    const shoeItem = {
      productId: 'prod_zapa_001',
      sku: 'ZAP-001',
      price: 18000,
      category: { id: 'cat_zapatillas' },
    };

    // Caso 1: Cliente tiene 2 unidades -> Paga 1
    const quote = quoteCart(
      {
        items: [{ product: shoeItem, quantity: 2 }],
      },
      {
        promotions: [promo2x1],
        paymentMethod: 'OTHER',
      }
    );

    expect(quote.subtotal).toBe(36000);
    expect(quote.cartDiscountsTotal).toBe(18000); // 1 gratis
    expect(quote.appliedPromotions.length).toBe(1);
    expect(quote.appliedPromotions[0].name).toContain('2x1');
  });

  it('Validación de Cupón en vivo: rechaza cupones no válidos, expirados o con monto mínimo no alcanzado', () => {
    const couponMin = {
      id: 'cup_min_50k',
      code: 'PROMO50K',
      kind: 'PERCENT',
      value: 20,
      active: true,
      minOrderAmount: 50000,
    };

    // Compra menor al monto mínimo ($30.000 < $50.000)
    const quote = quoteCart(
      {
        items: [{ product: sampleProduct, quantity: 1 }],
      },
      {
        coupons: [couponMin],
        couponCode: 'PROMO50K',
      }
    );

    expect(quote.coupon).toBeNull();
    expect(quote.couponError).toContain('monto mínimo');
  });

  it('Cupón válido y acumulabilidad: aplica descuento porcentual y calcula total final', () => {
    const couponValid = {
      id: 'cup_val_10',
      code: 'BIENVENIDA',
      kind: 'PERCENT',
      value: 10,
      active: true,
    };

    const quote = quoteCart(
      {
        items: [{ product: sampleProduct, quantity: 2 }], // 60000
      },
      {
        coupons: [couponValid],
        couponCode: 'BIENVENIDA',
        paymentMethod: 'TRANSFER', // 10% adicional por transferencia
        shippingContext: { deliveryMethod: 'DELIVERY' },
      }
    );

    expect(quote.subtotal).toBe(60000);
    expect(quote.coupon.code).toBe('BIENVENIDA');
    expect(quote.couponDiscount).toBe(6000); // 10% de 60000
    // Subtotal después de cupón = 54000
    expect(quote.paymentMethodDiscount).toBe(5400); // 10% de 54000
    // Como subtotal > 50000, califica para envío gratis
    expect(quote.shipping.isFree).toBe(true);
    expect(quote.shipping.finalCost).toBe(0);
    expect(quote.total).toBe(48600); // 54000 - 5400
  });

  it('Barra de progreso de envío gratis: calcula faltante si el pedido no alcanza los $50.000', () => {
    const quote = quoteCart(
      {
        items: [{ product: sampleProduct, quantity: 1 }], // 30000
      },
      {
        paymentMethod: 'OTHER',
        shippingContext: { deliveryMethod: 'DELIVERY' },
      }
    );

    expect(quote.subtotal).toBe(30000);
    expect(quote.shipping.isFree).toBe(false);
    expect(quote.shipping.finalCost).toBe(DEFAULT_SHIPPING_COST);
    expect(quote.total).toBe(30000 + DEFAULT_SHIPPING_COST);
  });
});
