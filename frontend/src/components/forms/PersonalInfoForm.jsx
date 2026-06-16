import React from 'react';
import { useResumeContext } from '../../context/ResumeContext';

export default function PersonalInfoForm() {
  const { resumeData, updatePersonalInfo } = useResumeContext();

  const handleChange = (e) => {
    updatePersonalInfo({ [e.target.name]: e.target.value });
  };

  return (
    <div className="flex-col gap-4">
      <div className="input-group">
        <label className="input-label">Full Name</label>
        <input className="input-field" name="fullName" value={resumeData.personalInfo.fullName} onChange={handleChange} placeholder="John Doe" />
      </div>
      <div className="input-group">
        <label className="input-label">Email</label>
        <input className="input-field" name="email" value={resumeData.personalInfo.email} onChange={handleChange} placeholder="john@example.com" />
      </div>
      <div className="input-group">
        <label className="input-label">Phone</label>
        <input className="input-field" name="phone" value={resumeData.personalInfo.phone} onChange={handleChange} placeholder="+1 234 567 890" />
      </div>
      <div className="input-group">
        <label className="input-label">Location</label>
        <input className="input-field" name="location" value={resumeData.personalInfo.location} onChange={handleChange} placeholder="New York, NY" />
      </div>
      <div className="input-group">
        <label className="input-label">Professional Summary</label>
        <textarea className="input-field" name="summary" value={resumeData.personalInfo.summary} onChange={handleChange} placeholder="Briefly describe your professional background..."></textarea>
      </div>
    </div>
  );
}
