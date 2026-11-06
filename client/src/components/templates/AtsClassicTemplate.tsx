import React from 'react';
import { ResumeData } from '@ai-resume/shared';

export const AtsClassicTemplate: React.FC<{ data: ResumeData }> = ({ data }) => {
  const { personalInfo, summary, experience, education, projects, skills, certifications, achievements } = data;

  return (
    <div className="bg-white text-gray-900 font-serif p-8 max-w-[800px] mx-auto text-[13px] leading-relaxed shadow-sm min-h-[1050px]">
      {/* Header */}
      <header className="text-center border-b border-gray-400 pb-3 mb-4">
        <h1 className="text-2xl font-bold tracking-wide uppercase text-gray-900 mb-1">
          {personalInfo.fullName || 'YOUR NAME'}
        </h1>
        <div className="flex flex-wrap justify-center items-center gap-x-2 text-xs text-gray-700">
          {personalInfo.location && <span>{personalInfo.location}</span>}
          {personalInfo.phone && <span>• {personalInfo.phone}</span>}
          {personalInfo.email && (
            <span>
              • <a href={`mailto:${personalInfo.email}`} className="text-gray-900 underline">{personalInfo.email}</a>
            </span>
          )}
          {personalInfo.linkedin && (
            <span>
              • <a href={personalInfo.linkedin} target="_blank" rel="noreferrer" className="text-gray-900 underline">LinkedIn</a>
            </span>
          )}
          {personalInfo.github && (
            <span>
              • <a href={personalInfo.github} target="_blank" rel="noreferrer" className="text-gray-900 underline">GitHub</a>
            </span>
          )}
          {personalInfo.website && (
            <span>
              • <a href={personalInfo.website} target="_blank" rel="noreferrer" className="text-gray-900 underline">Portfolio</a>
            </span>
          )}
        </div>
      </header>

      {/* Professional Summary */}
      {summary && (
        <section className="mb-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-gray-900 border-b border-gray-300 pb-0.5 mb-1.5">
            Professional Summary
          </h2>
          <p className="text-gray-800 text-justify leading-normal">{summary}</p>
        </section>
      )}

      {/* Work Experience */}
      {experience.length > 0 && (
        <section className="mb-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-gray-900 border-b border-gray-300 pb-0.5 mb-2">
            Work Experience
          </h2>
          <div className="space-y-3">
            {experience.map(exp => (
              <div key={exp.id}>
                <div className="flex justify-between items-baseline font-bold">
                  <span>{exp.position} — <span className="font-semibold text-gray-800">{exp.company}</span></span>
                  <span className="text-xs font-normal text-gray-600">
                    {exp.startDate} – {exp.current ? 'Present' : exp.endDate}
                  </span>
                </div>
                {exp.location && <div className="text-xs italic text-gray-600 mb-1">{exp.location}</div>}
                <ul className="list-disc list-outside ml-4 space-y-1 text-gray-800 text-xs">
                  {exp.bullets.map((bullet, i) => (
                    <li key={i}>{bullet}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Projects */}
      {projects.length > 0 && (
        <section className="mb-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-gray-900 border-b border-gray-300 pb-0.5 mb-2">
            Technical Projects
          </h2>
          <div className="space-y-2.5">
            {projects.map(proj => (
              <div key={proj.id}>
                <div className="flex justify-between items-baseline">
                  <span className="font-bold">
                    {proj.name}
                    {proj.role && <span className="font-normal italic text-gray-600"> ({proj.role})</span>}
                  </span>
                  {proj.link && (
                    <a href={proj.link} target="_blank" rel="noreferrer" className="text-xs text-gray-700 underline">
                      View Project
                    </a>
                  )}
                </div>
                {proj.technologies.length > 0 && (
                  <div className="text-xs text-gray-600 italic mb-0.5">
                    Technologies: {proj.technologies.join(', ')}
                  </div>
                )}
                <ul className="list-disc list-outside ml-4 space-y-0.5 text-gray-800 text-xs">
                  {proj.bullets.map((b, idx) => (
                    <li key={idx}>{b}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Education */}
      {education.length > 0 && (
        <section className="mb-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-gray-900 border-b border-gray-300 pb-0.5 mb-2">
            Education
          </h2>
          <div className="space-y-2">
            {education.map(edu => (
              <div key={edu.id} className="flex justify-between items-baseline">
                <div>
                  <div className="font-bold">{edu.institution}</div>
                  <div className="text-xs text-gray-800">
                    {edu.degree} in {edu.fieldOfStudy}
                    {edu.gpa && <span className="text-gray-600"> • GPA: {edu.gpa}</span>}
                    {edu.honors && <span className="text-gray-600"> ({edu.honors})</span>}
                  </div>
                </div>
                <div className="text-xs text-gray-600 font-normal">
                  {edu.startDate} – {edu.endDate}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Skills */}
      {skills.length > 0 && (
        <section className="mb-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-gray-900 border-b border-gray-300 pb-0.5 mb-1.5">
            Skills & Competencies
          </h2>
          <div className="space-y-1 text-xs">
            {skills.map((cat, idx) => (
              <div key={idx}>
                <strong className="text-gray-900">{cat.category}: </strong>
                <span className="text-gray-800">{cat.items.join(', ')}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Certifications */}
      {certifications.length > 0 && (
        <section className="mb-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-gray-900 border-b border-gray-300 pb-0.5 mb-1.5">
            Certifications
          </h2>
          <div className="space-y-1 text-xs">
            {certifications.map(cert => (
              <div key={cert.id} className="flex justify-between">
                <div>
                  <strong className="text-gray-900">{cert.name}</strong> — {cert.issuer}
                  {cert.credentialId && <span className="text-gray-600"> (ID: {cert.credentialId})</span>}
                </div>
                <div className="text-gray-600">{cert.issueDate}</div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Achievements */}
      {achievements.length > 0 && (
        <section>
          <h2 className="text-xs font-bold uppercase tracking-wider text-gray-900 border-b border-gray-300 pb-0.5 mb-1.5">
            Honors & Achievements
          </h2>
          <div className="space-y-1 text-xs">
            {achievements.map(ach => (
              <div key={ach.id} className="flex justify-between items-baseline">
                <div>
                  <strong className="text-gray-900">{ach.title}: </strong>
                  <span className="text-gray-800">{ach.description}</span>
                </div>
                {ach.date && <div className="text-gray-600 ml-4 shrink-0">{ach.date}</div>}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

