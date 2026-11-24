import { z } from 'zod';

export const quoteCartSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string().min(1, 'El productId es requerido'),
        variantId: z.string().optional().nullable(),
        quantity: z.number().int().positive().default(1),
      })
    )
    .min(1, 'El carrito debe contener al menos un producto'),
  couponCode: z.string().optional().nullable(),
  paymentMethod: z.string().optional().nullable(),
  customerEmail: z.string().optional().nullable(),
  customerPhone: z.string().optional().nullable(),
  shippingContext: z
    .object({
      deliveryMethod: z.enum(['PICKUP', 'DELIVERY']).optional(),
      postalCode: z.string().optional().nullable(),
      province: z.string().optional().nullable(),
    })
    .optional(),
});
