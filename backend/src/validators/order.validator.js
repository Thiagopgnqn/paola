import { z } from 'zod';

export const createOrderSchema = z.object({
  customerName: z.string().trim().min(2, 'Ingresá tu nombre'),
  customerPhone: z.string().trim().min(6, 'Ingresá un teléfono válido'),
  customerEmail: z.string().trim().email('Ingresá un email válido'),
  customerAddress: z.string().optional().nullable(),
  customerProvince: z.string().optional().nullable(),
  customerCity: z.string().optional().nullable(),
  customerPostalCode: z.string().optional().nullable(),
  deliveryMethod: z.enum(['PICKUP', 'DELIVERY']),
  comments: z.string().optional().nullable(),
  couponCode: z.string().optional().nullable(),
  paymentMethod: z.string().optional().nullable(),
  utm_source: z.string().optional().nullable(),
  utm_medium: z.string().optional().nullable(),
  utm_campaign: z.string().optional().nullable(),
  items: z
    .array(
      z.object({
        productId: z.string(),
        variantId: z.string().optional().nullable(),
        variantDescription: z.string().optional().nullable(),
        quantity: z.number().int().positive(),
      })
    )
    .min(1, 'El carrito no puede estar vacío'),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum(['PENDING', 'CONFIRMED', 'DELIVERED', 'CANCELLED']),
  adminNotes: z.string().optional(),
});
