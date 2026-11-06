import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/prisma.js';
import { atsScoringEngine } from '../services/ats/scoringEngine.js';
import {
  extractTextFromPdf,
  extractTextFromDocx,
  extractTextFromResumeData,
  ExtractedDocument
} from '../services/parser/fileTextExtractor.js';
import { AppError } from '../middleware/errorHandler.js';
import { AuthRequest } from '../middleware/auth.js';
import { ApiResponse, AtsAnalysisResult, ResumeData } from '@ai-resume/shared';

// Analyze structured resume JSON or saved resume
export async function handleAnalyzeResume(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { jobDescription, resumeId, resumeContent, jobTitle, company } = req.body;
    const userId = req.user?.userId;

    if (!jobDescription || typeof jobDescription !== 'string') {
      throw new AppError('jobDescription text is required', 400, 'INVALID_INPUT');
    }

    let extracted: ExtractedDocument;
    let targetResumeId = resumeId;

    if (resumeId) {
      const resume = await prisma.resume.findUnique({
        where: { id: resumeId }
      });
      if (!resume) {
        throw new AppError('Resume not found', 404, 'RESUME_NOT_FOUND');
      }
      extracted = extractTextFromResumeData(resume.content as unknown as ResumeData);
    } else if (resumeContent) {
      extracted = extractTextFromResumeData(resumeContent);
    } else {
      throw new AppError('Either resumeId or resumeContent must be provided', 400, 'INVALID_INPUT');
    }

    const analysisResult = atsScoringEngine.scoreResume(extracted.text, jobDescription, {
      pageCount: extracted.pageCount,
      fileType: extracted.fileType
    });

    let savedReportId: string | undefined;

    // If authenticated and resume exists in DB, persist report
    if (userId && targetResumeId) {
      try {
        let jdRecord = null;
        if (jobDescription.length >= 20) {
          jdRecord = await prisma.jobDescription.create({
            data: {
              userId,
              title: jobTitle || 'Target Role',
              company: company || '',
              rawText: jobDescription
            }
          });
        }

        const report = await prisma.atsReport.create({
          data: {
            resumeId: targetResumeId,
            jobDescriptionId: jdRecord?.id,
            overallScore: analysisResult.overallScore,
            breakdown: analysisResult.breakdown as any,
            matchedKeywords: analysisResult.matchedKeywords as any,
            missingKeywords: analysisResult.missingKeywords as any,
            actionableTips: analysisResult.suggestions as any
          }
        });
        savedReportId = report.id;
      } catch (dbErr) {
        console.warn('Failed to persist AtsReport to DB:', dbErr);
      }
    }

    const response: ApiResponse<AtsAnalysisResult & { reportId?: string }> = {
      success: true,
      message: 'ATS analysis completed successfully',
      data: {
        ...analysisResult,
        reportId: savedReportId
      }
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
}

// Upload file (PDF/DOCX) and score against job description
export async function handleUploadAndAnalyze(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const file = req.file;
    const { jobDescription } = req.body;

    if (!file) {
      throw new AppError('No resume file uploaded. Please upload a PDF or DOCX file.', 400, 'NO_FILE_UPLOADED');
    }

    if (!jobDescription || typeof jobDescription !== 'string') {
      throw new AppError('Job description text is required to calculate match score.', 400, 'INVALID_INPUT');
    }

    let extracted: ExtractedDocument;
    const extension = file.originalname.split('.').pop()?.toLowerCase();

    if (extension === 'pdf' || file.mimetype === 'application/pdf') {
      extracted = await extractTextFromPdf(file.buffer);
    } else if (
      extension === 'docx' ||
      file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ) {
      extracted = await extractTextFromDocx(file.buffer);
    } else {
      throw new AppError('Unsupported file type. Please upload a .pdf or .docx file.', 400, 'UNSUPPORTED_FILE_TYPE');
    }

    const analysisResult = atsScoringEngine.scoreResume(extracted.text, jobDescription, {
      pageCount: extracted.pageCount,
      fileType: extracted.fileType
    });

    const response: ApiResponse<AtsAnalysisResult & { filename: string; pageCount: number }> = {
      success: true,
      message: 'File parsed and analyzed successfully',
      data: {
        ...analysisResult,
        filename: file.originalname,
        pageCount: extracted.pageCount
      }
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
}

