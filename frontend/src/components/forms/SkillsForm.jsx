import React, { useState } from 'react';
import { useResumeContext } from '../../context/ResumeContext';
import { Plus, X } from 'lucide-react';

export default function SkillsForm() {
  const { resumeData, addSkill, removeSkill } = useResumeContext();
  const [newSkill, setNewSkill] = useState('');

  const handleAdd = () => {
    if (newSkill.trim()) {
      addSkill({ name: newSkill.trim() });
      setNewSkill('');
    }
  };

  return (
    <div className="flex-col gap-4">
      <div className="flex gap-4 mb-4">
        <input 
          className="input-field" 
          style={{ flex: 1 }}
          value={newSkill}
          onChange={(e) => setNewSkill(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleAdd()}
          placeholder="Add a skill (e.g. React, Python)" 
        />
        <button className="btn btn-primary" onClick={handleAdd}>
          <Plus size={16} /> Add
        </button>
      </div>
      <div className="flex" style={{ flexWrap: 'wrap', gap: '0.5rem' }}>
        {resumeData.skills.map((skill) => (
          <div key={skill.id} className="glass-panel" style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', borderRadius: '99px' }}>
            <span>{skill.name}</span>
            <button className="btn" style={{ padding: 0, background: 'none', minWidth: 'auto', border: 'none' }} onClick={() => removeSkill(skill.id)}>
              <X size={14} color="var(--text-secondary)" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
