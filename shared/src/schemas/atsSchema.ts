import { z } from 'zod';
import { resumeDataSchema } from './resumeSchema.js';

export const analyzeRequestSchema = z.object({
  jobDescription: z.string().min(20, 'Job description must be at least 20 characters long'),
  resumeId: z.string().uuid().optional(),
  resumeContent: resumeDataSchema.optional(),
  jobTitle: z.string().optional(),
  company: z.string().optional()
}).refine(data => data.resumeId || data.resumeContent, {
  message: 'Either resumeId or resumeContent must be provided',
  path: ['resumeId']
});

export const bulletHelperSchema = z.object({
  bullet: z.string().min(1, 'Bullet text is required'),
  targetRole: z.string().optional()
});

