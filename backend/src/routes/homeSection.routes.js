import { Router } from 'express';
import * as homeSectionController from '../controllers/homeSection.controller.js';
import { auth } from '../middleware/auth.js';
import { admin } from '../middleware/admin.js';
import { validate } from '../middleware/validate.js';
import {
  createHomeSectionSchema,
  updateHomeSectionSchema,
  reorderHomeSectionsSchema,
  applyTemplateSchema,
} from '../validators/homeSection.validator.js';

const router = Router();

// Ruta pública para cargar secciones de la portada (o con preview)
router.get('/', homeSectionController.getHomeSections);

// Rutas protegidas para administración de la portada
router.post('/', auth, admin, validate(createHomeSectionSchema), homeSectionController.createHomeSection);
router.put('/reorder', auth, admin, validate(reorderHomeSectionsSchema), homeSectionController.reorderHomeSections);
router.post('/apply-template', auth, admin, validate(applyTemplateSchema), homeSectionController.applyTemplate);
router.put('/:id', auth, admin, validate(updateHomeSectionSchema), homeSectionController.updateHomeSection);
router.delete('/:id', auth, admin, homeSectionController.deleteHomeSection);

export default router;
