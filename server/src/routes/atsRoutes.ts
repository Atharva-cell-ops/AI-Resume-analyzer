import { Router } from 'express';
import multer from 'multer';
import { handleAnalyzeResume, handleUploadAndAnalyze } from '../controllers/atsController.js';
import { handleBulletHelper } from '../controllers/bulletHelperController.js';
import { validateBody } from '../middleware/validate.js';
import { bulletHelperSchema } from '@ai-resume/shared';
import { AppError } from '../middleware/errorHandler.js';

const router = Router();

// Multer memory storage config for uploaded resume files
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024 // 5 MB max
  },
  fileFilter: (_req, file, cb) => {
    const isPdf = file.mimetype === 'application/pdf' || file.originalname.toLowerCase().endsWith('.pdf');
    const isDocx =
      file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      file.originalname.toLowerCase().endsWith('.docx');

    if (isPdf || isDocx) {
      cb(null, true);
    } else {
      cb(new AppError('Only .pdf and .docx resume files are supported.', 400, 'INVALID_FILE_TYPE'));
    }
  }
});

// Real-time per-bullet helper
router.post('/bullet-helper', validateBody(bulletHelperSchema), handleBulletHelper);

// Analyze structured resume JSON or resume ID
router.post('/analyze', handleAnalyzeResume);

// File upload and ATS analyze
router.post('/upload-and-analyze', upload.single('resume'), handleUploadAndAnalyze);

export default router;
