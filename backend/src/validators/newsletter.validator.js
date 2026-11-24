import { z } from 'zod';

export const subscribeNewsletterSchema = z.object({
  email: z
    .string()
    .trim()
    .min(5, 'Ingresá un correo electrónico')
    .email('Ingresá un correo electrónico válido'),
  consentGiven: z.literal(true, {
    errorMap: () => ({
      message:
        'Debés aceptar el consentimiento explícito de protección de datos (Ley 25.326) para suscribirte.',
    }),
  }),
});

export const unsubscribeNewsletterSchema = z.object({
  email: z
    .string()
    .trim()
    .min(5, 'Ingresá un correo electrónico')
    .email('Ingresá un correo electrónico válido'),
});
