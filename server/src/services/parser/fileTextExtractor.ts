import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';
import { ResumeData } from '@ai-resume/shared';
import { AppError } from '../../middleware/errorHandler.js';

export interface ExtractedDocument {
  text: string;
  pageCount: number;
  fileType: 'pdf' | 'docx' | 'txt' | 'json';
}

/**
 * Extract raw text from PDF buffer using pdf-parse
 */
export async function extractTextFromPdf(buffer: Buffer): Promise<ExtractedDocument> {
  try {
    const data = await pdfParse(buffer);
    return {
      text: data.text || '',
      pageCount: data.numpages || 1,
      fileType: 'pdf'
    };
  } catch (error) {
    throw new AppError('Failed to parse PDF document. It may be corrupt or encrypted.', 400, 'PDF_PARSE_FAILED');
  }
}

/**
 * Extract raw text from DOCX buffer using mammoth
 */
export async function extractTextFromDocx(buffer: Buffer): Promise<ExtractedDocument> {
  try {
    const result = await mammoth.extractRawText({ buffer });
    // Approximate page count for docx (standard ~500 words/page)
    const words = result.value.trim().split(/\s+/).filter(Boolean).length;
    const estimatedPages = Math.max(1, Math.ceil(words / 450));
    return {
      text: result.value || '',
      pageCount: estimatedPages,
      fileType: 'docx'
    };
  } catch (error) {
    throw new AppError('Failed to parse DOCX document.', 400, 'DOCX_PARSE_FAILED');
  }
}

/**
 * Converts structured ResumeData to a unified plain text representation for the ATS engine
 */
export function extractTextFromResumeData(data: ResumeData): ExtractedDocument {
  const parts: string[] = [];

  // Personal Info
  parts.push(data.personalInfo.fullName || '');
  parts.push(data.personalInfo.email || '');
  parts.push(data.personalInfo.phone || '');
  parts.push(data.personalInfo.location || '');
  if (data.personalInfo.linkedin) parts.push(data.personalInfo.linkedin);
  if (data.personalInfo.github) parts.push(data.personalInfo.github);
  if (data.personalInfo.website) parts.push(data.personalInfo.website);

  // Summary
  if (data.summary) {
    parts.push('\nPROFESSIONAL SUMMARY\n' + data.summary);
  }

  // Experience
  if (data.experience.length > 0) {
    parts.push('\nWORK EXPERIENCE');
    for (const exp of data.experience) {
      parts.push(`${exp.position} at ${exp.company} (${exp.startDate} - ${exp.current ? 'Present' : exp.endDate})`);
      if (exp.location) parts.push(exp.location);
      for (const bullet of exp.bullets) {
        parts.push(`• ${bullet}`);
      }
    }
  }

  // Projects
  if (data.projects.length > 0) {
    parts.push('\nPROJECTS');
    for (const proj of data.projects) {
      parts.push(`${proj.name} ${proj.role ? `(${proj.role})` : ''}`);
      if (proj.technologies.length > 0) parts.push(`Technologies: ${proj.technologies.join(', ')}`);
      for (const bullet of proj.bullets) {
        parts.push(`• ${bullet}`);
      }
    }
  }

  // Education
  if (data.education.length > 0) {
    parts.push('\nEDUCATION');
    for (const edu of data.education) {
      parts.push(`${edu.institution}: ${edu.degree} in ${edu.fieldOfStudy} (${edu.startDate} - ${edu.endDate})`);
      if (edu.gpa) parts.push(`GPA: ${edu.gpa}`);
    }
  }

  // Skills
  if (data.skills.length > 0) {
    parts.push('\nSKILLS');
    for (const cat of data.skills) {
      parts.push(`${cat.category}: ${cat.items.join(', ')}`);
    }
  }

  // Certifications
  if (data.certifications.length > 0) {
    parts.push('\nCERTIFICATIONS');
    for (const cert of data.certifications) {
      parts.push(`${cert.name} - ${cert.issuer} (${cert.issueDate})`);
    }
  }

  // Achievements
  if (data.achievements.length > 0) {
    parts.push('\nACHIEVEMENTS');
    for (const ach of data.achievements) {
      parts.push(`${ach.title}: ${ach.description} (${ach.date || ''})`);
    }
  }

  const fullText = parts.join('\n');
  const words = fullText.trim().split(/\s+/).filter(Boolean).length;
  const pageCount = Math.max(1, Math.ceil(words / 450));

  return {
    text: fullText,
    pageCount,
    fileType: 'json'
  };
}

