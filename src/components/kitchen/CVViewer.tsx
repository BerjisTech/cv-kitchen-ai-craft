
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { getTailoredCV, updateTailoredCV } from '@/services/tailoredCVService';
import { TailoredCV } from '@/types/tailoredCV';
import { FileText, Download, ArrowLeft, FileEdit } from 'lucide-react';

export const CVViewer: React.FC = () => {
  const { cvId } = useParams<{ cvId: string }>();
  const navigate = useNavigate();
  
  const [cv, setCV] = useState<TailoredCV | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('modern');
  
  useEffect(() => {
    const loadCV = async () => {
      if (!cvId) return;
      
      setIsLoading(true);
      try {
        const cvData = await getTailoredCV(cvId);
        if (cvData) {
          setCV(cvData);
          setSelectedTemplate(cvData.template || 'modern');
        }
      } catch (error) {
        console.error('Error loading CV:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadCV();
  }, [cvId]);
  
  const handleTemplateChange = async (templateName: string) => {
    if (!cv || !cvId) return;
    
    setSelectedTemplate(templateName);
    try {
      const updatedCV = await updateTailoredCV(cvId, templateName);
      if (updatedCV) {
        setCV(updatedCV);
      }
    } catch (error) {
      console.error('Error updating template:', error);
    }
  };
  
  const handleDownloadPDF = () => {
    // Implement PDF download functionality
    console.log('Download PDF', cv);
    // This would normally trigger a PDF generation and download
  };
  
  const handleGenerateCoverLetter = () => {
    // Implement cover letter generation
    console.log('Generate cover letter for', cv);
    // This would navigate to cover letter generation page or modal
  };
  
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }
  
  if (!cv) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <FileText className="mx-auto h-16 w-16 text-muted-foreground" />
          <h1 className="mt-4 text-2xl font-semibold">CV Not Found</h1>
          <p className="mt-2 text-muted-foreground">The requested CV couldn't be found.</p>
          <Button
            onClick={() => navigate(-1)}
            variant="outline"
            className="mt-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Go Back
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <Button
          onClick={() => navigate(-1)}
          variant="outline"
          size="sm"
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>
        
        <div className="flex gap-2">
          <Button
            onClick={handleDownloadPDF}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            <Download className="h-4 w-4" /> Download PDF
          </Button>
          
          <Button
            onClick={handleGenerateCoverLetter}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            <FileEdit className="h-4 w-4" /> Generate Cover Letter
          </Button>
        </div>
      </div>
      
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Your Tailored CV</h1>
        <p className="text-muted-foreground">
          Customized for the job description.
        </p>
      </div>
      
      <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
        <div className="space-y-6 md:col-span-1">
          <Card className="p-4">
            <h3 className="mb-4 font-medium">Template</h3>
            <div className="space-y-2">
              {['modern', 'classic', 'minimal', 'creative'].map((template) => (
                <div
                  key={template}
                  className={`cursor-pointer rounded-md border p-3 ${
                    selectedTemplate === template
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:bg-accent'
                  }`}
                  onClick={() => handleTemplateChange(template)}
                >
                  <div className="flex items-center justify-between">
                    <span className="capitalize">{template}</span>
                    {selectedTemplate === template && (
                      <div className="h-2 w-2 rounded-full bg-primary"></div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
        
        <div className="md:col-span-3">
          <Card className="overflow-hidden">
            <div className="border-b bg-muted/50 p-4">
              <div className="flex items-center justify-between">
                <h2 className="font-medium">CV Preview</h2>
                <span className="text-xs text-muted-foreground">
                  {selectedTemplate.charAt(0).toUpperCase() + selectedTemplate.slice(1)} Template
                </span>
              </div>
            </div>
            
            <div className="p-6">
              {/* CV Content would be rendered here based on the template */}
              {/* This is just a placeholder representation */}
              <div className="space-y-6">
                <div className="border-b pb-4">
                  <h1 className="text-2xl font-bold">{cv.cv_content?.name || 'Your Name'}</h1>
                  <p className="text-muted-foreground">{cv.cv_content?.title || 'Professional Title'}</p>
                </div>
                
                <div>
                  <h2 className="mb-3 text-lg font-semibold">Summary</h2>
                  <p>{cv.cv_content?.summary || 'Your professional summary tailored for this job.'}</p>
                </div>
                
                <div>
                  <h2 className="mb-3 text-lg font-semibold">Experience</h2>
                  {(cv.cv_content?.experience || []).map((exp: any, index: number) => (
                    <div key={index} className="mb-4">
                      <div className="flex justify-between">
                        <h3 className="font-medium">{exp.title || 'Job Title'}</h3>
                        <span className="text-sm text-muted-foreground">
                          {exp.period || 'Time Period'}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-muted-foreground">
                        {exp.company || 'Company Name'}
                      </p>
                      <p className="mt-1 text-sm">{exp.description || 'Job description'}</p>
                    </div>
                  ))}
                </div>
                
                <div>
                  <h2 className="mb-3 text-lg font-semibold">Skills</h2>
                  <div className="flex flex-wrap gap-2">
                    {(cv.cv_content?.skills || ['Skill 1', 'Skill 2', 'Skill 3']).map((skill: string, index: number) => (
                      <span
                        key={index}
                        className="rounded-full bg-primary/10 px-3 py-1 text-sm text-primary"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
