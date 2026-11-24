import { Router } from 'express';
import * as collectionController from '../controllers/collection.controller.js';
import { auth } from '../middleware/auth.js';
import { admin } from '../middleware/admin.js';
import { validate } from '../middleware/validate.js';
import { createCollectionSchema, updateCollectionSchema } from '../validators/collection.validator.js';

const router = Router();

router.use(auth, admin);

router.get('/', collectionController.getCollections);
router.get('/:id', collectionController.getCollectionById);
router.post('/', validate(createCollectionSchema), collectionController.createCollection);
router.put('/:id', validate(updateCollectionSchema), collectionController.updateCollection);
router.delete('/:id', collectionController.deleteCollection);

export default router;
