
import React, { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Upload, FileUp, Linkedin, Github, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { FileUploader } from '@/components/kitchen/FileUploader';
import { AnalysisItem } from '@/components/kitchen/AnalysisItem';
import { CareerIngredientCard } from '@/components/kitchen/CareerIngredientCard';
import { useTheme } from '@/context/ThemeProvider';

const Kitchen = () => {
  const [jobDescription, setJobDescription] = useState('');
  const { colorPalette } = useTheme();
  
  const handleUpload = (files: FileList) => {
    console.log('Uploaded files:', files);
    // Here you would handle the file upload to your backend
  };

  const handleJobDescriptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setJobDescription(e.target.value);
  };

  const handleAnalyze = () => {
    console.log('Analyzing job description:', jobDescription);
    // Here you would send the job description to your analysis backend
  };
  
  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header Section */}
        <div>
          <h1 className="text-2xl font-bold">Your Career Kitchen</h1>
          <p className="text-muted-foreground mt-1">
            Upload your career ingredients here. We'll analyze and organize them for you.
          </p>
        </div>
        
        {/* Main Upload Area */}
        <FileUploader onUpload={handleUpload} />
        
        {/* Connection Options */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Previous CVs */}
          <Card className="p-5 space-y-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                <FileUp className="h-4 w-4 text-blue-500" />
              </div>
              <h3 className="font-medium text-foreground">Previous CVs</h3>
            </div>
            
            <p className="text-sm text-muted-foreground">
              Upload your existing CVs to extract your experience and skills automatically.
            </p>
            
            <Button variant="outline" className="w-full flex items-center justify-center gap-2">
              <FileUp className="h-4 w-4" />
              <span>Upload CV</span>
            </Button>
          </Card>
          
          {/* LinkedIn Import */}
          <Card className="p-5 space-y-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                <Linkedin className="h-4 w-4 text-blue-500" />
              </div>
              <h3 className="font-medium text-foreground">LinkedIn Import</h3>
            </div>
            
            <p className="text-sm text-muted-foreground">
              Connect your LinkedIn profile to import your professional experience.
            </p>
            
            <Button 
              className="w-full bg-blue-600 hover:bg-blue-700 flex items-center justify-center gap-2"
            >
              <Linkedin className="h-4 w-4" />
              <span>Connect LinkedIn</span>
            </Button>
          </Card>
          
          {/* GitHub Import */}
          <Card className="p-5 space-y-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                <Github className="h-4 w-4 text-blue-500" />
              </div>
              <h3 className="font-medium text-foreground">GitHub Import</h3>
            </div>
            
            <p className="text-sm text-muted-foreground">
              Connect GitHub to showcase your projects and technical contributions.
            </p>
            
            <Button 
              variant="outline"
              className="w-full bg-gray-800 text-white hover:bg-gray-900 flex items-center justify-center gap-2"
            >
              <Github className="h-4 w-4" />
              <span>Connect GitHub</span>
            </Button>
          </Card>
        </div>
        
        {/* Job Description Analysis */}
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
            
            <div className="flex gap-2">
              <Input 
                placeholder="Paste job description URL or text"
                value={jobDescription}
                onChange={handleJobDescriptionChange}
                className="flex-1"
              />
              <Button 
                onClick={handleAnalyze}
                className="bg-blue-500 hover:bg-blue-600"
              >
                Analyze
              </Button>
            </div>
          </div>
        </Card>
        
        {/* Recent Analyses */}
        <div className="space-y-3">
          <h3 className="font-medium text-lg">Recent Analyses</h3>
          
          <Card className="overflow-hidden">
            <AnalysisItem 
              title="Frontend Developer at Google"
              timeAgo="2 days ago"
            />
            
            <div className="border-t border-border"></div>
            
            <AnalysisItem 
              title="UX Designer at Apple"
              timeAgo="1 week ago"
            />
          </Card>
        </div>
        
        {/* Career Ingredients */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-orange-100 flex items-center justify-center">
                <Upload className="h-3 w-3 text-orange-500" />
              </div>
              <h3 className="font-medium text-lg">Career Ingredients</h3>
            </div>
            <Button variant="link" className="text-blue-500 p-0">Edit All</Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <CareerIngredientCard 
              title="Experience"
              count={3}
              description="Your work history and professional roles"
            />
            
            <CareerIngredientCard 
              title="Education"
              count={2}
              description="Your degrees, certifications and courses"
            />
            
            <CareerIngredientCard 
              title="Skills"
              count={12}
              description="Technical and soft skills accumulated"
              accentColor="amber"
            />
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Kitchen;
