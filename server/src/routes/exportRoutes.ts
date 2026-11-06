import { Router } from 'express';
import { handleExportPdf, handleExportDocx } from '../controllers/exportController.js';

const router = Router();

// PDF & DOCX export endpoints
router.post('/pdf', handleExportPdf);
router.post('/docx', handleExportDocx);

export default router;

