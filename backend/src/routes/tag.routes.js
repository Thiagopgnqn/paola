import { Router } from 'express';
import * as tagController from '../controllers/tag.controller.js';
import { auth } from '../middleware/auth.js';
import { admin } from '../middleware/admin.js';
import { validate } from '../middleware/validate.js';
import { createTagSchema, assignTagsSchema } from '../validators/tag.validator.js';

const router = Router();

router.use(auth, admin);

router.get('/', tagController.getTags);
router.post('/', validate(createTagSchema), tagController.createTag);
router.delete('/:id', tagController.deleteTag);
router.post('/assign', validate(assignTagsSchema), tagController.assignTagsToProduct);

export default router;
