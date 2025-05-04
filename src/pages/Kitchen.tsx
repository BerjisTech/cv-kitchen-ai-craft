import React, { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { FileUploader } from '@/components/kitchen/FileUploader';
import { AnalysisDetail } from '@/components/kitchen/AnalysisDetail';
import { JobDescriptionAnalyzer } from '@/components/kitchen/JobDescriptionAnalyzer';
import { RecentAnalysesList } from '@/components/kitchen/RecentAnalysesList';
import { ConnectionOptions } from '@/components/kitchen/ConnectionOptions';
import { CareerIngredientsSection } from '@/components/kitchen/CareerIngredientsSection';
import { DocumentsGrid } from '@/components/kitchen/DocumentsGrid';
import { CVDocumentsList } from '@/components/kitchen/CVDocumentsList';
import { LinkedInImport } from '@/components/kitchen/LinkedInImport';
import { useAuth } from '@/context/AuthContext';
import { getUserConnections } from '@/services/socialConnectionService';
import { getUserDocuments, UserDocument } from '@/services/documentService';
import { getRecentAnalyses, getAnalysisById, JobAnalysis } from '@/services/jobAnalysisService';
import { toast } from '@/components/ui/sonner';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { 
  extractAndAnalyzeCv,
  extractAndAnalyzeMultipleCvs,
  updateProfileWithFrontendParsedData 
} from '@/services/cv/frontendParserService';

// Direct URL to storage bucket
const STORAGE_URL = `${import.meta.env.VITE_SUPABASE_URL || 'https://rnjxbvsodatbxaswmiol.supabase.co'}/storage/v1/object/public/career-uploads/`;

const Kitchen = () => {
  const [userDocuments, setUserDocuments] = useState<UserDocument[]>([]);
  const [cvDocuments, setCVDocuments] = useState<UserDocument[]>([]);
  const [socialConnections, setSocialConnections] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingCVs, setIsLoadingCVs] = useState(true);
  const [isLoadingAnalyses, setIsLoadingAnalyses] = useState(true);
  const [recentAnalyses, setRecentAnalyses] = useState<JobAnalysis[]>([]);
  const [selectedAnalysis, setSelectedAnalysis] = useState<JobAnalysis | null>(null);
  const { user } = useAuth();
  
  useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
        setIsLoading(true);
        setIsLoadingCVs(true);
        setIsLoadingAnalyses(true);
        
        try {
          // Get all documents
          const docs = await getUserDocuments();
          const cvDocs = docs.filter(doc => doc.document_type === 'cv');
          
          setUserDocuments(docs);
          setCVDocuments(cvDocs);
          setIsLoadingCVs(false);
          
          // Get connections
          try {
            const connections = await getUserConnections();
            setSocialConnections(connections);
          } catch (error) {
            console.error("Error fetching user connections:", error);
          }
          
          // Get analyses
          try {
            const analyses = await getRecentAnalyses();
            setRecentAnalyses(analyses);
            setIsLoadingAnalyses(false);
          } catch (error) {
            console.error("Error fetching recent analyses:", error);
            setIsLoadingAnalyses(false);
          }
          
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
  
  const handleUpload = async (files: FileList) => {
    console.log('Upload handled by FileUploader component');
    // Refresh the documents list after upload
    try {
      const docs = await getUserDocuments();
      const cvDocs = docs.filter(doc => doc.document_type === 'cv');
      setUserDocuments(docs);
      setCVDocuments(cvDocs);
    } catch (error) {
      console.error("Error refreshing documents:", error);
    }
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
    try {
      const analyses = await getRecentAnalyses();
      setRecentAnalyses(analyses);
    } catch (error) {
      console.error("Error refreshing analyses:", error);
    }
    
    // Scroll to the analysis detail
    setTimeout(() => {
      document.getElementById('analysis-detail')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };
  
  const handleDocumentDeleted = (id: string) => {
    setUserDocuments(userDocuments.filter(doc => doc.id !== id));
    setCVDocuments(cvDocuments.filter(doc => doc.id !== id));
  };
  
  const handleExtractCVData = async (documentId: string) => {
    try {
      toast.info("Extracting data from CV...");
      
      // Get document details
      const { data: document, error: documentError } = await supabase
        .from('user_documents')
        .select('*')
        .eq('id', documentId)
        .single();
      
      if (documentError || !document) {
        console.error("Error getting document details:", documentError);
        toast.error("Could not find document details. The document may have been deleted.");
        return;
      }
      
      // Simply combine the storage URL with the filepath directly
      const directUrl = STORAGE_URL + document.filepath;
      console.log('Using direct CV URL:', directUrl);
      
      // Process the CV using the frontend parser with direct URL
      const cvData = await extractAndAnalyzeCv(directUrl);
      
      if (cvData) {
        // Update profile with the extracted data
        const success = await updateProfileWithFrontendParsedData(cvData);
        if (success) {
          toast.success("Profile updated with CV data");
        }
      }
    } catch (error) {
      console.error("Error extracting CV data:", error);
      toast.error("Failed to extract data from CV");
    }
  };
  
  const handleExtractAllCVData = async () => {
    try {
      if (cvDocuments.length === 0) {
        toast.error("No CV documents found");
        return;
      }
      
      toast.info(`Processing ${cvDocuments.length} CVs...`);
      
      // Create direct URLs for all CVs
      const directUrls = cvDocuments.map(doc => STORAGE_URL + doc.filepath);
      console.log('Direct URLs for CV processing:', directUrls);
      
      // Process all CVs with direct URLs
      const combinedData = await extractAndAnalyzeMultipleCvs(directUrls);
      
      if (combinedData) {
        // Update profile with the extracted data
        const success = await updateProfileWithFrontendParsedData(combinedData);
        if (success) {
          toast.success("Profile updated with combined CV data");
        }
      }
    } catch (error) {
      console.error("Error extracting all CV data:", error);
      toast.error("Failed to process CV documents");
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
        
        {/* Process All CVs Button (New) */}
        {cvDocuments.length > 0 && (
          <Button 
            className="w-full bg-blue-700 hover:bg-blue-800 text-white"
            onClick={handleExtractAllCVData}
          >
            Extract Data from All CVs
          </Button>
        )}
        
        {/* CV Documents List */}
        {(cvDocuments.length > 0 || isLoadingCVs) && (
          <CVDocumentsList 
            documents={cvDocuments}
            onDocumentDeleted={handleDocumentDeleted}
            onExtractData={handleExtractCVData}
            isLoading={isLoadingCVs}
          />
        )}
        
        {/* User Documents Display */}
        <DocumentsGrid 
          documents={userDocuments} 
          onDocumentDeleted={handleDocumentDeleted} 
          isLoading={isLoading && userDocuments.length === 0}
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
          isLoading={isLoadingAnalyses}
        />
        
        {/* Career Ingredients */}
        <CareerIngredientsSection />
      </div>
    </MainLayout>
  );
};

export default Kitchen;
