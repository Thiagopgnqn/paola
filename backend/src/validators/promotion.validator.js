import { z } from 'zod';

export const createPromotionSchema = z.object({
  campaignId: z.string().nullable().optional(),
  name: z.string().trim().min(2, 'El nombre debe tener al menos 2 caracteres'),
  kind: z.enum([
    'PERCENT',
    'FIXED_AMOUNT',
    'FIXED_PRICE',
    'BUY_X_PAY_Y',
    'BUNDLE_PRICE',
    'TIERED',
    'FREE_SHIPPING',
    'PAYMENT_METHOD',
  ]),
  value: z.number().nullable().optional(),
  minQuantity: z.number().int().nullable().optional(),
  minOrderAmount: z.number().nullable().optional(),
  maxDiscountAmount: z.number().nullable().optional(),
  tiers: z.any().nullable().optional(),
  buyQuantity: z.number().int().nullable().optional(),
  payQuantity: z.number().int().nullable().optional(),
  bundleSkus: z.any().nullable().optional(),
  paymentMethod: z.string().nullable().optional(),
  stackable: z.boolean().default(false),
  startsAt: z.string().nullable().optional(),
  endsAt: z.string().nullable().optional(),
  active: z.boolean().default(true),
  usageLimit: z.number().int().nullable().optional(),
  priority: z.number().int().default(0),
  targets: z
    .array(
      z.object({
        targetType: z.enum(['PRODUCT', 'VARIANT', 'CATEGORY', 'SUBCATEGORY', 'TAG', 'COLLECTION', 'ALL']),
        targetId: z.string().nullable().optional(),
        excluded: z.boolean().default(false),
      })
    )
    .optional(),
});

export const updatePromotionSchema = createPromotionSchema.partial();
