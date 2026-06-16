import React, { useState } from 'react';
import { useResumeContext } from './context/ResumeContext';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { ResumePDF } from './components/ResumePDF';
import { Download } from 'lucide-react';

import PersonalInfoForm from './components/forms/PersonalInfoForm';
import EducationForm from './components/forms/EducationForm';
import ExperienceForm from './components/forms/ExperienceForm';
import SkillsForm from './components/forms/SkillsForm';
import ResumePreview from './components/ResumePreview';

function App() {
  const [currentStep, setCurrentStep] = useState(1);
  const { resumeData } = useResumeContext();

  const renderStep = () => {
    switch(currentStep) {
      case 1: return <PersonalInfoForm />;
      case 2: return <EducationForm />;
      case 3: return <ExperienceForm />;
      case 4: return <SkillsForm />;
      default: return <PersonalInfoForm />;
    }
  };

  return (
    <div className="container">
      <header className="mb-8 flex justify-between items-center" style={{ flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ marginBottom: '0.25rem' }}>AI Resume Builder</h1>
          <p>Build a professional, ATS-friendly resume powered by AI.</p>
        </div>
        
        <PDFDownloadLink document={<ResumePDF data={resumeData} />} fileName="resume.pdf">
          {({ loading }) => (
            <button className="btn btn-primary" disabled={loading}>
              <Download size={18} /> {loading ? 'Generating PDF...' : 'Download PDF'}
            </button>
          )}
        </PDFDownloadLink>
      </header>
      
      <div className="flex gap-8" style={{ flexWrap: 'wrap' }}>
        
        {/* Left Side: Form */}
        <div className="glass-panel" style={{ flex: '1 1 500px', padding: '2rem' }}>
          <div className="flex justify-between items-center mb-8">
            <h2 style={{ margin: 0 }}>Step {currentStep} of 4</h2>
            <div className="flex gap-4">
              <button 
                className="btn btn-secondary" 
                disabled={currentStep === 1}
                onClick={() => setCurrentStep(prev => prev - 1)}
              >
                Previous
              </button>
              <button 
                className="btn btn-primary" 
                disabled={currentStep === 4}
                onClick={() => setCurrentStep(prev => prev + 1)}
              >
                Next
              </button>
            </div>
          </div>
          
          <div className="form-content">
            {renderStep()}
          </div>
        </div>

        {/* Right Side: Live PDF Preview */}
        <div className="glass-panel" style={{ flex: '1 1 500px', padding: '2rem', height: '800px' }}>
          <h2 className="mb-4">Live Preview</h2>
          <ResumePreview />
        </div>
      </div>
    </div>
  );
}

export default App;
