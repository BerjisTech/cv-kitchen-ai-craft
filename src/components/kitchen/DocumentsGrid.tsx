
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Trash2 } from 'lucide-react';
import { UserDocument, getDownloadUrl, deleteDocument } from '@/services/documentService';
import { toast } from '@/components/ui/sonner';

interface DocumentsGridProps {
  documents: UserDocument[];
  onDocumentDeleted: (id: string) => void;
}

export const DocumentsGrid: React.FC<DocumentsGridProps> = ({ 
  documents,
  onDocumentDeleted
}) => {
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

  return (
    <div className="mt-6">
      <h3 className="font-medium text-lg mb-3">Your CV Documents</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {documents.map((doc) => (
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
  );
};
