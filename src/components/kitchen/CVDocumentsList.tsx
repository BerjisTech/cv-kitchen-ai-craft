
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
    } finally {
      setProcessingDocs(prev => ({ ...prev, [id]: false }));
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
      <h2 className="text-lg font-semibold mb-3">Uploaded CVs</h2>
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
                        disabled={processingDocs[doc.id]}
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
                        disabled={deletingDocs[doc.id]}
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
        </div>
      )}
    </div>
  );
};
