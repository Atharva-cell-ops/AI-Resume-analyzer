import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  ResumeData,
  PersonalInfo,
  EducationItem,
  ExperienceItem,
  ProjectItem,
  SkillCategory,
  CertificationItem,
  AchievementItem,
  TemplateId
} from '@ai-resume/shared';
import { apiFetch } from '../services/api';
import { useAuth } from './AuthContext';

export const BLANK_RESUME_DATA: ResumeData = {
  personalInfo: {
    fullName: '',
    email: '',
    phone: '',
    location: '',
    linkedin: '',
    github: '',
    website: ''
  },
  summary: '',
  education: [],
  experience: [],
  projects: [],
  skills: [
    {
      category: 'Technical Skills',
      items: []
    }
  ],
  certifications: [],
  achievements: []
};

export const SAMPLE_RESUME_DATA: ResumeData = {
  personalInfo: {
    fullName: 'Alex Morgan',
    email: 'alex.morgan@example.com',
    phone: '+1 (555) 234-5678',
    location: 'San Francisco, CA',
    linkedin: 'https://linkedin.com/in/alexmorgan',
    github: 'https://github.com/alexmorgan',
    website: 'https://alexmorgan.dev'
  },
  summary: 'Results-driven Full Stack Software Engineer with 4+ years of experience designing, developing, and scaling high-performance web applications and distributed microservices. Proven expertise in React, TypeScript, Node.js, and cloud native architectures.',
  education: [
    {
      id: 'edu-1',
      institution: 'University of California, Berkeley',
      degree: 'Bachelor of Science',
      fieldOfStudy: 'Computer Science',
      startDate: '2018',
      endDate: '2022',
      gpa: '3.85 / 4.0',
      honors: 'Dean\'s Honors List'
    }
  ],
  experience: [
    {
      id: 'exp-1',
      company: 'TechFlow Solutions',
      position: 'Senior Software Engineer',
      location: 'San Francisco, CA',
      startDate: '2022',
      endDate: 'Present',
      current: true,
      bullets: [
        'Architected and deployed a real-time event streaming pipeline using Node.js and Kafka, reducing latency by 42%.',
        'Led a squad of 5 engineers to deliver client-facing dashboard features using React and TypeScript, increasing user retention by 18%.',
        'Optimized PostgreSQL database query execution plans and caching with Redis, reducing peak server load by 35%.'
      ]
    },
    {
      id: 'exp-2',
      company: 'Innovate Apps',
      position: 'Software Engineer',
      location: 'San Jose, CA',
      startDate: '2021',
      endDate: '2022',
      current: false,
      bullets: [
        'Developed reusable UI component library in React, cutting frontend feature turnaround time by 25%.',
        'Implemented end-to-end automated testing pipelines with Playwright, decreasing production bug leakage by 30%.'
      ]
    }
  ],
  projects: [
    {
      id: 'proj-1',
      name: 'CloudMetrics — Distributed Monitoring Dashboard',
      role: 'Creator & Maintainer',
      link: 'https://github.com/alexmorgan/cloudmetrics',
      technologies: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Docker'],
      bullets: [
        'Constructed open-source telemetry monitoring platform handling over 500,000 daily metrics events.',
        'Authored comprehensive Docker Compose setup and GitHub Actions CI workflow with 95% test coverage.'
      ]
    }
  ],
  skills: [
    {
      category: 'Languages',
      items: ['TypeScript', 'JavaScript', 'Python', 'SQL', 'HTML5', 'CSS3']
    },
    {
      category: 'Frameworks & Libraries',
      items: ['React', 'Next.js', 'Express.js', 'Node.js', 'Tailwind CSS', 'Redux Toolkit']
    },
    {
      category: 'Databases & Tools',
      items: ['PostgreSQL', 'Redis', 'Docker', 'Prisma ORM', 'Git', 'GitHub Actions', 'AWS']
    }
  ],
  certifications: [
    {
      id: 'cert-1',
      name: 'AWS Certified Solutions Architect – Associate',
      issuer: 'Amazon Web Services',
      issueDate: '2023',
      credentialId: 'AWS-ASA-892102'
    }
  ],
  achievements: [
    {
      id: 'ach-1',
      title: 'First Place — Silicon Valley Hackathon 2023',
      description: 'Built an AI-assisted accessibility reader within 36 hours among 120 competing engineering teams.',
      date: '2023'
    }
  ]
};

