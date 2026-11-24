import { Router } from 'express';
import * as newsletterController from '../controllers/newsletter.controller.js';
import { auth } from '../middleware/auth.js';
import { admin } from '../middleware/admin.js';
import { validate } from '../middleware/validate.js';
import {
  subscribeNewsletterSchema,
  unsubscribeNewsletterSchema,
} from '../validators/newsletter.validator.js';

const router = Router();

// Public newsletter endpoints
router.post('/subscribe', validate(subscribeNewsletterSchema), newsletterController.subscribe);
router.post('/unsubscribe', validate(unsubscribeNewsletterSchema), newsletterController.unsubscribe);

// Admin-protected endpoints
router.get('/admin/subscribers', auth, admin, newsletterController.listSubscribers);
router.get('/admin/export', auth, admin, newsletterController.exportCsv);

export default router;
