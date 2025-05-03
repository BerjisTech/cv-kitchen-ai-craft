
import React, { useState, useEffect } from 'react';
import { JobAnalysis } from '@/services/jobAnalysisService';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, FileText, Download } from 'lucide-react';
import { generateTailoredCV, getTailoredCV, TailoredCV } from '@/services/tailoredCVService';
import { toast } from '@/components/ui/sonner';

interface AnalysisDetailProps {
  analysis: JobAnalysis | null;
  onClose: () => void;
}

export const AnalysisDetail: React.FC<AnalysisDetailProps> = ({ analysis, onClose }) => {
  const [isGeneratingCV, setIsGeneratingCV] = useState(false);
  const [tailoredCV, setTailoredCV] = useState<TailoredCV | null>(null);

  useEffect(() => {
    // Check if we already have a tailored CV for this analysis
    const checkExistingCV = async () => {
      if (analysis) {
        const existingCV = await getTailoredCV(analysis.id);
        if (existingCV) {
          setTailoredCV(existingCV);
        }
      }
    };
    
    checkExistingCV();
  }, [analysis]);

  if (!analysis) return null;

  // Split the analysis text into sections based on common headings
  const renderAnalysisContent = () => {
    // Convert line breaks to paragraphs
    return analysis.analysis.split('\n').map((paragraph, index) => {
      // Check if this is a heading (indicated by formatting like "## Heading")
      if (paragraph.startsWith('#') || paragraph.match(/^\d+\.\s/)) {
        return <h4 key={index} className="font-medium mt-4 mb-2">{paragraph.replace(/^#+\s|^\d+\.\s/, '')}</h4>;
      } 
      // Check if this is a bullet point
      else if (paragraph.match(/^[-*•]\s/)) {
        return <li key={index} className="ml-5">{paragraph.replace(/^[-*•]\s/, '')}</li>;
      }
      // Empty line becomes a small spacer
      else if (paragraph.trim() === '') {
        return <div key={index} className="h-2"></div>;
      }
      // Regular paragraph
      else {
        return <p key={index} className="mb-2 text-sm text-muted-foreground">{paragraph}</p>;
      }
    });
  };

  const handleGenerateCV = async () => {
    if (!analysis) return;
    
    setIsGeneratingCV(true);
    try {
      const result = await generateTailoredCV(analysis.job_description, analysis.id);
      if (result) {
        setTailoredCV(result);
        toast.success("CV has been generated successfully!");
      }
    } catch (error) {
      console.error("Error generating CV:", error);
      toast.error("Failed to generate CV");
    } finally {
      setIsGeneratingCV(false);
    }
  };

  return (
    <Card className="p-5 mb-6 relative">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-medium text-lg">Job Analysis Results</h3>
        <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="mb-4">
        <h4 className="font-medium text-sm text-muted-foreground mb-1">Job Description:</h4>
        <div className="max-h-20 overflow-y-auto bg-muted/30 p-3 rounded-md text-sm">
          {analysis.job_description}
        </div>
      </div>

      <div className="mt-4 text-sm">
        <h4 className="font-medium mb-2">Analysis:</h4>
        <div className="bg-muted/20 rounded-md p-4">
          {renderAnalysisContent()}
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-2">
        {tailoredCV ? (
          <Button 
            className="bg-green-600 hover:bg-green-700"
            onClick={() => window.open(`/kitchen/cv-viewer/${tailoredCV.id}`, '_blank')}
          >
            <FileText className="mr-2 h-4 w-4" /> View Generated CV
          </Button>
        ) : (
          <Button 
            className="bg-blue-600 hover:bg-blue-700" 
            onClick={handleGenerateCV}
            disabled={isGeneratingCV}
          >
            <FileText className="mr-2 h-4 w-4" /> {isGeneratingCV ? "Generating CV..." : "Generate CV for This Job"}
          </Button>
        )}
      </div>

      <div className="mt-4 text-xs text-muted-foreground">
        Analyzed on {new Date(analysis.created_at).toLocaleString()}
      </div>
    </Card>
  );
};
