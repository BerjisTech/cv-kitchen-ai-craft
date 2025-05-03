
import React, { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { FileUploader } from '@/components/kitchen/FileUploader';
import { AnalysisDetail } from '@/components/kitchen/AnalysisDetail';
import { JobDescriptionAnalyzer } from '@/components/kitchen/JobDescriptionAnalyzer';
import { RecentAnalysesList } from '@/components/kitchen/RecentAnalysesList';
import { ConnectionOptions } from '@/components/kitchen/ConnectionOptions';
import { CareerIngredientsSection } from '@/components/kitchen/CareerIngredientsSection';
import { DocumentsGrid } from '@/components/kitchen/DocumentsGrid';
import { LinkedInImport } from '@/components/kitchen/LinkedInImport';
import { useAuth } from '@/context/AuthContext';
import { getUserConnections } from '@/services/socialConnectionService';
import { getUserDocuments, UserDocument } from '@/services/documentService';
import { getRecentAnalyses, getAnalysisById, JobAnalysis } from '@/services/jobAnalysisService';
import { toast } from '@/components/ui/sonner';

const Kitchen = () => {
  const [userDocuments, setUserDocuments] = useState<UserDocument[]>([]);
  const [socialConnections, setSocialConnections] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [recentAnalyses, setRecentAnalyses] = useState<JobAnalysis[]>([]);
  const [selectedAnalysis, setSelectedAnalysis] = useState<JobAnalysis | null>(null);
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

  const handleViewAnalysis = async (id: string) => {
    try {
      const analysis = await getAnalysisById(id);
      if (analysis) {
        setSelectedAnalysis(analysis);
        // Scroll to the analysis detail section
        setTimeout(() => {
          document.getElementById('analysis-detail')?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    } catch (error) {
      console.error("Error fetching analysis:", error);
      toast.error("Failed to load analysis");
    }
  };

  const handleAnalysisComplete = async (analysisData: JobAnalysis) => {
    setSelectedAnalysis(analysisData);
    
    // Refresh the list of analyses
    const analyses = await getRecentAnalyses();
    setRecentAnalyses(analyses);
    
    // Scroll to the analysis detail
    setTimeout(() => {
      document.getElementById('analysis-detail')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };
  
  const handleDocumentDeleted = (id: string) => {
    setUserDocuments(userDocuments.filter(doc => doc.id !== id));
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
        <DocumentsGrid 
          documents={userDocuments} 
          onDocumentDeleted={handleDocumentDeleted} 
        />
        
        {/* LinkedIn Data Import */}
        <LinkedInImport />
        
        {/* Connection Options */}
        <ConnectionOptions 
          hasLinkedInConnection={hasLinkedInConnection}
          hasGitHubConnection={hasGitHubConnection}
          onFileUpload={handleUpload}
        />
        
        {/* Selected Analysis Detail */}
        {selectedAnalysis && (
          <div id="analysis-detail">
            <AnalysisDetail 
              analysis={selectedAnalysis} 
              onClose={() => setSelectedAnalysis(null)}
            />
          </div>
        )}
        
        {/* Job Description Analysis */}
        <JobDescriptionAnalyzer onAnalysisComplete={handleAnalysisComplete} />
        
        {/* Recent Analyses */}
        <RecentAnalysesList 
          analyses={recentAnalyses} 
          onViewAnalysis={handleViewAnalysis} 
        />
        
        {/* Career Ingredients */}
        <CareerIngredientsSection />
      </div>
    </MainLayout>
  );
};

export default Kitchen;
