import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { renderResumeToHtml } from '../src/services/export/htmlRenderer.js';
import { exportResumeToDocx } from '../src/services/export/docxExporter.js';
import { DEFAULT_RESUME_CONTENT } from '../src/controllers/resumeController.js';

const app = createApp();

describe('Export Service & Endpoints', () => {
  describe('HTML Rendering for PDF generation', () => {
    it('renders ats-classic template with standard serif styling and headings', () => {
      const html = renderResumeToHtml(DEFAULT_RESUME_CONTENT, 'ats-classic');
      expect(html).toContain('<!DOCTYPE html>');
      expect(html).toContain('Alex Morgan');
      expect(html).toContain('Professional Summary');
      expect(html).toContain('Work Experience');
      expect(html).toContain('Technical Projects');
      expect(html).toContain('Georgia');
    });

    it('renders ats-modern template with geometric sans styling', () => {
      const html = renderResumeToHtml(DEFAULT_RESUME_CONTENT, 'ats-modern');
      expect(html).toContain('<!DOCTYPE html>');
      expect(html).toContain('Alex Morgan');
      expect(html).toContain('border-bottom: 2px solid');
    });

    it('renders ats-minimal template with compact line-height', () => {
      const html = renderResumeToHtml(DEFAULT_RESUME_CONTENT, 'ats-minimal');
      expect(html).toContain('<!DOCTYPE html>');
      expect(html).toContain('Alex Morgan');
      expect(html).toContain('size: 9.5pt');
    });
  });

  describe('DOCX Export Service', () => {
    it('generates a valid DOCX Buffer from ResumeData', async () => {
      const buffer = await exportResumeToDocx(DEFAULT_RESUME_CONTENT, 'ats-classic');
      expect(buffer).toBeDefined();
      expect(Buffer.isBuffer(buffer)).toBe(true);
      expect(buffer.length).toBeGreaterThan(1000); // Standard docx zip header is >1KB
    });
  });

  describe('Export Endpoints via HTTP', () => {
    it('POST /api/export/docx returns 200 and document stream', async () => {
      const res = await request(app)
        .post('/api/export/docx')
        .send({
          content: DEFAULT_RESUME_CONTENT,
          templateId: 'ats-classic'
        });

      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toContain('officedocument.wordprocessingml.document');
      expect(res.headers['content-disposition']).toContain('attachment');
      expect(res.body).toBeDefined();
    });

    it('POST /api/export/pdf rejects request with missing content or resumeId', async () => {
      const res = await request(app)
        .post('/api/export/pdf')
        .send({});

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('INVALID_PAYLOAD');
    });
  });
});

