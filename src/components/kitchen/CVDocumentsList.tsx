
import React, { useState } from 'react';
import { FileText, Trash2, RefreshCw } from 'lucide-react';
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
  
  const handleExtractData = async (id: string) => {
    setProcessingDocs(prev => ({ ...prev, [id]: true }));
    try {
      toast.info('Extracting data from CV, please wait...');
      await onExtractData(id);
      toast.success('CV data extracted successfully! Your profile has been updated.');
    } catch (error) {
      console.error('Error extracting data:', error);
      toast.error('Failed to extract data from CV');
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
          await onExtractData(doc.id);
          successCount++;
        } catch (error) {
          console.error(`Error processing CV ${doc.filename}:`, error);
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
    }
  };
  
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM d, yyyy');
    } catch (error) {
      return 'Unknown date';
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-lg font-semibold">Uploaded CVs</h2>
        {documents.length > 1 && (
          <Button 
            size="sm" 
            variant="outline"
            className="gap-2"
            onClick={handleExtractAllData}
            disabled={processingAllDocs}
          >
            <RefreshCw size={16} className={processingAllDocs ? 'animate-spin' : ''} />
            Extract All CVs
          </Button>
        )}
      </div>
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
                <div className="p-2 bg-primary/10 text-primary rounded-md">
                  <FileText size={32} />
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
                        disabled={processingDocs[doc.id] || processingAllDocs}
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
                        disabled={deletingDocs[doc.id] || processingAllDocs}
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
        <div className="mt-3 text-sm text-muted-foreground">
          <p>Click the <RefreshCw className="inline h-3 w-3" /> button to extract data from your CV and update your profile info, skills, and experience.</p>
          {documents.length > 1 && (
            <p className="mt-1">Or use the "Extract All CVs" button to process all CVs at once.</p>
          )}
        </div>
      )}
    </div>
  );
};
