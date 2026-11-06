import React from 'react';
import { ResumeData } from '@ai-resume/shared';

export const AtsMinimalTemplate: React.FC<{ data: ResumeData }> = ({ data }) => {
  const { personalInfo, summary, experience, education, projects, skills, certifications, achievements } = data;

  return (
    <div className="bg-white text-black font-sans p-7 max-w-[800px] mx-auto text-[12.5px] leading-snug shadow-sm min-h-[1050px]">
      {/* Header */}
      <header className="mb-3">
        <h1 className="text-2xl font-bold tracking-tight text-black">
          {personalInfo.fullName || 'YOUR NAME'}
        </h1>
        <div className="text-xs text-gray-700 flex flex-wrap gap-x-2 mt-0.5">
          {personalInfo.location && <span>{personalInfo.location} |</span>}
          {personalInfo.phone && <span>{personalInfo.phone} |</span>}
          {personalInfo.email && <span>{personalInfo.email} |</span>}
          {personalInfo.linkedin && (
            <span>
              <a href={personalInfo.linkedin} target="_blank" rel="noreferrer" className="underline">LinkedIn</a> |
            </span>
          )}
          {personalInfo.github && (
            <span>
              <a href={personalInfo.github} target="_blank" rel="noreferrer" className="underline">GitHub</a> |
            </span>
          )}
          {personalInfo.website && (
            <span>
              <a href={personalInfo.website} target="_blank" rel="noreferrer" className="underline">Portfolio</a>
            </span>
          )}
        </div>
      </header>

      {/* Summary */}
      {summary && (
        <section className="mb-3">
          <div className="font-bold text-xs uppercase tracking-wider text-black border-b border-gray-400 pb-0.5 mb-1">
            Summary
          </div>
          <p className="text-gray-900 text-xs text-justify">{summary}</p>
        </section>
      )}

      {/* Experience */}
      {experience.length > 0 && (
        <section className="mb-3">
          <div className="font-bold text-xs uppercase tracking-wider text-black border-b border-gray-400 pb-0.5 mb-1.5">
            Experience
          </div>
          <div className="space-y-2">
            {experience.map(exp => (
              <div key={exp.id}>
                <div className="flex justify-between items-baseline font-bold text-xs">
                  <span>{exp.position}, {exp.company}{exp.location ? ` — ${exp.location}` : ''}</span>
                  <span className="font-normal text-gray-700">
                    {exp.startDate} – {exp.current ? 'Present' : exp.endDate}
                  </span>
                </div>
                <ul className="list-disc list-outside ml-4 space-y-0.5 text-xs text-gray-900 mt-0.5">
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
        <section className="mb-3">
          <div className="font-bold text-xs uppercase tracking-wider text-black border-b border-gray-400 pb-0.5 mb-1.5">
            Projects
          </div>
          <div className="space-y-1.5">
            {projects.map(proj => (
              <div key={proj.id}>
                <div className="flex justify-between items-baseline text-xs">
                  <span className="font-bold">
                    {proj.name}
                    {proj.technologies.length > 0 && (
                      <span className="font-normal text-gray-700"> ({proj.technologies.join(', ')})</span>
                    )}
                  </span>
                  {proj.link && (
                    <a href={proj.link} target="_blank" rel="noreferrer" className="underline text-gray-700">
                      Link
                    </a>
                  )}
                </div>
                <ul className="list-disc list-outside ml-4 space-y-0.5 text-xs text-gray-900">
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
        <section className="mb-3">
          <div className="font-bold text-xs uppercase tracking-wider text-black border-b border-gray-400 pb-0.5 mb-1">
            Education
          </div>
          <div className="space-y-1 text-xs">
            {education.map(edu => (
              <div key={edu.id} className="flex justify-between items-baseline">
                <div>
                  <span className="font-bold">{edu.institution}</span> — {edu.degree} in {edu.fieldOfStudy}
                  {edu.gpa && <span> (GPA: {edu.gpa})</span>}
                </div>
                <div className="text-gray-700">
                  {edu.startDate} – {edu.endDate}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Skills */}
      {skills.length > 0 && (
        <section className="mb-3">
          <div className="font-bold text-xs uppercase tracking-wider text-black border-b border-gray-400 pb-0.5 mb-1">
            Skills
          </div>
          <div className="space-y-0.5 text-xs">
            {skills.map((cat, idx) => (
              <div key={idx}>
                <strong>{cat.category}: </strong>
                <span>{cat.items.join(', ')}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Certifications */}
      {certifications.length > 0 && (
        <section className="mb-3">
          <div className="font-bold text-xs uppercase tracking-wider text-black border-b border-gray-400 pb-0.5 mb-1">
            Certifications
          </div>
          <div className="space-y-0.5 text-xs">
            {certifications.map(cert => (
              <div key={cert.id} className="flex justify-between">
                <span><strong>{cert.name}</strong>, {cert.issuer}</span>
                <span className="text-gray-700">{cert.issueDate}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Achievements */}
      {achievements.length > 0 && (
        <section>
          <div className="font-bold text-xs uppercase tracking-wider text-black border-b border-gray-400 pb-0.5 mb-1">
            Achievements
          </div>
          <div className="space-y-0.5 text-xs">
            {achievements.map(ach => (
              <div key={ach.id} className="flex justify-between items-baseline">
                <span><strong>{ach.title}:</strong> {ach.description}</span>
                {ach.date && <span className="text-gray-700 ml-2">{ach.date}</span>}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

