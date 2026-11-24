import { Router } from 'express';
import * as auditController from '../controllers/audit.controller.js';
import { auth } from '../middleware/auth.js';
import { admin } from '../middleware/admin.js';

const router = Router();

router.use(auth, admin);

router.get('/price-history', auditController.getPriceHistory);
router.get('/marketing', auditController.getMarketingMetrics);

export default router;
