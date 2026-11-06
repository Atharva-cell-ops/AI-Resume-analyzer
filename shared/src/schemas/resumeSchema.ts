import { z } from 'zod';

export const personalInfoSchema = z.object({
  fullName: z.string().default(''),
  email: z.string().default(''),
  phone: z.string().default(''),
  location: z.string().default(''),
  linkedin: z.string().optional().default(''),
  github: z.string().optional().default(''),
  website: z.string().optional().default('')
});

export const educationItemSchema = z.object({
  id: z.string(),
  institution: z.string().default(''),
  degree: z.string().default(''),
  fieldOfStudy: z.string().default(''),
  startDate: z.string().default(''),
  endDate: z.string().default(''),
  current: z.boolean().optional(),
  gpa: z.string().optional(),
  honors: z.string().optional()
});

export const experienceItemSchema = z.object({
  id: z.string(),
  company: z.string().default(''),
  position: z.string().default(''),
  location: z.string().optional(),
  startDate: z.string().default(''),
  endDate: z.string().default(''),
  current: z.boolean().optional(),
  bullets: z.array(z.string()).default([])
});

export const projectItemSchema = z.object({
  id: z.string(),
  name: z.string().default(''),
  role: z.string().optional(),
  link: z.string().optional().default(''),
  technologies: z.array(z.string()).default([]),
  bullets: z.array(z.string()).default([])
});

export const skillCategorySchema = z.object({
  category: z.string().default(''),
  items: z.array(z.string()).default([])
});

export const certificationItemSchema = z.object({
  id: z.string(),
  name: z.string().default(''),
  issuer: z.string().default(''),
  issueDate: z.string().default(''),
  expiryDate: z.string().optional(),
  credentialId: z.string().optional(),
  url: z.string().optional().default('')
});

export const achievementItemSchema = z.object({
  id: z.string(),
  title: z.string().default(''),
  description: z.string().default(''),
  date: z.string().optional()
});

export const resumeDataSchema = z.object({
  personalInfo: personalInfoSchema,
  summary: z.string().default(''),
  education: z.array(educationItemSchema).default([]),
  experience: z.array(experienceItemSchema).default([]),
  projects: z.array(projectItemSchema).default([]),
  skills: z.array(skillCategorySchema).default([]),
  certifications: z.array(certificationItemSchema).default([]),
  achievements: z.array(achievementItemSchema).default([])
});

export const createResumeSchema = z.object({
  title: z.string().min(1, 'Resume title is required').max(120),
  templateId: z.enum(['ats-classic', 'ats-modern', 'ats-minimal']).default('ats-classic').optional(),
  content: resumeDataSchema.optional()
});

export const updateResumeSchema = z.object({
  title: z.string().min(1).max(120).optional(),
  templateId: z.enum(['ats-classic', 'ats-modern', 'ats-minimal']).optional(),
  content: resumeDataSchema.optional(),
  changeSummary: z.string().max(200).optional()
});
