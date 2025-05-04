
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Trash2, Search } from 'lucide-react';
import { UserDocument, getDownloadUrl, deleteDocument } from '@/services/documentService';
import { toast } from '@/components/ui/sonner';
import { Skeleton } from '@/components/ui/skeleton';

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
  if (isLoading) {
    return (
      <div className="mt-6">
        <h3 className="font-medium text-lg mb-3">Your CV Documents</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array(2).fill(0).map((_, index) => (
            <Card key={index} className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Skeleton className="w-10 h-10 rounded-full" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-3/4 mb-1" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
              <div className="mt-4 flex justify-between">
                <Skeleton className="h-9 w-24" />
                <Skeleton className="h-9 w-24" />
                <Skeleton className="h-9 w-9" />
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (documents.length === 0) return null;

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
        onDocumentDeleted(id);
      }
    }
  };

  const handleExtractData = (id: string) => {
    onExtractData(id);
  };

  return (
    <div className="mt-6">
      <h3 className="font-medium text-lg mb-3">Your CV Documents</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {documents.map((doc) => (
          <Card key={doc.id} className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                <FileText className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <h4 className="text-sm font-medium">{doc.filename}</h4>
                <p className="text-xs text-muted-foreground">
                  {new Date(doc.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="mt-4 flex justify-between">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleDownloadCV(doc.filepath, doc.filename)}
              >
                Download
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                className="bg-blue-700 text-white hover:bg-blue-800"
                onClick={() => handleExtractData(doc.id)}
              >
                Extract Data
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
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
  );
};
