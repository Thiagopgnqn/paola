import { Router } from 'express';
import * as couponController from '../controllers/coupon.controller.js';
import { auth } from '../middleware/auth.js';
import { admin } from '../middleware/admin.js';
import { validate } from '../middleware/validate.js';
import { createCouponSchema, updateCouponSchema } from '../validators/coupon.validator.js';

const router = Router();

router.use(auth, admin);

router.get('/export/csv', couponController.exportCsv);
router.get('/', couponController.getCoupons);
router.get('/:id', couponController.getCouponById);
router.post('/', validate(createCouponSchema), couponController.createCoupon);
router.put('/:id', validate(updateCouponSchema), couponController.updateCoupon);
router.delete('/:id', couponController.deleteCoupon);
router.patch('/:id/toggle', couponController.toggleCoupon);

export default router;
