import { Router } from 'express';
import { getSettings, updateSettings } from '../controllers/settings.controller.js';
import { authMiddleware, adminMiddleware } from '../middleware/auth.js';

const router = Router();

// Público: cualquiera puede consultar los costos de envío y configuración de promociones
router.get('/', getSettings);

// Admin: solo administrador puede modificar la configuración
router.put('/', authMiddleware, adminMiddleware, updateSettings);

export default router;
