import { z } from 'zod';

export const homeSectionTypes = [
  'HERO',
  'CAMPAIGN_BANNER',
  'PRODUCT_GRID',
  'CATEGORY_GRID',
  'COLLECTION',
  'COUNTDOWN',
  'TEXT_BLOCK',
  'BENEFITS',
  'FAQ',
  'NEWSLETTER',
];

export const createHomeSectionSchema = z.object({
  campaignId: z.string().nullable().optional(),
  type: z.enum(homeSectionTypes, {
    errorMap: () => ({ message: 'Tipo de sección no válido' }),
  }),
  order: z.number().int().default(0),
  enabled: z.boolean().default(true),
  config: z.any().optional(),
  startsAt: z.string().nullable().optional(),
  endsAt: z.string().nullable().optional(),
});

export const updateHomeSectionSchema = z.object({
  type: z.enum(homeSectionTypes).optional(),
  order: z.number().int().optional(),
  enabled: z.boolean().optional(),
  config: z.any().optional(),
  startsAt: z.string().nullable().optional(),
  endsAt: z.string().nullable().optional(),
});

export const reorderHomeSectionsSchema = z.object({
  items: z.array(
    z.object({
      id: z.string(),
      order: z.number().int(),
    })
  ).min(1, 'Debe incluir al menos un ítem para reordenar'),
});

export const applyTemplateSchema = z.object({
  campaignId: z.string().nullable().optional(),
  templateKey: z.string().min(1, 'Clave de plantilla requerida'),
});
