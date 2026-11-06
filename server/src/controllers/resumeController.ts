import { Response, NextFunction } from 'express';
import { prisma } from '../config/prisma.js';
import { AuthRequest } from '../middleware/auth.js';
import { AppError } from '../middleware/errorHandler.js';
import { ApiResponse, ResumeData, TemplateId } from '@ai-resume/shared';

// Initial default blank resume
export const DEFAULT_RESUME_CONTENT: ResumeData = {
  personalInfo: {
    fullName: 'Alex Morgan',
    email: 'alex.morgan@example.com',
    phone: '+1 (555) 234-5678',
    location: 'San Francisco, CA',
    linkedin: 'https://linkedin.com/in/alexmorgan',
    github: 'https://github.com/alexmorgan',
    website: 'https://alexmorgan.dev'
  },
  summary: 'Results-driven Full Stack Software Engineer with 4+ years of experience designing, developing, and scaling high-performance web applications and distributed microservices. Proven expertise in React, TypeScript, Node.js, and cloud native architectures.',
  education: [
    {
      id: 'edu-1',
      institution: 'University of California, Berkeley',
      degree: 'Bachelor of Science',
      fieldOfStudy: 'Computer Science',
      startDate: '2018',
      endDate: '2022',
      gpa: '3.85/4.0',
      honors: 'Dean\'s Honors List'
    }
  ],
  experience: [
    {
      id: 'exp-1',
      company: 'TechFlow Solutions',
      position: 'Senior Software Engineer',
      location: 'San Francisco, CA',
      startDate: '2022',
      endDate: 'Present',
      current: true,
      bullets: [
        'Architected and deployed a real-time event streaming pipeline using Node.js and Kafka, reducing latency by 42%.',
        'Led a squad of 5 engineers to deliver client-facing dashboard features using React and TypeScript, increasing user retention by 18%.',
        'Optimized PostgreSQL database query execution plans and caching with Redis, reducing peak server load by 35%.'
      ]
    },
    {
      id: 'exp-2',
      company: 'Innovate Apps',
      position: 'Software Engineer',
      location: 'San Jose, CA',
      startDate: '2021',
      endDate: '2022',
      current: false,
      bullets: [
        'Developed reusable UI component library in React, cutting frontend feature turnaround time by 25%.',
        'Implemented end-to-end automated testing pipelines with Playwright, decreasing production bug leakage by 30%.'
      ]
    }
  ],
  projects: [
    {
      id: 'proj-1',
      name: 'CloudMetrics — Distributed Monitoring Dashboard',
      role: 'Creator & Maintainer',
      link: 'https://github.com/alexmorgan/cloudmetrics',
      technologies: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Docker'],
      bullets: [
        'Constructed open-source telemetry monitoring platform handling over 500,000 daily metrics events.',
        'Authored comprehensive Docker Compose setup and GitHub Actions CI workflow with 95% test coverage.'
      ]
    }
  ],
  skills: [
    {
      category: 'Languages',
      items: ['TypeScript', 'JavaScript', 'Python', 'SQL', 'HTML5', 'CSS3']
    },
    {
      category: 'Frameworks & Libraries',
      items: ['React', 'Next.js', 'Express.js', 'Node.js', 'Tailwind CSS', 'Redux Toolkit']
    },
    {
      category: 'Databases & Tools',
      items: ['PostgreSQL', 'Redis', 'Docker', 'Prisma ORM', 'Git', 'GitHub Actions', 'AWS']
    }
  ],
  certifications: [
    {
      id: 'cert-1',
      name: 'AWS Certified Solutions Architect – Associate',
      issuer: 'Amazon Web Services',
      issueDate: '2023',
      credentialId: 'AWS-ASA-892102'
    }
  ],
  achievements: [
    {
      id: 'ach-1',
      title: 'First Place — Silicon Valley Hackathon 2023',
      description: 'Built an AI-assisted accessibility reader within 36 hours among 120 competing engineering teams.',
      date: '2023'
    }
  ]
};

// Create a new resume
export async function createResume(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      throw new AppError('Unauthorized', 401, 'UNAUTHORIZED');
    }

    const { title, templateId, content } = req.body;

    const resumeContent = content || DEFAULT_RESUME_CONTENT;

    const resume = await prisma.resume.create({
      data: {
        userId,
        title: title || 'Untitled Resume',
        templateId: templateId || 'ats-classic',
        currentVersion: 1,
        content: resumeContent,
        versions: {
          create: {
            versionNumber: 1,
            changeSummary: 'Initial creation',
            content: resumeContent
          }
        }
      },
      include: {
        versions: true
      }
    });

    const response: ApiResponse = {
      success: true,
      message: 'Resume created successfully',
      data: resume
    };

    res.status(201).json(response);
  } catch (error) {
    next(error);
  }
}

