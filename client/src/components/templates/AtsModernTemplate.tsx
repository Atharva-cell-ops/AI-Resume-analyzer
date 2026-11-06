import React from 'react';
import { ResumeData } from '@ai-resume/shared';

export const AtsModernTemplate: React.FC<{ data: ResumeData }> = ({ data }) => {
  const { personalInfo, summary, experience, education, projects, skills, certifications, achievements } = data;

  return (
    <div className="bg-white text-slate-900 font-sans p-8 max-w-[800px] mx-auto text-[13px] leading-relaxed shadow-sm min-h-[1050px]">
      {/* Header */}
      <header className="mb-4">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-950 mb-1">
          {personalInfo.fullName || 'YOUR NAME'}
        </h1>
        <div className="flex flex-wrap items-center gap-x-3 text-xs text-slate-600 font-medium">
          {personalInfo.location && <span>{personalInfo.location}</span>}
          {personalInfo.phone && <span>• {personalInfo.phone}</span>}
          {personalInfo.email && (
            <span>
              • <a href={`mailto:${personalInfo.email}`} className="text-slate-900 underline hover:text-emerald-600">{personalInfo.email}</a>
            </span>
          )}
          {personalInfo.linkedin && (
            <span>
              • <a href={personalInfo.linkedin} target="_blank" rel="noreferrer" className="text-slate-900 underline hover:text-emerald-600">LinkedIn</a>
            </span>
          )}
          {personalInfo.github && (
            <span>
              • <a href={personalInfo.github} target="_blank" rel="noreferrer" className="text-slate-900 underline hover:text-emerald-600">GitHub</a>
            </span>
          )}
          {personalInfo.website && (
            <span>
              • <a href={personalInfo.website} target="_blank" rel="noreferrer" className="text-slate-900 underline hover:text-emerald-600">Portfolio</a>
            </span>
          )}
        </div>
      </header>

      {/* Summary */}
      {summary && (
        <section className="mb-4">
          <h2 className="text-xs font-bold uppercase tracking-widest text-slate-900 border-b-2 border-slate-900 pb-1 mb-2">
            Professional Summary
          </h2>
          <p className="text-slate-700 text-justify text-xs leading-normal">{summary}</p>
        </section>
      )}

      {/* Experience */}
      {experience.length > 0 && (
        <section className="mb-4">
          <h2 className="text-xs font-bold uppercase tracking-widest text-slate-900 border-b-2 border-slate-900 pb-1 mb-2.5">
            Experience
          </h2>
          <div className="space-y-3">
            {experience.map(exp => (
              <div key={exp.id}>
                <div className="flex justify-between items-baseline">
                  <span className="font-bold text-slate-950">{exp.position}</span>
                  <span className="text-xs font-semibold text-slate-500">
                    {exp.startDate} – {exp.current ? 'Present' : exp.endDate}
                  </span>
                </div>
                <div className="text-xs font-medium text-slate-700 mb-1">
                  {exp.company}{exp.location ? `, ${exp.location}` : ''}
                </div>
                <ul className="list-disc list-outside ml-4 space-y-1 text-slate-700 text-xs">
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
          <h2 className="text-xs font-bold uppercase tracking-widest text-slate-900 border-b-2 border-slate-900 pb-1 mb-2">
            Key Projects
          </h2>
          <div className="space-y-2.5">
            {projects.map(proj => (
              <div key={proj.id}>
                <div className="flex justify-between items-baseline">
                  <span className="font-bold text-slate-950">
                    {proj.name}
                    {proj.role && <span className="text-xs font-normal text-slate-500"> ({proj.role})</span>}
                  </span>
                  {proj.link && (
                    <a href={proj.link} target="_blank" rel="noreferrer" className="text-xs text-slate-700 underline hover:text-emerald-600">
                      View Project
                    </a>
                  )}
                </div>
                {proj.technologies.length > 0 && (
                  <div className="text-xs text-slate-600 font-medium mb-1">
                    Tech Stack: {proj.technologies.join(', ')}
                  </div>
                )}
                <ul className="list-disc list-outside ml-4 space-y-0.5 text-slate-700 text-xs">
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
          <h2 className="text-xs font-bold uppercase tracking-widest text-slate-900 border-b-2 border-slate-900 pb-1 mb-2">
            Education
          </h2>
          <div className="space-y-2">
            {education.map(edu => (
              <div key={edu.id} className="flex justify-between items-baseline">
                <div>
                  <div className="font-bold text-slate-950">{edu.institution}</div>
                  <div className="text-xs text-slate-700">
                    {edu.degree} in {edu.fieldOfStudy}
                    {edu.gpa && <span className="text-slate-500"> • GPA: {edu.gpa}</span>}
                    {edu.honors && <span className="text-slate-500"> ({edu.honors})</span>}
                  </div>
                </div>
                <div className="text-xs text-slate-500 font-medium">
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
          <h2 className="text-xs font-bold uppercase tracking-widest text-slate-900 border-b-2 border-slate-900 pb-1 mb-1.5">
            Technical Skills
          </h2>
          <div className="space-y-1 text-xs">
            {skills.map((cat, idx) => (
              <div key={idx} className="flex">
                <span className="font-bold text-slate-900 w-36 shrink-0">{cat.category}:</span>
                <span className="text-slate-700">{cat.items.join(', ')}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Certifications */}
      {certifications.length > 0 && (
        <section className="mb-4">
          <h2 className="text-xs font-bold uppercase tracking-widest text-slate-900 border-b-2 border-slate-900 pb-1 mb-1.5">
            Certifications
          </h2>
          <div className="space-y-1 text-xs">
            {certifications.map(cert => (
              <div key={cert.id} className="flex justify-between">
                <div>
                  <strong className="text-slate-900">{cert.name}</strong> — {cert.issuer}
                  {cert.credentialId && <span className="text-slate-500"> (ID: {cert.credentialId})</span>}
                </div>
                <div className="text-slate-500">{cert.issueDate}</div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Achievements */}
      {achievements.length > 0 && (
        <section>
          <h2 className="text-xs font-bold uppercase tracking-widest text-slate-900 border-b-2 border-slate-900 pb-1 mb-1.5">
            Key Achievements
          </h2>
          <div className="space-y-1 text-xs">
            {achievements.map(ach => (
              <div key={ach.id} className="flex justify-between items-baseline">
                <div>
                  <strong className="text-slate-900">{ach.title}: </strong>
                  <span className="text-slate-700">{ach.description}</span>
                </div>
                {ach.date && <div className="text-slate-500 ml-4 shrink-0">{ach.date}</div>}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