export const INITIAL_RESUME_DATA: ResumeData = BLANK_RESUME_DATA;

interface ResumeContextType {
  resumeData: ResumeData;
  activeResumeId: string | null;
  resumeTitle: string;
  templateId: TemplateId;
  currentStep: number;
  saveStatus: 'saved' | 'saving' | 'unsaved';
  setResumeTitle: (title: string) => void;
  setTemplateId: (templateId: TemplateId) => void;
  setCurrentStep: (step: number) => void;
  updatePersonalInfo: (info: Partial<PersonalInfo>) => void;
  updateSummary: (summary: string) => void;
  
  // Education
  addEducation: () => void;
  updateEducation: (id: string, item: Partial<EducationItem>) => void;
  removeEducation: (id: string) => void;
  reorderEducation: (fromIndex: number, toIndex: number) => void;

  // Experience
  addExperience: () => void;
  updateExperience: (id: string, item: Partial<ExperienceItem>) => void;
  removeExperience: (id: string) => void;
  reorderExperience: (fromIndex: number, toIndex: number) => void;
  addExperienceBullet: (expId: string) => void;
  updateExperienceBullet: (expId: string, bulletIndex: number, text: string) => void;
  removeExperienceBullet: (expId: string, bulletIndex: number) => void;

  // Projects
  addProject: () => void;
  updateProject: (id: string, item: Partial<ProjectItem>) => void;
  removeProject: (id: string) => void;
  reorderProjects: (fromIndex: number, toIndex: number) => void;
  addProjectBullet: (projId: string) => void;
  updateProjectBullet: (projId: string, bulletIndex: number, text: string) => void;
  removeProjectBullet: (projId: string, bulletIndex: number) => void;

  // Skills
  addSkillCategory: () => void;
  updateSkillCategoryName: (index: number, category: string) => void;
  removeSkillCategory: (index: number) => void;
  addSkillItem: (categoryIndex: number, skillName: string) => void;
  removeSkillItem: (categoryIndex: number, skillIndex: number) => void;

  // Certifications
  addCertification: () => void;
  updateCertification: (id: string, item: Partial<CertificationItem>) => void;
  removeCertification: (id: string) => void;

  // Achievements
  addAchievement: () => void;
  updateAchievement: (id: string, item: Partial<AchievementItem>) => void;
  removeAchievement: (id: string) => void;

  // General Actions
  loadResume: (id: string) => Promise<void>;
  saveResume: () => Promise<void>;
  resetToTemplate: () => void;
  clearAllData: () => void;
  loadSampleData: () => void;
}

const ResumeContext = createContext<ResumeContextType | undefined>(undefined);

