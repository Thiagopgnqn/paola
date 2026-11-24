import { z } from 'zod';

export const createTagSchema = z.object({
  name: z.string().trim().min(2, 'El nombre debe tener al menos 2 caracteres'),
  slug: z.string().trim().optional(),
});

export const assignTagsSchema = z.object({
  productId: z.string(),
  tagIds: z.array(z.string()),
});
