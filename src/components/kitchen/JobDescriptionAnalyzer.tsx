
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { analyzeJobDescription } from '@/services/jobAnalysisService';
import { toast } from '@/components/ui/sonner';
import { JobAnalysis } from '@/services/jobAnalysisService';

interface JobDescriptionAnalyzerProps {
  onAnalysisComplete: (analysis: JobAnalysis) => void;
}

export const JobDescriptionAnalyzer: React.FC<JobDescriptionAnalyzerProps> = ({ 
  onAnalysisComplete 
}) => {
  const [jobDescription, setJobDescription] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleJobDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setJobDescription(e.target.value);
  };

  const handleAnalyze = async () => {
    if (!jobDescription.trim()) {
      toast.error("Please enter a job description to analyze");
      return;
    }
    
    setIsAnalyzing(true);
    
    try {
      const result = await analyzeJobDescription(jobDescription);
      
      if (result) {
        toast.success("Job description analyzed successfully");
        
        // Notify parent component
        const analysisDetails = result as unknown as JobAnalysis; 
        onAnalysisComplete(analysisDetails);
      }
    } catch (error) {
      console.error("Error analyzing job description:", error);
      toast.error("Failed to analyze job description");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <Card className="p-5">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-medium text-lg">Job Description Analysis</h3>
        <span className="text-sm text-muted-foreground">Helps tailor your CV</span>
      </div>
      
      <div>
        <h4 className="font-medium mb-1">Upload Job Description</h4>
        <p className="text-sm text-muted-foreground mb-4">
          Our AI will analyze the job description and suggest how to tailor your CV for best match.
        </p>
        
        <Textarea 
          placeholder="Paste job description text here..."
          value={jobDescription}
          onChange={handleJobDescriptionChange}
          className="mb-4 min-h-[100px]"
        />
        
        <Button 
          onClick={handleAnalyze}
          className="bg-blue-500 hover:bg-blue-600 w-full md:w-auto"
          disabled={isAnalyzing}
        >
          {isAnalyzing ? "Analyzing..." : "Analyze Job Description"}
        </Button>
      </div>
    </Card>
  );
};
