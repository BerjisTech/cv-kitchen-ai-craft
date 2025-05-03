
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
  // Make sure we're using the correctly formatted data
  const sanitizedData: CVData = {
    ...cvData,
    // Ensure we never use placeholder data
    fullName: cvData.fullName && cvData.fullName !== 'Your Name' ? cvData.fullName : '',
    title: cvData.title && cvData.title !== 'Professional Title' ? cvData.title : '',
  };
  
  // Get the correct template component or fallback to modern
  const Template = cvTemplates[template] || cvTemplates['modern'];
  
  return <Template data={sanitizedData} id={id} />;
};
