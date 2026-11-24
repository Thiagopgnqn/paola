import { describe, it, expect, beforeEach } from 'vitest';
import { computeMarketingMetrics } from './index.js';
import {
  subscribeNewsletterSchema,
  unsubscribeNewsletterSchema,
} from '../../backend/src/validators/newsletter.validator.js';

describe('Parte 5: Métricas, UTM, Newsletter y Atribución', () => {
  describe('Cálculo de Métricas de Marketing (computeMarketingMetrics)', () => {
    const sampleCampaigns = [
      {
        id: 'camp_bf',
        name: 'Black Friday 2026',
        slug: 'black-friday',
        status: 'ACTIVE',
        views: 200,
      },
      {
        id: 'camp_cyber',
        name: 'Cyber Sale',
        slug: 'cyber-sale',
        status: 'SCHEDULED',
        views: 50,
      },
    ];

    const sampleCoupons = [
      {
        id: 'coup_bf',
        code: 'BLACKFRIDAY',
        type: 'PERCENT',
        value: 15,
        active: true,
      },
    ];

    const sampleOrders = [
      {
        id: 'ord_1',
        total: 85000,
        couponCode: 'BLACKFRIDAY',
        couponDiscount: 15000,
        paymentMethodDiscount: 8500,
        shippingDiscount: 0,
        utm_source: 'instagram',
        utm_medium: 'social',
        utm_campaign: 'black-friday',
        status: 'CONFIRMED',
        createdAt: new Date().toISOString(),
        items: [
          { productId: 'p1', name: 'Vibrador Lujo', quantity: 1, price: 85000 },
        ],
      },
      {
        id: 'ord_2',
        total: 45000,
        couponCode: null,
        couponDiscount: 0,
        paymentMethodDiscount: 4500,
        shippingDiscount: 3500,
        utm_source: 'whatsapp',
        utm_medium: 'chat',
        utm_campaign: 'black-friday',
        status: 'CONFIRMED',
        createdAt: new Date().toISOString(),
        items: [
          { productId: 'p2', name: 'Aceite de Masajes', quantity: 2, price: 22500 },
        ],
      },
      {
        id: 'ord_3',
        total: 100000,
        couponCode: null,
        couponDiscount: 0,
        paymentMethodDiscount: 0,
        shippingDiscount: 0,
        utm_source: 'facebook',
        utm_medium: 'cpc',
        utm_campaign: 'cyber-sale',
        status: 'CANCELLED', // Pedido cancelado debe excluirse si se filtra antes
        createdAt: new Date().toISOString(),
        items: [
          { productId: 'p1', name: 'Vibrador Lujo', quantity: 1, price: 100000 },
        ],
      },
    ];

    it('calcula los totales generales de ventas, pedidos y descuentos correctamente', () => {
      // Filtrar órdenes válidas (excluir canceladas)
      const validOrders = sampleOrders.filter((o) => o.status !== 'CANCELLED');
      const metrics = computeMarketingMetrics({
        orders: validOrders,
        campaigns: sampleCampaigns,
        coupons: sampleCoupons,
        range: '30d',
      });

      expect(metrics.overview.totalOrders).toBe(2);
      expect(metrics.overview.totalRevenue).toBe(130000); // 85000 + 45000
      expect(metrics.overview.totalDiscounts).toBe(31500); // (15000+8500) + (4500+3500)
      expect(metrics.overview.averageTicket).toBe(65000); // 130000 / 2
      expect(metrics.overview.totalUnits).toBe(3); // 1 + 2
    });

    it('calcula métricas de campaña y tasa de conversión sobre visitas anónimas', () => {
      const validOrders = sampleOrders.filter((o) => o.status !== 'CANCELLED');
      const metrics = computeMarketingMetrics({
        orders: validOrders,
        campaigns: sampleCampaigns,
        coupons: sampleCoupons,
        range: '30d',
      });

      const bfCamp = metrics.campaigns.find((c) => c.slug === 'black-friday');
      expect(bfCamp).toBeDefined();
      expect(bfCamp.views).toBe(200);
      expect(bfCamp.ordersCount).toBe(2);
      expect(bfCamp.revenue).toBe(130000);
      expect(bfCamp.unitsSold).toBe(3);
      // Tasa de conversión: (2 / 200) * 100 = 1.00%
      expect(bfCamp.conversionRate).toBe(1);
      expect(bfCamp.averageTicket).toBe(65000);
      expect(bfCamp.sourcesBreakdown.instagram).toBe(1);
      expect(bfCamp.sourcesBreakdown.whatsapp).toBe(1);
    });

    it('calcula redenciones e ingresos generados por cada cupón', () => {
      const validOrders = sampleOrders.filter((o) => o.status !== 'CANCELLED');
      const metrics = computeMarketingMetrics({
        orders: validOrders,
        campaigns: sampleCampaigns,
        coupons: sampleCoupons,
        range: '30d',
      });

      const bfCoupon = metrics.coupons.find((c) => c.code === 'BLACKFRIDAY');
      expect(bfCoupon).toBeDefined();
      expect(bfCoupon.redemptionsCount).toBe(1);
      expect(bfCoupon.totalDiscountGranted).toBe(15000);
      expect(bfCoupon.totalRevenueGenerated).toBe(85000);
      expect(bfCoupon.averageTicket).toBe(85000);
    });

    it('agrupa pedidos e ingresos por canal de atribución UTM (source, campaign, medium)', () => {
      const validOrders = sampleOrders.filter((o) => o.status !== 'CANCELLED');
      const metrics = computeMarketingMetrics({
        orders: validOrders,
        campaigns: sampleCampaigns,
        coupons: sampleCoupons,
        range: '30d',
      });

      const bySource = metrics.utmAttribution.bySource;
      const igSource = bySource.find((s) => s.source === 'instagram');
      const waSource = bySource.find((s) => s.source === 'whatsapp');

      expect(igSource).toBeDefined();
      expect(igSource.orders).toBe(1);
      expect(igSource.revenue).toBe(85000);

      expect(waSource).toBeDefined();
      expect(waSource.orders).toBe(1);
      expect(waSource.revenue).toBe(45000);
    });
  });

  describe('Validación de Newsletter (Ley 25.326)', () => {
    it('valida suscripción válida con consentimiento explícito', () => {
      const validPayload = {
        email: 'cliente@ejemplo.com',
        consentGiven: true,
      };

      const result = subscribeNewsletterSchema.safeParse(validPayload);
      expect(result.success).toBe(true);
    });

    it('rechaza suscripción si consentGiven no es estrictamente true (Ley 25.326)', () => {
      const missingConsent = {
        email: 'cliente@ejemplo.com',
        consentGiven: false,
      };

      const result = subscribeNewsletterSchema.safeParse(missingConsent);
      expect(result.success).toBe(false);
      expect(result.error.issues[0].message).toContain('Ley 25.326');
    });

    it('rechaza correo electrónico con formato inválido', () => {
      const invalidEmail = {
        email: 'no-es-un-email',
        consentGiven: true,
      };

      const result = subscribeNewsletterSchema.safeParse(invalidEmail);
      expect(result.success).toBe(false);
    });

    it('valida desuscripción con email válido', () => {
      const unsubPayload = {
        email: 'baja@ejemplo.com',
      };

      const result = unsubscribeNewsletterSchema.safeParse(unsubPayload);
      expect(result.success).toBe(true);
    });
  });
});
