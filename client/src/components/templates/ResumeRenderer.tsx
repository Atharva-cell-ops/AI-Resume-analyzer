import React from 'react';
import { ResumeData, TemplateId } from '@ai-resume/shared';
import { AtsClassicTemplate } from './AtsClassicTemplate';
import { AtsModernTemplate } from './AtsModernTemplate';
import { AtsMinimalTemplate } from './AtsMinimalTemplate';

interface ResumeRendererProps {
  data: ResumeData;
  templateId: TemplateId;
}

export const ResumeRenderer: React.FC<ResumeRendererProps> = ({ data, templateId }) => {
  switch (templateId) {
    case 'ats-modern':
      return <AtsModernTemplate data={data} />;
    case 'ats-minimal':
      return <AtsMinimalTemplate data={data} />;
    case 'ats-classic':
    default:
      return <AtsClassicTemplate data={data} />;
  }
};

