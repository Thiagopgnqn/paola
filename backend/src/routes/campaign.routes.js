import { Router } from 'express';
import * as campaignController from '../controllers/campaign.controller.js';
import { auth } from '../middleware/auth.js';
import { admin } from '../middleware/admin.js';
import { validate } from '../middleware/validate.js';
import { createCampaignSchema, updateCampaignSchema } from '../validators/campaign.validator.js';

const router = Router();

// Rutas públicas de campañas (para storefront y páginas /campanas/:slug)
router.get('/active', campaignController.getActiveCampaign);
router.get('/public/:slug', campaignController.getPublicCampaignBySlug);
router.post('/:id/view', campaignController.recordCampaignView);
router.post('/view/:slug', campaignController.recordCampaignViewBySlug);

router.use(auth, admin);

router.get('/', campaignController.getCampaigns);
router.get('/:id', campaignController.getCampaignById);
router.post('/', validate(createCampaignSchema), campaignController.createCampaign);
router.put('/:id', validate(updateCampaignSchema), campaignController.updateCampaign);
router.delete('/:id', campaignController.deleteCampaign);
router.post('/:id/duplicate', campaignController.duplicateCampaign);
router.patch('/:id/status', campaignController.updateCampaignStatus);
router.patch('/:id/end', campaignController.endCampaign);
router.patch('/:id/archive', campaignController.archiveCampaign);

export default router;