export const ResumeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [activeResumeId, setActiveResumeId] = useState<string | null>(null);
  const [resumeTitle, setResumeTitle] = useState('My Professional Resume');
  const [templateId, setTemplateId] = useState<TemplateId>('ats-classic');
  const [currentStep, setCurrentStep] = useState(0);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved'>('saved');

  // Load initial state from localStorage draft if available (discarding old mock data)
  const [resumeData, setResumeData] = useState<ResumeData>(() => {
    try {
      const saved = localStorage.getItem('resuglow_resume_draft');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.personalInfo?.fullName === 'Alex Morgan') {
          localStorage.removeItem('resuglow_resume_draft');
          return BLANK_RESUME_DATA;
        }
        return parsed;
      }
      return BLANK_RESUME_DATA;
    } catch {
      return BLANK_RESUME_DATA;
    }
  });

  // Auto-fill logged-in user's name and email if personalInfo fields are currently blank
  useEffect(() => {
    if (user) {
      setResumeData(prev => {
        const currentName = prev.personalInfo.fullName.trim();
        const currentEmail = prev.personalInfo.email.trim();
        const isDefaultMock = currentName === 'Alex Morgan' || currentEmail === 'alex.morgan@example.com';
        
        const shouldSetName = !currentName || isDefaultMock;
        const shouldSetEmail = !currentEmail || isDefaultMock;

        if (shouldSetName || shouldSetEmail) {
          return {
            ...prev,
            personalInfo: {
              ...prev.personalInfo,
              fullName: shouldSetName ? user.name : prev.personalInfo.fullName,
              email: shouldSetEmail ? user.email : prev.personalInfo.email
            }
          };
        }
        return prev;
      });
    }
  }, [user]);

  // Local storage draft sync & debounced autosave
  useEffect(() => {
    try {
      localStorage.setItem('resuglow_resume_draft', JSON.stringify(resumeData));
      localStorage.setItem('resuglow_resume_template', templateId);
      localStorage.setItem('resuglow_resume_title', resumeTitle);
    } catch (e) {
      console.warn('Failed to save to localStorage', e);
    }

    setSaveStatus('unsaved');
    const timer = setTimeout(() => {
      saveResume();
    }, 1500);

    return () => clearTimeout(timer);
  }, [resumeData, templateId, resumeTitle]);

  const saveResume = useCallback(async () => {
    if (!user) {
      setSaveStatus('saved');
      return;
    }

    try {
      setSaveStatus('saving');
      if (activeResumeId) {
        await apiFetch(`/resumes/${activeResumeId}`, {
          method: 'PUT',
          body: JSON.stringify({
            title: resumeTitle,
            templateId,
            content: resumeData
          })
        });
      } else {
        const res = await apiFetch<any>('/resumes', {
          method: 'POST',
          body: JSON.stringify({
            title: resumeTitle,
            templateId,
            content: resumeData
          })
        });
        if (res.data?.id) {
          setActiveResumeId(res.data.id);
        }
      }
      setSaveStatus('saved');
    } catch (error) {
      console.error('Failed to autosave resume', error);
      setSaveStatus('unsaved');
    }
  }, [user, activeResumeId, resumeTitle, templateId, resumeData]);

  const loadResume = async (id: string) => {
    try {
      const res = await apiFetch<any>(`/resumes/${id}`);
      if (res.data) {
        setActiveResumeId(res.data.id);
        setResumeTitle(res.data.title);
        setTemplateId(res.data.templateId || 'ats-classic');
        if (res.data.content) {
          setResumeData(res.data.content);
        }
      }
    } catch (err) {
      console.error('Failed to load resume:', err);
    }
  };

  const updatePersonalInfo = (info: Partial<PersonalInfo>) => {
    setResumeData(prev => ({
      ...prev,
      personalInfo: { ...prev.personalInfo, ...info }
    }));
  };

  const updateSummary = (summary: string) => {
    setResumeData(prev => ({ ...prev, summary }));
  };

  // Education Helpers
  const addEducation = () => {
    const newItem: EducationItem = {
      id: `edu-${Date.now()}`,
      institution: '',
      degree: '',
      fieldOfStudy: '',
      startDate: '',
      endDate: ''
    };
    setResumeData(prev => ({ ...prev, education: [...prev.education, newItem] }));
  };

  const updateEducation = (id: string, item: Partial<EducationItem>) => {
    setResumeData(prev => ({
      ...prev,
      education: prev.education.map(e => (e.id === id ? { ...e, ...item } : e))
    }));
  };

  const removeEducation = (id: string) => {
    setResumeData(prev => ({
      ...prev,
      education: prev.education.filter(e => e.id !== id)
    }));
  };

  const reorderEducation = (fromIndex: number, toIndex: number) => {
    setResumeData(prev => {
      const updated = [...prev.education];
      const [moved] = updated.splice(fromIndex, 1);
      updated.splice(toIndex, 0, moved);
      return { ...prev, education: updated };
    });
  };

  // Experience Helpers
  const addExperience = () => {
    const newItem: ExperienceItem = {
      id: `exp-${Date.now()}`,
      company: '',
      position: '',
      location: '',
      startDate: '',
      endDate: '',
      current: false,
      bullets: ['Spearheaded...']
    };
    setResumeData(prev => ({ ...prev, experience: [...prev.experience, newItem] }));
  };

  const updateExperience = (id: string, item: Partial<ExperienceItem>) => {
    setResumeData(prev => ({
      ...prev,
      experience: prev.experience.map(e => (e.id === id ? { ...e, ...item } : e))
    }));
  };

  const removeExperience = (id: string) => {
    setResumeData(prev => ({
      ...prev,
      experience: prev.experience.filter(e => e.id !== id)
    }));
  };

  const reorderExperience = (fromIndex: number, toIndex: number) => {
    setResumeData(prev => {
      const updated = [...prev.experience];
      const [moved] = updated.splice(fromIndex, 1);
      updated.splice(toIndex, 0, moved);
      return { ...prev, experience: updated };
    });
  };

  const addExperienceBullet = (expId: string) => {
    setResumeData(prev => ({
      ...prev,
      experience: prev.experience.map(e =>
        e.id === expId ? { ...e, bullets: [...e.bullets, 'Engineered...'] } : e
      )
    }));
  };

  const updateExperienceBullet = (expId: string, bulletIndex: number, text: string) => {
    setResumeData(prev => ({
      ...prev,
      experience: prev.experience.map(e => {
        if (e.id !== expId) return e;
        const newBullets = [...e.bullets];
        newBullets[bulletIndex] = text;
        return { ...e, bullets: newBullets };
      })
    }));
  };

  const removeExperienceBullet = (expId: string, bulletIndex: number) => {
    setResumeData(prev => ({
      ...prev,
      experience: prev.experience.map(e => {
        if (e.id !== expId) return e;
        return { ...e, bullets: e.bullets.filter((_, i) => i !== bulletIndex) };
      })
    }));
  };

  // Projects Helpers
  const addProject = () => {
    const newItem: ProjectItem = {
      id: `proj-${Date.now()}`,
      name: '',
      technologies: [],
      bullets: ['Developed...']
    };
    setResumeData(prev => ({ ...prev, projects: [...prev.projects, newItem] }));
  };

  const updateProject = (id: string, item: Partial<ProjectItem>) => {
    setResumeData(prev => ({
      ...prev,
      projects: prev.projects.map(p => (p.id === id ? { ...p, ...item } : p))
    }));
  };

  const removeProject = (id: string) => {
    setResumeData(prev => ({
      ...prev,
      projects: prev.projects.filter(p => p.id !== id)
    }));
  };

  const reorderProjects = (fromIndex: number, toIndex: number) => {
    setResumeData(prev => {
      const updated = [...prev.projects];
      const [moved] = updated.splice(fromIndex, 1);
      updated.splice(toIndex, 0, moved);
      return { ...prev, projects: updated };
    });
  };

  const addProjectBullet = (projId: string) => {
    setResumeData(prev => ({
      ...prev,
      projects: prev.projects.map(p =>
        p.id === projId ? { ...p, bullets: [...p.bullets, 'Constructed...'] } : p
      )
    }));
  };

  const updateProjectBullet = (projId: string, bulletIndex: number, text: string) => {
    setResumeData(prev => ({
      ...prev,
      projects: prev.projects.map(p => {
        if (p.id !== projId) return p;
        const newBullets = [...p.bullets];
        newBullets[bulletIndex] = text;
        return { ...p, bullets: newBullets };
      })
    }));
  };

  const removeProjectBullet = (projId: string, bulletIndex: number) => {
    setResumeData(prev => ({
      ...prev,
      projects: prev.projects.map(p => {
        if (p.id !== projId) return p;
        return { ...p, bullets: p.bullets.filter((_, i) => i !== bulletIndex) };
      })
    }));
  };

  // Skills Helpers
  const addSkillCategory = () => {
    const newCat: SkillCategory = {
      category: 'New Category',
      items: ['Sample Skill']
    };
    setResumeData(prev => ({ ...prev, skills: [...prev.skills, newCat] }));
  };

  const updateSkillCategoryName = (index: number, category: string) => {
    setResumeData(prev => {
      const skills = [...prev.skills];
      skills[index] = { ...skills[index], category };
      return { ...prev, skills };
    });
  };

  const removeSkillCategory = (index: number) => {
    setResumeData(prev => ({
      ...prev,
      skills: prev.skills.filter((_, i) => i !== index)
    }));
  };

  const addSkillItem = (categoryIndex: number, skillName: string) => {
    const trimmed = skillName.trim();
    if (!trimmed) return;
    setResumeData(prev => {
      const skills = [...prev.skills];
      if (!skills[categoryIndex].items.includes(trimmed)) {
        skills[categoryIndex] = {
          ...skills[categoryIndex],
          items: [...skills[categoryIndex].items, trimmed]
        };
      }
      return { ...prev, skills };
    });
  };

  const removeSkillItem = (categoryIndex: number, skillIndex: number) => {
    setResumeData(prev => {
      const skills = [...prev.skills];
      skills[categoryIndex] = {
        ...skills[categoryIndex],
        items: skills[categoryIndex].items.filter((_, i) => i !== skillIndex)
      };
      return { ...prev, skills };
    });
  };

  // Certifications Helpers
  const addCertification = () => {
    const newCert: CertificationItem = {
      id: `cert-${Date.now()}`,
      name: '',
      issuer: '',
      issueDate: ''
    };
    setResumeData(prev => ({ ...prev, certifications: [...prev.certifications, newCert] }));
  };

  const updateCertification = (id: string, item: Partial<CertificationItem>) => {
    setResumeData(prev => ({
      ...prev,
      certifications: prev.certifications.map(c => (c.id === id ? { ...c, ...item } : c))
    }));
  };

  const removeCertification = (id: string) => {
    setResumeData(prev => ({
      ...prev,
      certifications: prev.certifications.filter(c => c.id !== id)
    }));
  };

  // Achievements Helpers
  const addAchievement = () => {
    const newAch: AchievementItem = {
      id: `ach-${Date.now()}`,
      title: '',
      description: ''
    };
    setResumeData(prev => ({ ...prev, achievements: [...prev.achievements, newAch] }));
  };

  const updateAchievement = (id: string, item: Partial<AchievementItem>) => {
    setResumeData(prev => ({
      ...prev,
      achievements: prev.achievements.map(a => (a.id === id ? { ...a, ...item } : a))
    }));
  };

  const removeAchievement = (id: string) => {
    setResumeData(prev => ({
      ...prev,
      achievements: prev.achievements.filter(a => a.id !== id)
    }));
  };

  const resetToTemplate = () => {
    setResumeData(BLANK_RESUME_DATA);
  };

  const clearAllData = () => {
    localStorage.removeItem('resuglow_resume_draft');
    setResumeData({
      ...BLANK_RESUME_DATA,
      personalInfo: {
        ...BLANK_RESUME_DATA.personalInfo,
        fullName: user?.name || '',
        email: user?.email || ''
      }
    });
  };

  const loadSampleData = () => {
    setResumeData(SAMPLE_RESUME_DATA);
  };

  return (
    <ResumeContext.Provider
      value={{
        resumeData,
        activeResumeId,
        resumeTitle,
        templateId,
        currentStep,
        saveStatus,
        setResumeTitle,
        setTemplateId,
        setCurrentStep,
        updatePersonalInfo,
        updateSummary,
        addEducation,
        updateEducation,
        removeEducation,
        reorderEducation,
        addExperience,
        updateExperience,
        removeExperience,
        reorderExperience,
        addExperienceBullet,
        updateExperienceBullet,
        removeExperienceBullet,
        addProject,
        updateProject,
        removeProject,
        reorderProjects,
        addProjectBullet,
        updateProjectBullet,
        removeProjectBullet,
        addSkillCategory,
        updateSkillCategoryName,
        removeSkillCategory,
        addSkillItem,
        removeSkillItem,
        addCertification,
        updateCertification,
        removeCertification,
        addAchievement,
        updateAchievement,
        removeAchievement,
        loadResume,
        saveResume,
        resetToTemplate,
        clearAllData,
        loadSampleData
      }}
    >
      {children}
    </ResumeContext.Provider>
  );
};

export const useResume = () => {
  const context = useContext(ResumeContext);
  if (!context) {
    throw new Error('useResume must be used within a ResumeProvider');
  }
  return context;
};

