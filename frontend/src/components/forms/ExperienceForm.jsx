import React, { useState } from 'react';
import { useResumeContext } from '../../context/ResumeContext';
import { Plus, Trash2, Wand2, Loader2 } from 'lucide-react';

export default function ExperienceForm() {
  const { resumeData, addExperience, updateExperience, removeExperience } = useResumeContext();
  const [loadingId, setLoadingId] = useState(null);

  const handleEnhance = async (exp) => {
    if (!exp.description) return;
    
    setLoadingId(exp.id);
    try {
      const response = await fetch('http://localhost:5000/api/enhance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: exp.description,
          position: exp.position
        }),
      });

      if (!response.ok) throw new Error('Failed to enhance');
      
      const data = await response.json();
      updateExperience(exp.id, { description: data.enhancedText });
    } catch (error) {
      console.error(error);
      alert('Failed to enhance text. Please check if the backend is running and API key is set.');
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="flex-col gap-4">
      {resumeData.experience.map((exp) => (
        <div key={exp.id} className="glass-panel" style={{ padding: '1rem', marginBottom: '1rem' }}>
          <div className="flex justify-between items-center mb-4">
            <h3 style={{ margin: 0 }}>Experience Entry</h3>
            <button className="btn btn-secondary" style={{ padding: '0.5rem' }} onClick={() => removeExperience(exp.id)}>
              <Trash2 size={16} />
            </button>
          </div>
          <div className="input-group">
            <label className="input-label">Company</label>
            <input className="input-field" value={exp.company || ''} onChange={(e) => updateExperience(exp.id, { company: e.target.value })} placeholder="Company Name" />
          </div>
          <div className="input-group">
            <label className="input-label">Position</label>
            <input className="input-field" value={exp.position || ''} onChange={(e) => updateExperience(exp.id, { position: e.target.value })} placeholder="Software Engineer" />
          </div>
          <div className="input-group">
            <label className="input-label flex justify-between">
              Description
              <button 
                className="btn btn-primary" 
                style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                onClick={() => handleEnhance(exp)}
                disabled={loadingId === exp.id || !exp.description}
              >
                {loadingId === exp.id ? <Loader2 size={12} className="spin" /> : <Wand2 size={12} />} 
                {loadingId === exp.id ? ' Enhancing...' : ' AI Enhance'}
              </button>
            </label>
            <textarea className="input-field" value={exp.description || ''} onChange={(e) => updateExperience(exp.id, { description: e.target.value })} placeholder="Describe your responsibilities..."></textarea>
          </div>
        </div>
      ))}
      <button className="btn btn-secondary w-full" onClick={() => addExperience({})}>
        <Plus size={16} /> Add Experience
      </button>
    </div>
  );
}
