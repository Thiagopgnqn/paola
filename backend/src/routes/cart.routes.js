import { Router } from 'express';
import { quoteCart } from '../controllers/cart.controller.js';
import { validate } from '../middleware/validate.js';
import { quoteCartSchema } from '../validators/cart.validator.js';
import { cartQuoteLimiter } from '../middleware/rateLimiter.js';

const router = Router();

router.post('/quote', cartQuoteLimiter, validate(quoteCartSchema), quoteCart);

export default router;
