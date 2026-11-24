import { Router } from 'express';
import * as promotionController from '../controllers/promotion.controller.js';
import { auth } from '../middleware/auth.js';
import { admin } from '../middleware/admin.js';
import { validate } from '../middleware/validate.js';
import { createPromotionSchema, updatePromotionSchema } from '../validators/promotion.validator.js';

const router = Router();

router.use(auth, admin);

router.get('/', promotionController.getPromotions);
router.get('/:id', promotionController.getPromotionById);
router.post('/', validate(createPromotionSchema), promotionController.createPromotion);
router.put('/:id', validate(updatePromotionSchema), promotionController.updatePromotion);
router.delete('/:id', promotionController.deletePromotion);
router.patch('/:id/toggle', promotionController.togglePromotion);

export default router;
