import React from 'react';
import { useResumeContext } from '../context/ResumeContext';
import { PDFViewer } from '@react-pdf/renderer';
import { ResumePDF } from './ResumePDF';

export default function ResumePreview() {
  const { resumeData } = useResumeContext();

  return (
    <div style={{ height: '100%', width: '100%', borderRadius: '8px', overflow: 'hidden' }}>
      <PDFViewer style={{ width: '100%', height: '100%', border: 'none' }}>
        <ResumePDF data={resumeData} />
      </PDFViewer>
    </div>
  );
}
