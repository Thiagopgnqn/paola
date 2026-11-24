import rateLimit from 'express-rate-limit';

export const authLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5,
  message: { error: 'Too many requests, please try again later.' },
});

export const cartQuoteLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 60, // 60 cotizaciones cada 15 min por IP para evitar fuerza bruta de cupones
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Demasiadas consultas de cotización de carrito. Por favor aguardá unos minutos.' },
});
