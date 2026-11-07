import { Router } from 'express';
import { register, login, refresh, logout, getMe, googleAuth } from '../controllers/authController.js';
import { validateBody } from '../middleware/validate.js';
import { authenticateJwt } from '../middleware/auth.js';
import { registerSchema, loginSchema } from '@ai-resume/shared';

const router = Router();

router.post('/register', validateBody(registerSchema), register);
router.post('/login', validateBody(loginSchema), login);
router.post('/google', googleAuth);
router.post('/refresh', refresh);
router.post('/logout', logout);
router.get('/me', authenticateJwt, getMe);

export default router;

