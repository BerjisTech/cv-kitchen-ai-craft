
import React from 'react';
import { cvTemplates } from './templates';
import { CVData } from '@/types/CVData';

interface CVRendererProps {
  template: string;
  cvData: CVData;
  id?: string;
}

export const CVRenderer: React.FC<CVRendererProps> = ({ 
  template = 'modern', 
  cvData,
  id = 'cv-document'
}) => {
  // Get the correct template component or fallback to modern
  const Template = cvTemplates[template] || cvTemplates['modern'];
  
  return <Template data={cvData} id={id} />;
};
