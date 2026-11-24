import { describe, it, expect, beforeAll } from 'vitest';
import * as campaignService from '../../backend/src/services/campaign.service.js';
import * as couponService from '../../backend/src/services/coupon.service.js';
import * as collectionService from '../../backend/src/services/collection.service.js';
import * as tagService from '../../backend/src/services/tag.service.js';
import * as auditService from '../../backend/src/services/audit.service.js';
import { markDbDown } from '../../backend/src/services/dbState.js';

describe('Marketing & Admin API Services (Part 2)', () => {
  beforeAll(() => {
    // Force fast snapshot fallback for test environment without active Postgres instance
    markDbDown(3600000);
  });

  describe('Campaigns & Promotions Service (Integridad con DB no disponible)', () => {
    it('should reject creating a campaign with HTTP 503 when DB is down', async () => {
      const now = new Date();
      const campaignData = {
        name: 'Test Hot Sale',
        slug: `test-hot-sale-${Date.now()}`,
        description: 'Campaña especial de prueba para Hot Sale',
        badgeText: 'HOT SALE',
        startDate: now.toISOString(),
        endDate: new Date(now.getTime() + 86400 * 1000 * 7).toISOString(),
        priority: 80,
        status: 'ACTIVE',
        promotions: [
          {
            name: '20% OFF en Todo',
            type: 'PERCENTAGE',
            scope: 'ORDER',
            value: 20,
            active: true,
          },
        ],
      };

      await expect(campaignService.createCampaign(campaignData)).rejects.toMatchObject({
        status: 503,
        message: expect.stringContaining('Base de datos no disponible'),
      });
    });

    it('should retrieve the list of campaigns in read-only mode from snapshot', async () => {
      const campaigns = await campaignService.getCampaigns();
      expect(Array.isArray(campaigns)).toBe(true);
    });

    it('should reject updating campaign with HTTP 503 when DB is down', async () => {
      await expect(campaignService.updateCampaign('camp_any', { name: 'New' })).rejects.toMatchObject({
        status: 503,
      });
    });

    it('should reject deleting campaign with HTTP 503 when DB is down', async () => {
      await expect(campaignService.deleteCampaign('camp_any')).rejects.toMatchObject({
        status: 503,
      });
    });
  });

  describe('Coupons Service (Integridad con DB no disponible)', () => {
    it('should reject creating a coupon with HTTP 503 when DB is down', async () => {
      const couponData = {
        code: `PROMO${Date.now()}`,
        type: 'PERCENT',
        value: 15,
        minOrderAmount: 20000,
        maxDiscountAmount: 5000,
        maxUses: 100,
        maxUsesPerUser: 1,
        active: true,
      };

      await expect(couponService.createCoupon(couponData)).rejects.toMatchObject({
        status: 503,
        message: expect.stringContaining('Base de datos no disponible'),
      });
    });

    it('should reject updating coupon with HTTP 503 when DB is down', async () => {
      await expect(couponService.updateCoupon('coupon_any', { active: false })).rejects.toMatchObject({
        status: 503,
      });
    });

    it('should reject deleting coupon with HTTP 503 when DB is down', async () => {
      await expect(couponService.deleteCoupon('coupon_any')).rejects.toMatchObject({
        status: 503,
      });
    });
  });

  describe('Collections & Tags Service', () => {
    let createdCollectionId = null;
    let createdTagId = null;

    it('should create and list tags', async () => {
      const tag = await tagService.createTag({
        name: `Test Tag ${Date.now()}`,
        color: '#D97706',
      });
      expect(tag).toBeDefined();
      expect(tag.id).toBeDefined();
      expect(tag.color).toBe('#D97706');
      createdTagId = tag.id;

      const tags = await tagService.getTags();
      expect(tags.some((t) => t.id === createdTagId)).toBe(true);
    });

    it('should create a collection with items', async () => {
      const collection = await collectionService.createCollection({
        name: 'Selección Especial Parejas',
        slug: `parejas-test-${Date.now()}`,
        description: 'Artículos seleccionados para disfrutar juntos',
        active: true,
        items: [],
      });
      expect(collection).toBeDefined();
      expect(collection.id).toBeDefined();
      expect(collection.name).toBe('Selección Especial Parejas');
      createdCollectionId = collection.id;
    });

    it('should delete collection and tag', async () => {
      await collectionService.deleteCollection(createdCollectionId);
      await tagService.deleteTag(createdTagId);

      const tagsAfter = await tagService.getTags();
      expect(tagsAfter.some((t) => t.id === createdTagId)).toBe(false);
    });
  });

  describe('Audit Price History Service', () => {
    it('should retrieve price history for products', async () => {
      const history = await auditService.getPriceHistory();
      expect(history).toBeDefined();
      expect(Array.isArray(history.items)).toBe(true);
      if (history.items.length > 0) {
        expect(history.items[0]).toHaveProperty('productId');
        expect(history.items[0]).toHaveProperty('newPrice');
      }
    });
  });
});
