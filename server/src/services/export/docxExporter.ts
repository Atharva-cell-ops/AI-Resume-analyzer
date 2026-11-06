import {
  Document,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  Packer,
  BorderStyle
} from 'docx';
import { ResumeData, TemplateId } from '@ai-resume/shared';

export async function exportResumeToDocx(data: ResumeData, _templateId: TemplateId = 'ats-classic'): Promise<Buffer> {
  const { personalInfo, summary, experience, education, projects, skills, certifications, achievements } = data;

  const children: Paragraph[] = [];

  // 1. Header: Full Name
  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 80 },
      children: [
        new TextRun({
          text: (personalInfo.fullName || 'YOUR NAME').toUpperCase(),
          bold: true,
          size: 32, // 16pt
          font: 'Arial'
        })
      ]
    })
  );

  // 2. Contact details line
  const contactParts = [
    personalInfo.location,
    personalInfo.phone,
    personalInfo.email,
    personalInfo.linkedin,
    personalInfo.github,
    personalInfo.website
  ].filter(Boolean);

  if (contactParts.length > 0) {
    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 200 },
        border: {
          bottom: { style: BorderStyle.SINGLE, size: 6, color: '888888' }
        },
        children: [
          new TextRun({
            text: contactParts.join('  •  '),
            size: 18, // 9pt
            font: 'Arial'
          })
        ]
      })
    );
  }

  // Section heading helper
  const addSectionHeader = (title: string) => {
    children.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 240, after: 120 },
        border: {
          bottom: { style: BorderStyle.SINGLE, size: 6, color: '333333' }
        },
        children: [
          new TextRun({
            text: title.toUpperCase(),
            bold: true,
            size: 20, // 10pt
            font: 'Arial',
            color: '000000'
          })
        ]
      })
    );
  };

  // 3. Summary
  if (summary) {
    addSectionHeader('Professional Summary');
    children.push(
      new Paragraph({
        spacing: { after: 160 },
        children: [
          new TextRun({
            text: summary,
            size: 19,
            font: 'Arial'
          })
        ]
      })
    );
  }

  // 4. Work Experience
  if (experience.length > 0) {
    addSectionHeader('Work Experience');
    for (const exp of experience) {
      children.push(
        new Paragraph({
          spacing: { before: 120, after: 40 },
          children: [
            new TextRun({
              text: `${exp.position} — ${exp.company}`,
              bold: true,
              size: 20,
              font: 'Arial'
            }),
            new TextRun({
              text: `\t${exp.startDate} – ${exp.current ? 'Present' : exp.endDate}`,
              italics: true,
              size: 18,
              font: 'Arial'
            })
          ]
        })
      );

      if (exp.location) {
        children.push(
          new Paragraph({
            spacing: { after: 60 },
            children: [
              new TextRun({
                text: exp.location,
                italics: true,
                size: 17,
                font: 'Arial',
                color: '555555'
              })
            ]
          })
        );
      }

      for (const bullet of exp.bullets) {
        children.push(
          new Paragraph({
            bullet: { level: 0 },
            spacing: { after: 40 },
            children: [
              new TextRun({
                text: bullet,
                size: 19,
                font: 'Arial'
              })
            ]
          })
        );
      }
    }
  }

  // 5. Projects
  if (projects.length > 0) {
    addSectionHeader('Technical Projects');
    for (const proj of projects) {
      children.push(
        new Paragraph({
          spacing: { before: 100, after: 40 },
          children: [
            new TextRun({
              text: proj.name + (proj.role ? ` (${proj.role})` : ''),
              bold: true,
              size: 20,
              font: 'Arial'
            }),
            ...(proj.link
              ? [
                  new TextRun({
                    text: `\t${proj.link}`,
                    size: 17,
                    font: 'Arial'
                  })
                ]
              : [])
          ]
        })
      );

      if (proj.technologies.length > 0) {
        children.push(
          new Paragraph({
            spacing: { after: 40 },
            children: [
              new TextRun({
                text: `Technologies: ${proj.technologies.join(', ')}`,
                italics: true,
                size: 17,
                font: 'Arial',
                color: '555555'
              })
            ]
          })
        );
      }

      for (const bullet of proj.bullets) {
        children.push(
          new Paragraph({
            bullet: { level: 0 },
            spacing: { after: 40 },
            children: [
              new TextRun({
                text: bullet,
                size: 19,
                font: 'Arial'
              })
            ]
          })
        );
      }
    }
  }

  // 6. Education
  if (education.length > 0) {
    addSectionHeader('Education');
    for (const edu of education) {
      children.push(
        new Paragraph({
          spacing: { before: 80, after: 40 },
          children: [
            new TextRun({
              text: edu.institution,
              bold: true,
              size: 20,
              font: 'Arial'
            }),
            new TextRun({
              text: `\t${edu.startDate} – ${edu.endDate}`,
              italics: true,
              size: 18,
              font: 'Arial'
            })
          ]
        })
      );

      const subParts = [
        `${edu.degree} in ${edu.fieldOfStudy}`,
        edu.gpa ? `GPA: ${edu.gpa}` : '',
        edu.honors ? `(${edu.honors})` : ''
      ].filter(Boolean);

      children.push(
        new Paragraph({
          spacing: { after: 80 },
          children: [
            new TextRun({
              text: subParts.join(' • '),
              size: 18,
              font: 'Arial'
            })
          ]
        })
      );
    }
  }

  // 7. Skills
  if (skills.length > 0) {
    addSectionHeader('Technical Skills');
    for (const cat of skills) {
      children.push(
        new Paragraph({
          spacing: { after: 60 },
          children: [
            new TextRun({
              text: `${cat.category}: `,
              bold: true,
              size: 19,
              font: 'Arial'
            }),
            new TextRun({
              text: cat.items.join(', '),
              size: 19,
              font: 'Arial'
            })
          ]
        })
      );
    }
  }

  // 8. Certifications
  if (certifications.length > 0) {
    addSectionHeader('Certifications');
    for (const cert of certifications) {
      children.push(
        new Paragraph({
          spacing: { after: 60 },
          children: [
            new TextRun({
              text: `${cert.name} — ${cert.issuer}`,
              bold: true,
              size: 19,
              font: 'Arial'
            }),
            new TextRun({
              text: `\t${cert.issueDate}`,
              size: 18,
              font: 'Arial'
            })
          ]
        })
      );
    }
  }

  // 9. Achievements
  if (achievements.length > 0) {
    addSectionHeader('Honors & Achievements');
    for (const ach of achievements) {
      children.push(
        new Paragraph({
          spacing: { after: 60 },
          children: [
            new TextRun({
              text: `${ach.title}: `,
              bold: true,
              size: 19,
              font: 'Arial'
            }),
            new TextRun({
              text: ach.description,
              size: 19,
              font: 'Arial'
            })
          ]
        })
      );
    }
  }

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 720, // 0.5 in
              bottom: 720,
              left: 720,
              right: 720
            }
          }
        },
        children
      }
    ]
  });

  return await Packer.toBuffer(doc);
}

