import { z } from 'zod';

export const createCouponSchema = z.object({
  code: z
    .string()
    .trim()
    .min(2, 'El código debe tener al menos 2 caracteres')
    .regex(/^[a-zA-Z0-9_-]+$/, 'El código solo puede contener letras, números, guiones y guiones bajos'),
  kind: z.enum(['PERCENT', 'FIXED_AMOUNT', 'FREE_SHIPPING']),
  value: z.number().min(0, 'El valor no puede ser negativo'),
  minOrderAmount: z.number().nullable().optional(),
  maxDiscountAmount: z.number().nullable().optional(),
  startsAt: z.string().nullable().optional(),
  endsAt: z.string().nullable().optional(),
  usageLimitTotal: z.number().int().nullable().optional(),
  usageLimitPerCustomer: z.number().int().nullable().optional(),
  active: z.boolean().default(true),
  campaignId: z.string().nullable().optional(),
  appliesTo: z.string().default('ALL'),
  stackableWithPromotions: z.boolean().default(false),
});

export const updateCouponSchema = createCouponSchema.partial();
