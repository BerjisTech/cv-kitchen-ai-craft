
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { TailoredCV, CV_TEMPLATES, updateCVTemplate } from '@/services/tailoredCVService';
import { toast } from '@/components/ui/sonner';
import { Download, ArrowLeft, Mail } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const CVViewer: React.FC = () => {
  const { cvId } = useParams<{ cvId: string }>();
  const navigate = useNavigate();
  const [cv, setCv] = useState<TailoredCV | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState('modern');
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [isGeneratingCoverLetter, setIsGeneratingCoverLetter] = useState(false);

  useEffect(() => {
    const fetchCV = async () => {
      if (!cvId) {
        toast.error("No CV ID provided");
        navigate('/kitchen');
        return;
      }

      try {
        const { data, error } = await supabase
          .from('tailored_cvs')
          .select('*')
          .eq('id', cvId)
          .single();

        if (error) {
          throw error;
        }

        setCv(data as TailoredCV);
        setSelectedTemplate(data.template);
      } catch (error) {
        console.error("Error fetching CV:", error);
        toast.error("Failed to load CV");
        navigate('/kitchen');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCV();
  }, [cvId, navigate]);

  const handleTemplateChange = async (template: string) => {
    if (!cvId) return;
    
    setSelectedTemplate(template);
    
    try {
      await updateCVTemplate(cvId, template);
    } catch (error) {
      console.error("Error updating template:", error);
      toast.error("Failed to update template");
    }
  };

  const handleDownloadPDF = async () => {
    if (!cvId) return;
    
    setIsGeneratingPDF(true);
    try {
      // In a real implementation, this would call an API to generate and download the PDF
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API call
      toast.success("PDF downloaded successfully");
    } catch (error) {
      console.error("Error downloading PDF:", error);
      toast.error("Failed to download PDF");
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const handleGenerateCoverLetter = async () => {
    if (!cv) return;
    
    setIsGeneratingCoverLetter(true);
    try {
      // In a real implementation, this would call an API to generate a cover letter
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API call
      toast.success("Cover letter generated successfully");
      navigate(`/kitchen/cover-letter/${cvId}`);
    } catch (error) {
      console.error("Error generating cover letter:", error);
      toast.error("Failed to generate cover letter");
    } finally {
      setIsGeneratingCoverLetter(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p>Loading CV...</p>
      </div>
    );
  }

  if (!cv) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p>CV not found</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-6">
        <Button 
          variant="outline" 
          onClick={() => navigate('/kitchen')}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Kitchen
        </Button>
        <h1 className="text-2xl font-bold">Your Tailored CV</h1>
        <p className="text-muted-foreground">
          This CV has been tailored based on the job description analysis.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="p-6">
            <div className="mb-4">
              <h2 className="text-xl font-semibold mb-2">
                {cv.cv_content.header?.name || "Your Name"}
              </h2>
              <p className="text-muted-foreground">
                {cv.cv_content.header?.email && `${cv.cv_content.header.email} | `}
                {cv.cv_content.header?.phone && `${cv.cv_content.header.phone} | `}
                {cv.cv_content.header?.location}
              </p>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-medium mb-2">Professional Summary</h3>
              <p>{cv.cv_content.summary}</p>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-medium mb-3">Work Experience</h3>
              {cv.cv_content.workExperience?.map((job: any, index: number) => (
                <div key={index} className="mb-4">
                  <div className="flex justify-between items-start">
                    <h4 className="font-medium">{job.title} at {job.company}</h4>
                    <span className="text-sm text-muted-foreground">{job.dates}</span>
                  </div>
                  <ul className="list-disc pl-5 mt-2">
                    {job.bullets.map((bullet: string, idx: number) => (
                      <li key={idx} className="text-sm mb-1">{bullet}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-medium mb-3">Education</h3>
              {cv.cv_content.education?.map((edu: any, index: number) => (
                <div key={index} className="mb-2">
                  <div className="flex justify-between">
                    <h4 className="font-medium">{edu.degree}</h4>
                    <span className="text-sm text-muted-foreground">{edu.year}</span>
                  </div>
                  <p className="text-sm">{edu.institution}</p>
                </div>
              ))}
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-medium mb-2">Skills</h3>
              <div className="flex flex-wrap gap-2">
                {cv.cv_content.skills?.map((skill: string, index: number) => (
                  <span 
                    key={index} 
                    className="bg-muted px-3 py-1 rounded-full text-sm"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {cv.cv_content.certifications && cv.cv_content.certifications.length > 0 && (
              <div>
                <h3 className="text-lg font-medium mb-2">Certifications</h3>
                <ul className="list-disc pl-5">
                  {cv.cv_content.certifications.map((cert: string, index: number) => (
                    <li key={index}>{cert}</li>
                  ))}
                </ul>
              </div>
            )}
          </Card>
        </div>

        <div>
          <Card className="p-6 mb-6">
            <h3 className="text-lg font-medium mb-4">CV Template</h3>
            <Tabs 
              defaultValue={selectedTemplate} 
              value={selectedTemplate}
              onValueChange={handleTemplateChange}
              className="w-full"
            >
              <TabsList className="grid grid-cols-3 mb-4">
                {CV_TEMPLATES.map(template => (
                  <TabsTrigger key={template.id} value={template.id}>
                    {template.name}
                  </TabsTrigger>
                ))}
              </TabsList>
              
              {CV_TEMPLATES.map(template => (
                <TabsContent key={template.id} value={template.id} className="mt-0">
                  <div className="bg-muted aspect-[3/4] rounded-md flex items-center justify-center">
                    <p className="text-center text-muted-foreground text-sm">
                      {template.name} Template Preview
                    </p>
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-medium mb-4">Actions</h3>
            <div className="space-y-3">
              <Button 
                className="w-full bg-blue-600 hover:bg-blue-700"
                onClick={handleDownloadPDF}
                disabled={isGeneratingPDF}
              >
                <Download className="mr-2 h-4 w-4" /> 
                {isGeneratingPDF ? "Generating PDF..." : "Download CV as PDF"}
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full"
                onClick={handleGenerateCoverLetter}
                disabled={isGeneratingCoverLetter}
              >
                <Mail className="mr-2 h-4 w-4" /> 
                {isGeneratingCoverLetter ? "Generating..." : "Generate Cover Letter"}
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => navigate('/shelf')}
              >
                Save to Shelf
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
