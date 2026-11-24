import { z } from 'zod';

export const createCollectionSchema = z.object({
  name: z.string().trim().min(2, 'El nombre debe tener al menos 2 caracteres'),
  slug: z.string().trim().optional(),
  description: z.string().nullable().optional(),
  active: z.boolean().default(true),
  productIds: z.array(z.string()).optional(),
});

export const updateCollectionSchema = createCollectionSchema.partial();
