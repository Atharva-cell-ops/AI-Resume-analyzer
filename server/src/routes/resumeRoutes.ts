import { Router } from 'express';
import {
  createResume,
  listResumes,
  getResumeById,
  updateResume,
  deleteResume,
  duplicateResume,
  listResumeVersions,
  restoreResumeVersion,
  tailorResumeForJob,
  getResumeScoreHistory
} from '../controllers/resumeController.js';
import { authenticateJwt } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';
import { createResumeSchema, updateResumeSchema } from '@ai-resume/shared';

const router = Router();

// Protect all resume routes
router.use(authenticateJwt);

router.post('/', validateBody(createResumeSchema), createResume);
router.get('/', listResumes);
router.get('/:id', getResumeById);
router.put('/:id', validateBody(updateResumeSchema), updateResume);
router.delete('/:id', deleteResume);
router.post('/:id/duplicate', duplicateResume);

// Versioning routes
router.get('/:id/versions', listResumeVersions);
router.post('/:id/versions/:versionNumber/restore', restoreResumeVersion);

// Tailoring and score history routes
router.post('/:id/tailor', tailorResumeForJob);
router.get('/:id/score-history', getResumeScoreHistory);

export default router;
