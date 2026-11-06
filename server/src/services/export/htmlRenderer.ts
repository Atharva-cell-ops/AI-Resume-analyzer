import { ResumeData, TemplateId } from '@ai-resume/shared';

export function renderResumeToHtml(data: ResumeData, templateId: TemplateId = 'ats-classic'): string {
  const { personalInfo, summary, experience, education, projects, skills, certifications, achievements } = data;

  // Contact line elements
  const contacts = [
    personalInfo.location,
    personalInfo.phone,
    personalInfo.email ? `<a href="mailto:${personalInfo.email}">${personalInfo.email}</a>` : '',
    personalInfo.linkedin ? `<a href="${personalInfo.linkedin}">LinkedIn</a>` : '',
    personalInfo.github ? `<a href="${personalInfo.github}">GitHub</a>` : '',
    personalInfo.website ? `<a href="${personalInfo.website}">Portfolio</a>` : ''
  ].filter(Boolean);

  let templateCss = '';

  if (templateId === 'ats-modern') {
    templateCss = `
      body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; font-size: 10pt; line-height: 1.45; color: #0f172a; margin: 0; padding: 0; }
      h1 { font-size: 20pt; font-weight: 800; margin: 0 0 4px 0; color: #020617; letter-spacing: -0.5px; }
      .contact-bar { font-size: 8.5pt; color: #475569; margin-bottom: 16px; font-weight: 500; }
      .contact-bar a { color: #0f172a; text-decoration: underline; }
      h2 { font-size: 9.5pt; font-weight: 700; text-transform: uppercase; letter-spacing: 1.2px; color: #0f172a; border-bottom: 2px solid #0f172a; padding-bottom: 3px; margin: 14px 0 8px 0; }
      .item-header { display: flex; justify-content: space-between; align-items: baseline; font-weight: 700; font-size: 10pt; color: #020617; }
      .item-sub { font-size: 9pt; color: #334155; margin-bottom: 4px; font-weight: 500; }
      .item-date { font-size: 8.5pt; color: #64748b; font-weight: 600; }
      ul { margin: 4px 0 10px 18px; padding: 0; }
      li { font-size: 9.2pt; color: #334155; margin-bottom: 3px; }
      .skills-cat { font-size: 9pt; margin-bottom: 4px; }
      .skills-cat strong { color: #0f172a; }
    `;
  } else if (templateId === 'ats-minimal') {
    templateCss = `
      body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif; font-size: 9.5pt; line-height: 1.35; color: #111827; margin: 0; padding: 0; }
      h1 { font-size: 18pt; font-weight: 700; margin: 0 0 2px 0; color: #000; }
      .contact-bar { font-size: 8.2pt; color: #374151; margin-bottom: 12px; }
      .contact-bar a { color: #111827; text-decoration: underline; }
      h2 { font-size: 9pt; font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px; color: #000; border-bottom: 1px solid #9ca3af; padding-bottom: 2px; margin: 10px 0 6px 0; }
      .item-header { display: flex; justify-content: space-between; align-items: baseline; font-weight: 700; font-size: 9.5pt; color: #000; }
      .item-sub { font-size: 8.5pt; color: #4b5563; margin-bottom: 2px; }
      .item-date { font-size: 8.2pt; color: #4b5563; font-weight: normal; }
      ul { margin: 2px 0 8px 16px; padding: 0; }
      li { font-size: 8.8pt; color: #1f2937; margin-bottom: 2px; }
      .skills-cat { font-size: 8.8pt; margin-bottom: 3px; }
      .skills-cat strong { color: #000; }
    `;
  } else {
    // ats-classic
    templateCss = `
      body { font-family: "Georgia", "Times New Roman", Times, serif; font-size: 10pt; line-height: 1.45; color: #111827; margin: 0; padding: 0; }
      header { text-align: center; border-bottom: 1px solid #9ca3af; padding-bottom: 8px; margin-bottom: 14px; }
      h1 { font-size: 20pt; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 4px 0; color: #111827; }
      .contact-bar { font-size: 8.5pt; color: #374151; }
      .contact-bar a { color: #111827; text-decoration: underline; }
      h2 { font-size: 9.5pt; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #111827; border-bottom: 1px solid #d1d5db; padding-bottom: 2px; margin: 14px 0 8px 0; }
      .item-header { display: flex; justify-content: space-between; align-items: baseline; font-weight: 700; font-size: 10pt; }
      .item-sub { font-size: 8.5pt; font-style: italic; color: #4b5563; margin-bottom: 3px; }
      .item-date { font-size: 8.5pt; font-weight: normal; color: #4b5563; }
      ul { margin: 3px 0 10px 18px; padding: 0; }
      li { font-size: 9.2pt; color: #1f2937; margin-bottom: 3px; }
      .skills-cat { font-size: 9pt; margin-bottom: 4px; }
      .skills-cat strong { color: #111827; }
    `;
  }

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${escapeHtml(personalInfo.fullName || 'Resume')}</title>
  <style>
    @page {
      size: A4;
      margin: 12mm 15mm 12mm 15mm;
    }
    *, *:before, *:after { box-sizing: border-box; }
    ${templateCss}
  </style>
</head>
<body>
  ${
    templateId === 'ats-classic'
      ? `<header>
          <h1>${escapeHtml(personalInfo.fullName || 'YOUR NAME')}</h1>
          <div class="contact-bar">${contacts.join(' &bull; ')}</div>
        </header>`
      : `<header>
          <h1>${escapeHtml(personalInfo.fullName || 'YOUR NAME')}</h1>
          <div class="contact-bar">${contacts.join(' &bull; ')}</div>
        </header>`
  }

  ${
    summary
      ? `<section>
          <h2>Professional Summary</h2>
          <p style="margin: 0 0 10px 0; font-size: 9.2pt; text-align: justify;">${escapeHtml(summary)}</p>
        </section>`
      : ''
  }

  ${
    experience.length > 0
      ? `<section>
          <h2>Work Experience</h2>
          ${experience
            .map(
              exp => `
            <div style="margin-bottom: 10px;">
              <div class="item-header">
                <span>${escapeHtml(exp.position)} &mdash; ${escapeHtml(exp.company)}</span>
                <span class="item-date">${escapeHtml(exp.startDate)} &ndash; ${exp.current ? 'Present' : escapeHtml(exp.endDate)}</span>
              </div>
              ${exp.location ? `<div class="item-sub">${escapeHtml(exp.location)}</div>` : ''}
              <ul>
                ${exp.bullets.map(b => `<li>${escapeHtml(b)}</li>`).join('')}
              </ul>
            </div>
          `
            )
            .join('')}
        </section>`
      : ''
  }

  ${
    projects.length > 0
      ? `<section>
          <h2>Technical Projects</h2>
          ${projects
            .map(
              proj => `
            <div style="margin-bottom: 8px;">
              <div class="item-header">
                <span>${escapeHtml(proj.name)}${proj.role ? ` (${escapeHtml(proj.role)})` : ''}</span>
                ${proj.link ? `<a href="${proj.link}" class="item-date" style="text-decoration: underline;">View Project</a>` : ''}
              </div>
              ${proj.technologies.length > 0 ? `<div class="item-sub">Technologies: ${escapeHtml(proj.technologies.join(', '))}</div>` : ''}
              <ul>
                ${proj.bullets.map(b => `<li>${escapeHtml(b)}</li>`).join('')}
              </ul>
            </div>
          `
            )
            .join('')}
        </section>`
      : ''
  }

  ${
    education.length > 0
      ? `<section>
          <h2>Education</h2>
          ${education
            .map(
              edu => `
            <div style="margin-bottom: 6px;">
              <div class="item-header">
                <span>${escapeHtml(edu.institution)}</span>
                <span class="item-date">${escapeHtml(edu.startDate)} &ndash; ${escapeHtml(edu.endDate)}</span>
              </div>
              <div class="item-sub">
                ${escapeHtml(edu.degree)} in ${escapeHtml(edu.fieldOfStudy)}
                ${edu.gpa ? ` &bull; GPA: ${escapeHtml(edu.gpa)}` : ''}
                ${edu.honors ? ` (${escapeHtml(edu.honors)})` : ''}
              </div>
            </div>
          `
            )
            .join('')}
        </section>`
      : ''
  }

  ${
    skills.length > 0
      ? `<section>
          <h2>Skills & Competencies</h2>
          <div style="margin-bottom: 8px;">
            ${skills
              .map(
                cat => `
              <div class="skills-cat">
                <strong>${escapeHtml(cat.category)}:</strong> ${escapeHtml(cat.items.join(', '))}
              </div>
            `
              )
              .join('')}
          </div>
        </section>`
      : ''
  }

  ${
    certifications.length > 0
      ? `<section>
          <h2>Certifications</h2>
          <div style="margin-bottom: 8px;">
            ${certifications
              .map(
                cert => `
              <div class="item-header" style="font-weight: normal; margin-bottom: 3px;">
                <span><strong>${escapeHtml(cert.name)}</strong> &mdash; ${escapeHtml(cert.issuer)}${cert.credentialId ? ` (ID: ${escapeHtml(cert.credentialId)})` : ''}</span>
                <span class="item-date">${escapeHtml(cert.issueDate)}</span>
              </div>
            `
              )
              .join('')}
          </div>
        </section>`
      : ''
  }

  ${
    achievements.length > 0
      ? `<section>
          <h2>Honors & Achievements</h2>
          <div style="margin-bottom: 8px;">
            ${achievements
              .map(
                ach => `
              <div class="item-header" style="font-weight: normal; margin-bottom: 3px;">
                <span><strong>${escapeHtml(ach.title)}:</strong> ${escapeHtml(ach.description)}</span>
                ${ach.date ? `<span class="item-date">${escapeHtml(ach.date)}</span>` : ''}
              </div>
            `
              )
              .join('')}
          </div>
        </section>`
      : ''
  }
</body>
</html>`;
}

function escapeHtml(text: string): string {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

