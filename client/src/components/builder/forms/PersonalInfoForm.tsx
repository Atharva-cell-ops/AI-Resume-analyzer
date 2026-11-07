import React from 'react';
import { useResume } from '../../../context/ResumeContext';
import { User } from 'lucide-react';

export const PersonalInfoForm: React.FC = () => {
  const { resumeData, updatePersonalInfo } = useResume();
  const { personalInfo } = resumeData;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updatePersonalInfo({ [e.target.name]: e.target.value });
  };

  return (
    <div className="space-y-5 animate-fadeIn">
      <div className="border-b border-slate-200 pb-3">
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <User className="w-5 h-5 text-indigo-600" /> Personal Information
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          ATS parsers use this header to extract your contact details and identity. Ensure email and phone are accurate.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Full Name <span className="text-indigo-600">*</span>
          </label>
          <div className="relative">
            <input
              type="text"
              name="fullName"
              value={personalInfo.fullName}
              onChange={handleChange}
              placeholder="e.g. John Doe"
              className="w-full bg-white border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 transition shadow-xs"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Email Address <span className="text-indigo-600">*</span>
          </label>
          <div className="relative">
            <input
              type="email"
              name="email"
              value={personalInfo.email}
              onChange={handleChange}
              placeholder="e.g. john.doe@example.com"
              className="w-full bg-white border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 transition shadow-xs"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Phone Number <span className="text-indigo-600">*</span>
          </label>
          <div className="relative">
            <input
              type="tel"
              name="phone"
              value={personalInfo.phone}
              onChange={handleChange}
              placeholder="+1 (555) 123-4567"
              className="w-full bg-white border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 transition shadow-xs"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Location (City, Country / State) <span className="text-indigo-600">*</span>
          </label>
          <div className="relative">
            <input
              type="text"
              name="location"
              value={personalInfo.location}
              onChange={handleChange}
              placeholder="e.g. New York, NY / Mumbai, India"
              className="w-full bg-white border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 transition shadow-xs"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            LinkedIn Profile URL
          </label>
          <div className="relative">
            <input
              type="url"
              name="linkedin"
              value={personalInfo.linkedin || ''}
              onChange={handleChange}
              placeholder="https://linkedin.com/in/username"
              className="w-full bg-white border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 transition shadow-xs"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            GitHub Profile URL
          </label>
          <div className="relative">
            <input
              type="url"
              name="github"
              value={personalInfo.github || ''}
              onChange={handleChange}
              placeholder="https://github.com/username"
              className="w-full bg-white border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 transition shadow-xs"
            />
          </div>
        </div>

        <div className="md:col-span-2">
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Portfolio / Personal Website URL
          </label>
          <div className="relative">
            <input
              type="url"
              name="website"
              value={personalInfo.website || ''}
              onChange={handleChange}
              placeholder="https://yourportfolio.dev"
              className="w-full bg-white border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 transition shadow-xs"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
