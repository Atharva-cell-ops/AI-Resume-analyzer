import { Router } from 'express';
import authRoutes from './authRoutes.js';
import resumeRoutes from './resumeRoutes.js';
import atsRoutes from './atsRoutes.js';
import exportRoutes from './exportRoutes.js';

const router = Router();

// Health check endpoint
router.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Mounted subrouters
router.use('/auth', authRoutes);
router.use('/resumes', resumeRoutes);
router.use('/ats', atsRoutes);
router.use('/export', exportRoutes);

export default router;
