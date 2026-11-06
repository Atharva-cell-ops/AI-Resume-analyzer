import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/prisma.js';
import { exportResumeToPdf } from '../services/export/pdfExporter.js';
import { exportResumeToDocx } from '../services/export/docxExporter.js';
import { AppError } from '../middleware/errorHandler.js';
import { ResumeData, TemplateId } from '@ai-resume/shared';

function sanitizeFilename(name: string): string {
  return name.trim().replace(/[^a-zA-Z0-9_\-]/g, '_') || 'Resume';
}

async function resolveResumeContent(
  req: Request
): Promise<{ content: ResumeData; templateId: TemplateId; fullName: string }> {
  const { resumeId, content, templateId } = req.body;

  let resumeContent: ResumeData | undefined = content;
  let chosenTemplate: TemplateId = templateId || 'ats-classic';

  if (resumeId) {
    const resume = await prisma.resume.findUnique({
      where: { id: resumeId }
    });
    if (!resume) {
      throw new AppError('Resume not found', 404, 'RESUME_NOT_FOUND');
    }
    resumeContent = resume.content as unknown as ResumeData;
    chosenTemplate = (resume.templateId as TemplateId) || chosenTemplate;
  }

  if (!resumeContent || !resumeContent.personalInfo) {
    throw new AppError('Valid resume content or resumeId is required for export', 400, 'INVALID_PAYLOAD');
  }

  const fullName = resumeContent.personalInfo.fullName || 'Resume';
  return { content: resumeContent, templateId: chosenTemplate, fullName };
}

export async function handleExportPdf(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { content, templateId, fullName } = await resolveResumeContent(req);

    const pdfBuffer = await exportResumeToPdf(content, templateId);
    const filename = `${sanitizeFilename(fullName)}_ATS_Resume.pdf`;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', pdfBuffer.length);
    res.status(200).send(pdfBuffer);
  } catch (error) {
    next(error);
  }
}

export async function handleExportDocx(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { content, templateId, fullName } = await resolveResumeContent(req);

    const docxBuffer = await exportResumeToDocx(content, templateId);
    const filename = `${sanitizeFilename(fullName)}_ATS_Resume.docx`;

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', docxBuffer.length);
    res.status(200).send(docxBuffer);
  } catch (error) {
    next(error);
  }
}

