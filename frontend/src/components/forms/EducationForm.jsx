import React from 'react';
import { useResumeContext } from '../../context/ResumeContext';
import { Plus, Trash2 } from 'lucide-react';

export default function EducationForm() {
  const { resumeData, addEducation, updateEducation, removeEducation } = useResumeContext();

  return (
    <div className="flex-col gap-4">
      {resumeData.education.map((edu) => (
        <div key={edu.id} className="glass-panel" style={{ padding: '1rem', marginBottom: '1rem' }}>
          <div className="flex justify-between items-center mb-4">
            <h3 style={{ margin: 0 }}>Education Entry</h3>
            <button className="btn btn-secondary" style={{ padding: '0.5rem' }} onClick={() => removeEducation(edu.id)}>
              <Trash2 size={16} />
            </button>
          </div>
          <div className="input-group">
            <label className="input-label">Institution</label>
            <input className="input-field" value={edu.institution || ''} onChange={(e) => updateEducation(edu.id, { institution: e.target.value })} placeholder="University Name" />
          </div>
          <div className="flex gap-4">
            <div className="input-group" style={{ flex: 1 }}>
              <label className="input-label">Degree</label>
              <input className="input-field" value={edu.degree || ''} onChange={(e) => updateEducation(edu.id, { degree: e.target.value })} placeholder="B.S." />
            </div>
            <div className="input-group" style={{ flex: 1 }}>
              <label className="input-label">Field of Study</label>
              <input className="input-field" value={edu.fieldOfStudy || ''} onChange={(e) => updateEducation(edu.id, { fieldOfStudy: e.target.value })} placeholder="Computer Science" />
            </div>
          </div>
        </div>
      ))}
      <button className="btn btn-secondary w-full" onClick={() => addEducation({})}>
        <Plus size={16} /> Add Education
      </button>
    </div>
  );
}
