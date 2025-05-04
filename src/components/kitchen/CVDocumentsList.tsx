
import React, { useState } from 'react';
import { FileText, Trash2, RefreshCw, Sparkles, Loader2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { UserDocument } from '@/services/documentService';
import { deleteDocument } from '@/services/documentService';
import { toast } from '@/components/ui/sonner';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip';
import { 
  extractCVData, 
  updateProfileWithCVData, 
  enhanceUserProfile,
  extractCVDataAdvanced 
} from '@/services/cvDataExtractorService';
import {
  Checkbox
} from '@/components/ui/checkbox';

interface CVDocumentsListProps {
  documents: UserDocument[];
  onDocumentDeleted: (id: string) => void;
  onExtractData: (id: string) => void;
  isLoading?: boolean;
}

export const CVDocumentsList: React.FC<CVDocumentsListProps> = ({
  documents,
  onDocumentDeleted,
  onExtractData,
  isLoading = false
}) => {
  const [processingDocs, setProcessingDocs] = useState<{ [key: string]: boolean }>({});
  const [deletingDocs, setDeletingDocs] = useState<{ [key: string]: boolean }>({});
  const [processingAllDocs, setProcessingAllDocs] = useState(false);
  const [enhancingProfile, setEnhancingProfile] = useState(false);
  const [retryAttempts, setRetryAttempts] = useState<{ [key: string]: number }>({});
  const [selectedDocs, setSelectedDocs] = useState<{ [key: string]: boolean }>({});
  
  const handleDelete = async (id: string) => {
    setDeletingDocs(prev => ({ ...prev, [id]: true }));
    try {
      await deleteDocument(id);
      onDocumentDeleted(id);
      toast.success('CV deleted successfully');
    } catch (error) {
      console.error('Error deleting document:', error);
      toast.error('Failed to delete CV');
    } finally {
      setDeletingDocs(prev => ({ ...prev, [id]: false }));
    }
  };
  
  const handleExtractData = async (id: string, isRetry = false) => {
    setProcessingDocs(prev => ({ ...prev, [id]: true }));
    
    try {
      if (!isRetry) {
        toast.info('Extracting data from CV, please wait...');
      } else {
        toast.info('Retrying extraction, please wait...');
      }
      
      await onExtractData(id);
      
      // Reset retry counter on success
      setRetryAttempts(prev => ({ ...prev, [id]: 0 }));
      toast.success('CV data extracted successfully! Your profile has been updated.');
    } catch (error) {
      console.error('Error extracting data:', error);
      
      // Increment retry counter for this document
      const currentRetries = retryAttempts[id] || 0;
      setRetryAttempts(prev => ({ ...prev, [id]: currentRetries + 1 }));
      
      // Only allow up to 2 automatic retries
      if (currentRetries < 2) {
        toast.error(`Extraction failed, automatically retrying (attempt ${currentRetries + 1}/3)...`);
        // Wait a moment before retrying
        setTimeout(() => handleExtractData(id, true), 2000); 
      } else {
        toast.error('Failed to extract data from CV after multiple attempts.');
      }
    } finally {
      setProcessingDocs(prev => ({ ...prev, [id]: false }));
    }
  };
  
  const handleExtractAllData = async () => {
    if (documents.length === 0) {
      toast.info('No CVs available to extract data from');
      return;
    }
    
    setProcessingAllDocs(true);
    toast.info(`Processing ${documents.length} CVs, please wait...`);
    
    try {
      // Process CVs one by one
      let successCount = 0;
      for (const doc of documents) {
        try {
          setProcessingDocs(prev => ({ ...prev, [doc.id]: true }));
          toast.info(`Processing ${doc.filename}...`);
          await onExtractData(doc.id);
          successCount++;
          setProcessingDocs(prev => ({ ...prev, [doc.id]: false }));
        } catch (error) {
          console.error(`Error processing CV ${doc.filename}:`, error);
          setProcessingDocs(prev => ({ ...prev, [doc.id]: false }));
        }
      }
      
      if (successCount === documents.length) {
        toast.success(`Successfully extracted data from all ${successCount} CVs!`);
      } else if (successCount > 0) {
        toast.success(`Successfully processed ${successCount} out of ${documents.length} CVs.`);
      } else {
        toast.error('Failed to extract data from any CVs.');
      }
    } catch (error) {
      console.error('Error processing CVs:', error);
      toast.error('Failed to extract data from CVs');
    } finally {
      setProcessingAllDocs(false);
      
      // Reload the page to ensure all components reflect the updated data
      toast.info('Reloading page to show updated data...');
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    }
  };
  
  const handleEnhanceProfile = async () => {
    setEnhancingProfile(true);
    toast.info('Enhancing your profile with all available data...');
    
    try {
      const success = await enhanceUserProfile();
      
      if (success) {
        toast.success('Profile enhanced successfully!');
        
        // Reload the page to show the updated profile data
        toast.info('Reloading page to show your enhanced profile...');
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        toast.error('Failed to enhance profile');
      }
    } catch (error) {
      console.error('Error enhancing profile:', error);
      toast.error('Failed to enhance profile');
    } finally {
      setEnhancingProfile(false);
    }
  };
  
  const handleAdvancedExtraction = async () => {
    const selectedDocIds = Object.keys(selectedDocs).filter(id => selectedDocs[id]);
    
    if (selectedDocIds.length === 0) {
      toast.warning('Please select at least one CV to process');
      return;
    }
    
    setProcessingAllDocs(true);
    toast.info(`Processing ${selectedDocIds.length} selected CVs with advanced extraction...`);
    
    try {
      // Mark all selected docs as processing
      const newProcessingDocs = { ...processingDocs };
      selectedDocIds.forEach(id => {
        newProcessingDocs[id] = true;
      });
      setProcessingDocs(newProcessingDocs);
      
      // Call the advanced extraction service
      const extractedData = await extractCVDataAdvanced(selectedDocIds);
      
      if (extractedData) {
        // Update the profile with the extracted data
        const success = await updateProfileWithCVData(extractedData);
        
        if (success) {
          toast.success('Profile updated with advanced CV data extraction!');
          
          // Reload the page to show the updated profile data
          toast.info('Reloading page to show your enhanced profile...');
          setTimeout(() => {
            window.location.reload();
          }, 1500);
        } else {
          toast.error('Failed to update profile with extracted data');
        }
      } else {
        toast.error('Advanced extraction failed to return usable data');
      }
    } catch (error) {
      console.error('Error in advanced extraction:', error);
      toast.error('An error occurred during advanced extraction');
    } finally {
      // Clear processing states
      setProcessingAllDocs(false);
      const newProcessingDocs = { ...processingDocs };
      selectedDocIds.forEach(id => {
        newProcessingDocs[id] = false;
      });
      setProcessingDocs(newProcessingDocs);
    }
  };
  
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM d, yyyy');
    } catch (error) {
      return 'Unknown date';
    }
  };
  
  const toggleSelectAll = (checked: boolean) => {
    const newSelected: { [key: string]: boolean } = {};
    documents.forEach(doc => {
      newSelected[doc.id] = checked;
    });
    setSelectedDocs(newSelected);
  };
  
  const toggleSelectDocument = (docId: string, checked: boolean) => {
    setSelectedDocs(prev => ({
      ...prev,
      [docId]: checked
    }));
  };
  
  const selectedCount = Object.values(selectedDocs).filter(Boolean).length;

  return (
    <div>
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-lg font-semibold">Uploaded CVs</h2>
        <div className="flex gap-2">
          <Button 
            size="sm" 
            variant="default"
            className="gap-2"
            onClick={handleEnhanceProfile}
            disabled={enhancingProfile || processingAllDocs || documents.length === 0}
          >
            <Sparkles size={16} className={enhancingProfile ? 'animate-pulse' : ''} />
            Enhance Profile
          </Button>
          
          {selectedCount > 0 && (
            <Button
              size="sm"
              variant="secondary"
              className="gap-2"
              onClick={handleAdvancedExtraction}
              disabled={processingAllDocs || enhancingProfile}
            >
              <Loader2 size={16} className={processingAllDocs ? 'animate-spin' : ''} />
              Process {selectedCount} Selected
            </Button>
          )}
          
          {documents.length > 1 && (
            <Button 
              size="sm" 
              variant="outline"
              className="gap-2"
              onClick={handleExtractAllData}
              disabled={processingAllDocs || enhancingProfile}
            >
              <RefreshCw size={16} className={processingAllDocs ? 'animate-spin' : ''} />
              Extract All CVs
            </Button>
          )}
        </div>
      </div>
      
      {documents.length > 1 && (
        <div className="flex justify-end mb-2 gap-2 items-center">
          <label className="text-sm text-muted-foreground cursor-pointer">
            <Checkbox 
              checked={documents.length > 0 && selectedCount === documents.length}
              onCheckedChange={(checked) => toggleSelectAll(checked === true)}
              className="mr-1"
              disabled={isLoading || processingAllDocs}
            /> 
            Select all
          </label>
        </div>
      )}
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {isLoading ? (
          Array(2).fill(0).map((_, index) => (
            <Card key={index} className="p-4 flex flex-col">
              <div className="flex items-start gap-3">
                <Skeleton className="w-12 h-12 rounded-md" />
                <div className="flex-1">
                  <Skeleton className="h-5 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2 mb-2" />
                  <Skeleton className="h-3 w-1/3" />
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <Skeleton className="h-9 w-9 rounded" />
                <Skeleton className="h-9 w-9 rounded" />
              </div>
            </Card>
          ))
        ) : (
          documents.map(doc => (
            <Card key={doc.id} className="p-4 flex flex-col">
              <div className="flex items-start gap-3">
                <div className="relative">
                  {documents.length > 1 && (
                    <Checkbox 
                      checked={selectedDocs[doc.id] || false}
                      onCheckedChange={(checked) => toggleSelectDocument(doc.id, checked === true)}
                      className="absolute -left-2 -top-2 z-10"
                      disabled={processingDocs[doc.id] || deletingDocs[doc.id] || processingAllDocs}
                    />
                  )}
                  <div className="p-2 bg-primary/10 text-primary rounded-md">
                    <FileText size={32} />
                  </div>
                </div>
                <div>
                  <h3 className="font-medium truncate" title={doc.filename}>
                    {doc.filename}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {doc.file_type} • {doc.file_size ? `${Math.round(doc.file_size / 1024)} KB` : 'Unknown size'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(doc.created_at)}
                  </p>
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-4 ml-auto">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleExtractData(doc.id)}
                        disabled={processingDocs[doc.id] || processingAllDocs || enhancingProfile}
                      >
                        <RefreshCw size={18} className={processingDocs[doc.id] ? 'animate-spin' : ''} />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Extract data from this CV to update your profile</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleDelete(doc.id)}
                        disabled={deletingDocs[doc.id] || processingAllDocs || enhancingProfile}
                      >
                        <Trash2 size={18} />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Delete this CV</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </Card>
          ))
        )}
      </div>
      
      {documents.length > 0 && (
        <div className="mt-3 text-sm text-muted-foreground space-y-1">
          <p>
            <Sparkles className="inline h-3 w-3" /> <strong>Enhance Profile</strong>: Process all your CVs and update your profile with skills, experience, and education.
          </p>
          {documents.length > 1 && (
            <p>
              <Check className="inline h-3 w-3" /> <strong>Select multiple CVs</strong>: Choose multiple CVs for advanced combined extraction.
            </p>
          )}
          <p>
            <RefreshCw className="inline h-3 w-3" /> Extract data from individual CVs or all CVs at once.
          </p>
        </div>
      )}
    </div>
  );
};
