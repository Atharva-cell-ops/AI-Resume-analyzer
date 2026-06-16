import React, { createContext, useState, useContext } from 'react';
import { initialResumeData } from '../schema';

const ResumeContext = createContext();

export const ResumeProvider = ({ children }) => {
  const [resumeData, setResumeData] = useState(initialResumeData);

  const updatePersonalInfo = (data) => {
    setResumeData((prev) => ({
      ...prev,
      personalInfo: { ...prev.personalInfo, ...data }
    }));
  };

  const addEducation = (education) => {
    setResumeData((prev) => ({
      ...prev,
      education: [...prev.education, { id: Date.now(), ...education }]
    }));
  };

  const updateEducation = (id, data) => {
    setResumeData((prev) => ({
      ...prev,
      education: prev.education.map((edu) => (edu.id === id ? { ...edu, ...data } : edu))
    }));
  };

  const removeEducation = (id) => {
    setResumeData((prev) => ({
      ...prev,
      education: prev.education.filter((edu) => edu.id !== id)
    }));
  };

  const addExperience = (experience) => {
    setResumeData((prev) => ({
      ...prev,
      experience: [...prev.experience, { id: Date.now(), ...experience }]
    }));
  };

  const updateExperience = (id, data) => {
    setResumeData((prev) => ({
      ...prev,
      experience: prev.experience.map((exp) => (exp.id === id ? { ...exp, ...data } : exp))
    }));
  };

  const removeExperience = (id) => {
    setResumeData((prev) => ({
      ...prev,
      experience: prev.experience.filter((exp) => exp.id !== id)
    }));
  };

  const addSkill = (skill) => {
    setResumeData((prev) => ({
      ...prev,
      skills: [...prev.skills, { id: Date.now(), ...skill }]
    }));
  };

  const removeSkill = (id) => {
    setResumeData((prev) => ({
      ...prev,
      skills: prev.skills.filter((skill) => skill.id !== id)
    }));
  };

  return (
    <ResumeContext.Provider
      value={{
        resumeData,
        updatePersonalInfo,
        addEducation,
        updateEducation,
        removeEducation,
        addExperience,
        updateExperience,
        removeExperience,
        addSkill,
        removeSkill
      }}
    >
      {children}
    </ResumeContext.Provider>
  );
};

export const useResumeContext = () => useContext(ResumeContext);
