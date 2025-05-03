
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Download, Trash2, FileEdit } from 'lucide-react';
import { UserDocument, getDownloadUrl, deleteDocument } from '@/services/documentService';
import { toast } from '@/components/ui/sonner';

interface CVDocumentsListProps {
  documents: UserDocument[];
  onDocumentDeleted: (id: string) => void;
  onExtractData: (id: string) => void;
}

export const CVDocumentsList: React.FC<CVDocumentsListProps> = ({ 
  documents,
  onDocumentDeleted,
  onExtractData
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
    <div>
      <h3 className="font-medium text-lg mb-3">Your CV Documents</h3>
      <div className="space-y-4">
        {documents.map((doc) => (
          <Card key={doc.id} className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                  <FileText className="h-6 w-6 text-blue-500" />
                </div>
                <div>
                  <h4 className="font-medium">{doc.filename}</h4>
                  <p className="text-sm text-muted-foreground">
                    Uploaded: {new Date(doc.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => onExtractData(doc.id)}
                  title="Extract data from CV"
                >
                  <FileEdit className="h-4 w-4 mr-2" />
                  Extract Data
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleDownloadCV(doc.filepath, doc.filename)}
                  title="Download CV"
                >
                  <Download className="h-4 w-4" />
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-red-500 hover:text-red-700"
                  onClick={() => handleDeleteCV(doc.id)}
                  title="Delete CV"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