// List all resumes for current user
export async function listResumes(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      throw new AppError('Unauthorized', 401, 'UNAUTHORIZED');
    }

    const resumes = await prisma.resume.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        title: true,
        templateId: true,
        currentVersion: true,
        createdAt: true,
        updatedAt: true,
        atsReports: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: {
            overallScore: true,
            createdAt: true
          }
        }
      }
    });

    const response: ApiResponse = {
      success: true,
      data: resumes
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
}

// Get resume by ID
export async function getResumeById(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;

    if (!userId) {
      throw new AppError('Unauthorized', 401, 'UNAUTHORIZED');
    }

    const resume = await prisma.resume.findFirst({
      where: { id, userId },
      include: {
        versions: {
          orderBy: { versionNumber: 'desc' }
        },
        atsReports: {
          orderBy: { createdAt: 'desc' },
          take: 5
        }
      }
    });

    if (!resume) {
      throw new AppError('Resume not found', 404, 'RESUME_NOT_FOUND');
    }

    const response: ApiResponse = {
      success: true,
      data: resume
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
}

// Update resume (autosave or explicit save with version increment)
export async function updateResume(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;
    const { title, templateId, content, changeSummary } = req.body;

    if (!userId) {
      throw new AppError('Unauthorized', 401, 'UNAUTHORIZED');
    }

    const existingResume = await prisma.resume.findFirst({
      where: { id, userId }
    });

    if (!existingResume) {
      throw new AppError('Resume not found', 404, 'RESUME_NOT_FOUND');
    }

    const shouldIncrementVersion = Boolean(changeSummary);
    const nextVersion = shouldIncrementVersion ? existingResume.currentVersion + 1 : existingResume.currentVersion;

    const updatedResume = await prisma.resume.update({
      where: { id },
      data: {
        ...(title ? { title } : {}),
        ...(templateId ? { templateId } : {}),
        ...(content ? { content } : {}),
        currentVersion: nextVersion,
        ...(shouldIncrementVersion && content
          ? {
              versions: {
                create: {
                  versionNumber: nextVersion,
                  changeSummary: changeSummary || `Version ${nextVersion}`,
                  content
                }
              }
            }
          : {})
      },
      include: {
        versions: {
          orderBy: { versionNumber: 'desc' },
          take: 5
        }
      }
    });

    const response: ApiResponse = {
      success: true,
      message: 'Resume updated successfully',
      data: updatedResume
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
}

// Delete resume
export async function deleteResume(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;

    if (!userId) {
      throw new AppError('Unauthorized', 401, 'UNAUTHORIZED');
    }

    const existing = await prisma.resume.findFirst({
      where: { id, userId }
    });

    if (!existing) {
      throw new AppError('Resume not found', 404, 'RESUME_NOT_FOUND');
    }

    await prisma.resume.delete({
      where: { id }
    });

    const response: ApiResponse = {
      success: true,
      message: 'Resume deleted successfully'
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
}

// Duplicate resume
export async function duplicateResume(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;

    if (!userId) {
      throw new AppError('Unauthorized', 401, 'UNAUTHORIZED');
    }

    const source = await prisma.resume.findFirst({
      where: { id, userId }
    });

    if (!source) {
      throw new AppError('Resume not found', 404, 'RESUME_NOT_FOUND');
    }

    const duplicated = await prisma.resume.create({
      data: {
        userId,
        title: `${source.title} (Copy)`,
        templateId: source.templateId,
        currentVersion: 1,
        content: source.content as any,
        versions: {
          create: {
            versionNumber: 1,
            changeSummary: 'Duplicated from ' + source.title,
            content: source.content as any
          }
        }
      }
    });

    const response: ApiResponse = {
      success: true,
      message: 'Resume duplicated successfully',
      data: duplicated
    };

    res.status(201).json(response);
  } catch (error) {
    next(error);
  }
}

// List all historical versions for a resume
export async function listResumeVersions(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;

    if (!userId) {
      throw new AppError('Unauthorized', 401, 'UNAUTHORIZED');
    }

    const versions = await prisma.resumeVersion.findMany({
      where: {
        resumeId: id,
        resume: { userId }
      },
      orderBy: { versionNumber: 'desc' }
    });

    const response: ApiResponse = {
      success: true,
      data: versions
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
}

// Restore a historical version as the active content
export async function restoreResumeVersion(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user?.userId;
    const { id, versionNumber } = req.params;
    const vNum = parseInt(versionNumber, 10);

    if (!userId) {
      throw new AppError('Unauthorized', 401, 'UNAUTHORIZED');
    }

    const resume = await prisma.resume.findFirst({
      where: { id, userId }
    });

    if (!resume) {
      throw new AppError('Resume not found', 404, 'RESUME_NOT_FOUND');
    }

    const targetVersion = await prisma.resumeVersion.findUnique({
      where: {
        resumeId_versionNumber: {
          resumeId: id,
          versionNumber: vNum
        }
      }
    });

    if (!targetVersion) {
      throw new AppError('Version not found', 404, 'VERSION_NOT_FOUND');
    }

    const nextVersionNumber = resume.currentVersion + 1;

    const updated = await prisma.resume.update({
      where: { id },
      data: {
        content: targetVersion.content as any,
        currentVersion: nextVersionNumber,
        versions: {
          create: {
            versionNumber: nextVersionNumber,
            changeSummary: `Restored from version ${vNum}`,
            content: targetVersion.content as any
          }
        }
      },
      include: {
        versions: {
          orderBy: { versionNumber: 'desc' },
          take: 5
        }
      }
    });

    const response: ApiResponse = {
      success: true,
      message: `Successfully restored version ${vNum} as version ${nextVersionNumber}`,
      data: updated
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
}

// Tailor a resume for a specific job (Clones and scores against target JD)
export async function tailorResumeForJob(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;
    const { jobTitle, company, jobDescription } = req.body;

    if (!userId) {
      throw new AppError('Unauthorized', 401, 'UNAUTHORIZED');
    }

    if (!jobDescription || typeof jobDescription !== 'string') {
      throw new AppError('jobDescription is required to tailor resume', 400, 'INVALID_INPUT');
    }

    const source = await prisma.resume.findFirst({
      where: { id, userId }
    });

    if (!source) {
      throw new AppError('Resume not found', 404, 'RESUME_NOT_FOUND');
    }

    const sourceContent = source.content as unknown as ResumeData;
    const targetLabel = company || jobTitle || 'Target Job';

    // 1. Create cloned tailored resume
    const tailoredResume = await prisma.resume.create({
      data: {
        userId,
        title: `${source.title} (${targetLabel})`,
        templateId: source.templateId,
        currentVersion: 1,
        content: sourceContent as any,
        versions: {
          create: {
            versionNumber: 1,
            changeSummary: `Tailored for ${targetLabel}`,
            content: sourceContent as any
          }
        }
      }
    });

    // 2. Create Job Description record
    const jdRecord = await prisma.jobDescription.create({
      data: {
        userId,
        title: jobTitle || 'Tailored Role',
        company: company || '',
        rawText: jobDescription
      }
    });

    // 3. Score against target JD using ATS engine
    const { extractTextFromResumeData } = await import('../services/parser/fileTextExtractor.js');
    const { atsScoringEngine } = await import('../services/ats/scoringEngine.js');

    const extracted = extractTextFromResumeData(sourceContent);
    const scoreResult = atsScoringEngine.scoreResume(extracted.text, jobDescription, {
      fileType: 'json'
    });

    // 4. Save ATS report
    const atsReport = await prisma.atsReport.create({
      data: {
        resumeId: tailoredResume.id,
        jobDescriptionId: jdRecord.id,
        overallScore: scoreResult.overallScore,
        breakdown: scoreResult.breakdown as any,
        matchedKeywords: scoreResult.matchedKeywords as any,
        missingKeywords: scoreResult.missingKeywords as any,
        actionableTips: scoreResult.suggestions as any
      }
    });

    const response: ApiResponse = {
      success: true,
      message: `Resume successfully tailored for ${targetLabel}`,
      data: {
        tailoredResume,
        atsReport,
        analysis: scoreResult
      }
    };

    res.status(201).json(response);
  } catch (error) {
    next(error);
  }
}

// Get score history for a resume
export async function getResumeScoreHistory(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;

    if (!userId) {
      throw new AppError('Unauthorized', 401, 'UNAUTHORIZED');
    }

    const reports = await prisma.atsReport.findMany({
      where: {
        resumeId: id,
        resume: { userId }
      },
      orderBy: { createdAt: 'asc' },
      select: {
        id: true,
        overallScore: true,
        createdAt: true,
        jobDescription: {
          select: {
            title: true,
            company: true
          }
        }
      }
    });

    const response: ApiResponse = {
      success: true,
      data: reports
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
}

