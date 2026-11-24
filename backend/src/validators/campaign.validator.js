import { z } from 'zod';

export const createCampaignSchema = z.object({
  name: z.string().trim().min(2, 'El nombre debe tener al menos 2 caracteres'),
  slug: z.string().trim().optional(),
  status: z.enum(['DRAFT', 'SCHEDULED', 'ACTIVE', 'ENDED', 'ARCHIVED']).default('DRAFT'),
  startsAt: z.string().nullable().optional(),
  endsAt: z.string().nullable().optional(),
  priority: z.number().int().default(0),
  active: z.boolean().default(true),
  headline: z.string().nullable().optional(),
  subheadline: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  bannerUrl: z.string().nullable().optional(),
  bannerImage: z.string().nullable().optional(),
  theme: z.string().nullable().optional(),
  themeConfig: z.string().nullable().optional(),
  announcementText: z.string().nullable().optional(),
  announcementLink: z.string().nullable().optional(),
  conditionsText: z.string().nullable().optional(),
  showCountdown: z.boolean().optional().default(false),
  landingEnabled: z.boolean().optional().default(true),
  seoTitle: z.string().nullable().optional(),
  seoDescription: z.string().nullable().optional(),
  promotions: z
    .array(
      z.object({
        name: z.string().min(2),
        kind: z.string(),
        value: z.number().optional().nullable(),
        minQuantity: z.number().optional().nullable(),
        minOrderAmount: z.number().optional().nullable(),
        maxDiscountAmount: z.number().optional().nullable(),
        tiers: z.any().optional().nullable(),
        buyQuantity: z.number().optional().nullable(),
        payQuantity: z.number().optional().nullable(),
        bundleSkus: z.any().optional().nullable(),
        paymentMethod: z.string().optional().nullable(),
        stackable: z.boolean().optional().default(false),
        targets: z
          .array(
            z.object({
              targetType: z.string(),
              targetId: z.string().nullable().optional(),
              excluded: z.boolean().optional().default(false),
            })
          )
          .optional(),
      })
    )
    .optional(),
});

export const updateCampaignSchema = createCampaignSchema.partial();
