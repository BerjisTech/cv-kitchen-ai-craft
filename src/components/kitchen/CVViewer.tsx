import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { getTailoredCV, updateTailoredCV } from '@/services/tailoredCVService';
import { TailoredCV } from '@/types/tailoredCV';
import { FileText, Download, ArrowLeft, FileEdit } from 'lucide-react';
import { CVRenderer } from '@/components/cv/CVRenderer';
import { exportToPDF } from '@/utils/exportToPDF';
import { toast } from '@/components/ui/sonner';
import { CVData } from '@/types/CVData';
import { getProfile } from '@/services/profileService';

export const CVViewer: React.FC = () => {
  const { cvId } = useParams<{ cvId: string }>();
  const navigate = useNavigate();
  
  const [cv, setCV] = useState<TailoredCV | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('modern');
  const [cvData, setCvData] = useState<CVData | null>(null);
  const [isPdfGenerating, setIsPdfGenerating] = useState<boolean>(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  
  useEffect(() => {
    // First load the user profile to ensure we have the correct user data
    const loadUserProfile = async () => {
      try {
        const profile = await getProfile();
        if (profile) {
          setUserProfile(profile);
        }
      } catch (error) {
        console.error('Error loading user profile:', error);
      }
    };
    
    loadUserProfile();
  }, []);
  
  useEffect(() => {
    const loadCV = async () => {
      if (!cvId) return;
      
      setIsLoading(true);
      try {
        const cvData = await getTailoredCV(cvId);
        if (cvData) {
          setCV(cvData);
          setSelectedTemplate(cvData.template || 'modern');
          
          // Transform CV data to CVData format
          const formattedData: CVData = {
            fullName: userProfile?.full_name || 
                     cvData.cv_content?.name || 
                     cvData.cv_content?.header?.name || 
                     'Your Name',
            title: cvData.cv_content?.title || 
                  cvData.cv_content?.header?.title || 
                  'Professional Title',
            contact: {
              email: userProfile?.email || 
                     cvData.cv_content?.email || 
                     cvData.cv_content?.contact?.email || 
                     '',
              phone: userProfile?.phone || 
                     cvData.cv_content?.phone || 
                     cvData.cv_content?.contact?.phone || 
                     '',
              location: userProfile?.location || 
                        cvData.cv_content?.location || 
                        cvData.cv_content?.contact?.location || 
                        '',
              website: userProfile?.website || 
                       cvData.cv_content?.website || 
                       cvData.cv_content?.contact?.website || 
                       '',
              linkedin: cvData.cv_content?.linkedin || 
                        cvData.cv_content?.contact?.linkedin || 
                        '',
              github: cvData.cv_content?.github || 
                      cvData.cv_content?.contact?.github || 
                      '',
            },
            summary: cvData.cv_content?.summary || 'Your professional summary tailored for this job.',
            skills: cvData.cv_content?.skills || ['Skill 1', 'Skill 2', 'Skill 3'],
            experience: (cvData.cv_content?.experience || []).map((exp: any) => ({
              company: exp.company || 'Company Name',
              role: exp.title || 'Job Title',
              start: exp.period?.startDate || exp.period?.split(' - ')[0] || 'Start Date',
              end: exp.period?.endDate || (exp.period?.split(' - ')[1] || ''),
              description: exp.description || 'Job description'
            })),
            education: (cvData.cv_content?.education || []).map((edu: any) => ({
              school: edu.institution || 'School Name',
              degree: edu.degree || 'Degree Name',
              start: edu.period?.startDate || edu.period?.split(' - ')[0] || 'Start Date',
              end: edu.period?.endDate || (edu.period?.split(' - ')[1] || ''),
              description: edu.description || ''
            })),
          };
          
          setCvData(formattedData);
        }
      } catch (error) {
        console.error('Error loading CV:', error);
        toast.error('Failed to load the CV');
      } finally {
        setIsLoading(false);
      }
    };
    
    if (userProfile) {
      loadCV();
    }
  }, [cvId, userProfile]);
  
  const handleTemplateChange = async (templateName: string) => {
    if (!cv || !cvId) return;
    
    setSelectedTemplate(templateName);
    try {
      const updatedCV = await updateTailoredCV(cvId, templateName);
      if (updatedCV) {
        setCV(updatedCV);
        toast.success(`Template changed to ${templateName}`);
      }
    } catch (error) {
      console.error('Error updating template:', error);
      toast.error('Failed to update template');
    }
  };
  
  const handleDownloadPDF = async () => {
    if (!cv || !cvData) {
      toast.error('CV data is not available for download');
      return;
    }
    
    setIsPdfGenerating(true);
    try {
      const filename = `CV-${cvData.fullName.replace(/\s+/g, '_')}-${selectedTemplate}.pdf`;
      await exportToPDF('cv-document', filename);
      toast.success('PDF downloaded successfully');
    } catch (error) {
      console.error('Error downloading PDF:', error);
      toast.error('Failed to generate PDF');
    } finally {
      setIsPdfGenerating(false);
    }
  };
  
  const handleGenerateCoverLetter = () => {
    // Implement cover letter generation
    toast.info('Cover letter generation coming soon');
    // This would navigate to cover letter generation page or modal
  };
  
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }
  
  if (!cv || !cvData) {
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
            disabled={isPdfGenerating}
          >
            <Download className="h-4 w-4" /> 
            {isPdfGenerating ? 'Generating...' : 'Download PDF'}
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
          Customized for the job description using {selectedTemplate} template.
        </p>
      </div>
      
      <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
        <div className="space-y-6 md:col-span-1">
          <Card className="p-4">
            <h3 className="mb-4 font-medium">Template</h3>
            <div className="space-y-2">
              {['modern', 'classic', 'creative', 'minimal'].map((template) => (
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
          <div className="mx-auto bg-white shadow-xl overflow-hidden rounded-lg">
            <div className="border-b bg-muted/50 p-4">
              <div className="flex items-center justify-between">
                <h2 className="font-medium">CV Preview</h2>
                <span className="text-xs text-muted-foreground">
                  {selectedTemplate.charAt(0).toUpperCase() + selectedTemplate.slice(1)} Template
                </span>
              </div>
            </div>
            
            <div className="overflow-hidden">
              {cvData && (
                <div className="scale-[0.7] origin-top-left ml-[-15%] mt-[-15%] w-[142.85%]">
                  <CVRenderer template={selectedTemplate} cvData={cvData} id="cv-document" />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
