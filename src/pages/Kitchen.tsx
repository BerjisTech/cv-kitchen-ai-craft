
import React, { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Upload, FileUp, Linkedin, Github, ArrowRight, FileText, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { FileUploader } from '@/components/kitchen/FileUploader';
import { AnalysisItem } from '@/components/kitchen/AnalysisItem';
import { AnalysisDetail } from '@/components/kitchen/AnalysisDetail';
import { CareerIngredientCard } from '@/components/kitchen/CareerIngredientCard';
import { useTheme } from '@/context/ThemeProvider';
import { connectWithGitHub, connectWithLinkedIn, getUserConnections } from '@/services/socialConnectionService';
import { getUserDocuments, UserDocument, deleteDocument, getDownloadUrl } from '@/services/documentService';
import { analyzeJobDescription, getRecentAnalyses, getAnalysisById, JobAnalysis } from '@/services/jobAnalysisService';
import { useAuth } from '@/context/AuthContext';
import { toast } from '@/components/ui/sonner';

const Kitchen = () => {
  const [jobDescription, setJobDescription] = useState('');
  const [userDocuments, setUserDocuments] = useState<UserDocument[]>([]);
  const [socialConnections, setSocialConnections] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [recentAnalyses, setRecentAnalyses] = useState<JobAnalysis[]>([]);
  const [selectedAnalysis, setSelectedAnalysis] = useState<JobAnalysis | null>(null);
  const { colorPalette } = useTheme();
  const { user } = useAuth();
  
  useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
        setIsLoading(true);
        try {
          const docs = await getUserDocuments('cv');
          const connections = await getUserConnections();
          const analyses = await getRecentAnalyses();
          
          setUserDocuments(docs);
          setSocialConnections(connections);
          setRecentAnalyses(analyses);
        } catch (error) {
          console.error("Error fetching user data:", error);
          toast.error("Failed to load your data");
        } finally {
          setIsLoading(false);
        }
      }
    };
    
    fetchUserData();
  }, [user]);
  
  const handleUpload = (files: FileList) => {
    console.log('Upload handled by FileUploader component');
    // We'll refresh the documents list after upload
    getUserDocuments('cv').then(docs => setUserDocuments(docs));
  };

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
        
        // Fetch the full analysis details
        const analysisDetails = await getAnalysisById(result.id);
        if (analysisDetails) {
          setSelectedAnalysis(analysisDetails);
        }
        
        // Refresh the list of analyses
        const analyses = await getRecentAnalyses();
        setRecentAnalyses(analyses);
      }
    } catch (error) {
      console.error("Error analyzing job description:", error);
      toast.error("Failed to analyze job description");
    } finally {
      setIsAnalyzing(false);
    }
  };
  
  const handleViewAnalysis = async (id: string) => {
    try {
      const analysis = await getAnalysisById(id);
      setSelectedAnalysis(analysis);
    } catch (error) {
      console.error("Error fetching analysis:", error);
      toast.error("Failed to load analysis");
    }
  };
  
  const handleDownloadCV = async (filepath: string, filename: string) => {
    const url = await getDownloadUrl(filepath);
    if (url) {
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } else {
      toast.error("Failed to generate download link");
    }
  };
  
  const handleDeleteCV = async (id: string) => {
    const confirmed = window.confirm("Are you sure you want to delete this document?");
    if (confirmed) {
      const success = await deleteDocument(id);
      if (success) {
        setUserDocuments(userDocuments.filter(doc => doc.id !== id));
      }
    }
  };
  
  const hasLinkedInConnection = socialConnections.some(conn => conn.provider === 'linkedin');
  const hasGitHubConnection = socialConnections.some(conn => conn.provider === 'github');
  
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
        
        {/* User CV Display */}
        {userDocuments.length > 0 && (
          <div className="mt-6">
            <h3 className="font-medium text-lg mb-3">Your CV Documents</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {userDocuments.map((doc) => (
                <Card key={doc.id} className="p-4 flex flex-col">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <FileText className="h-5 w-5 text-blue-500" />
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <h4 className="text-sm font-medium truncate">{doc.filename}</h4>
                      <p className="text-xs text-muted-foreground">
                        {new Date(doc.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="mt-auto pt-2 flex justify-between">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleDownloadCV(doc.filepath, doc.filename)}
                    >
                      Download
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-red-500 hover:text-red-700"
                      onClick={() => handleDeleteCV(doc.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
        
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
            
            <Button 
              variant="outline" 
              className="w-full flex items-center justify-center gap-2"
              onClick={() => document.getElementById('cv-file-input')?.click()}
            >
              <FileUp className="h-4 w-4" />
              <span>Upload CV</span>
              <input
                id="cv-file-input"
                type="file"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files.length > 0) {
                    handleUpload(e.target.files);
                  }
                }}
                accept="application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              />
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
              onClick={connectWithLinkedIn}
              disabled={hasLinkedInConnection}
            >
              <Linkedin className="h-4 w-4" />
              <span>{hasLinkedInConnection ? 'LinkedIn Connected' : 'Connect LinkedIn'}</span>
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
              onClick={connectWithGitHub}
              disabled={hasGitHubConnection}
            >
              <Github className="h-4 w-4" />
              <span>{hasGitHubConnection ? 'GitHub Connected' : 'Connect GitHub'}</span>
            </Button>
          </Card>
        </div>
        
        {/* Selected Analysis Detail */}
        {selectedAnalysis && (
          <AnalysisDetail 
            analysis={selectedAnalysis} 
            onClose={() => setSelectedAnalysis(null)}
          />
        )}
        
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
        
        {/* Recent Analyses */}
        {recentAnalyses.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-medium text-lg">Recent Analyses</h3>
            
            <Card className="overflow-hidden">
              {recentAnalyses.map((analysis) => (
                <React.Fragment key={analysis.id}>
                  <AnalysisItem 
                    title={analysis.job_description.substring(0, 60) + (analysis.job_description.length > 60 ? '...' : '')}
                    timeAgo={new Date(analysis.created_at).toLocaleDateString()}
                    onClick={() => handleViewAnalysis(analysis.id)}
                  />
                  <div className="border-t border-border"></div>
                </React.Fragment>
              ))}
            </Card>
          </div>
        )}
        
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
