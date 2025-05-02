
import React, { useState, useRef } from 'react';
import { Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';

interface FileUploaderProps {
  onUpload: (files: FileList) => void;
}

export const FileUploader: React.FC<FileUploaderProps> = ({ onUpload }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();
  
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };
  
  const handleDragLeave = () => {
    setIsDragging(false);
  };
  
  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      await handleFiles(e.dataTransfer.files);
      onUpload(e.dataTransfer.files);
    }
  };
  
  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };
  
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      await handleFiles(e.target.files);
      onUpload(e.target.files);
    }
  };
  
  const handleFiles = async (files: FileList) => {
    if (!user) {
      toast.error("You must be logged in to upload files");
      return;
    }
    
    setIsUploading(true);
    
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileExt = file.name.split('.').pop();
        const fileName = `${user.id}/${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `cvs/${fileName}`;
        
        // Check file type and size
        if (!['pdf', 'docx', 'jpg', 'png'].includes(fileExt?.toLowerCase() || '')) {
          toast.error(`Unsupported file type: ${fileExt}`);
          continue;
        }
        
        if (file.size > 10 * 1024 * 1024) { // 10MB
          toast.error("File size exceeds 10MB limit");
          continue;
        }
        
        const { error } = await supabase.storage
          .from('career-uploads')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false
          });
          
        if (error) {
          console.error("Error uploading file:", error);
          toast.error(`Error uploading ${file.name}`);
        } else {
          // Save file metadata to database
          const { error: dbError } = await supabase
            .from('user_documents')
            .insert({
              user_id: user.id,
              filename: file.name,
              filepath: filePath,
              document_type: 'cv',
              file_size: file.size,
              file_type: file.type
            });
            
          if (dbError) {
            console.error("Error saving file metadata:", dbError);
            toast.error("Error saving file information");
          } else {
            toast.success(`${file.name} uploaded successfully`);
          }
        }
      }
    } catch (error) {
      console.error("Error in file upload:", error);
      toast.error("An error occurred during upload");
    } finally {
      setIsUploading(false);
    }
  };
  
  return (
    <div 
      className={`border-2 border-dashed rounded-lg p-8 text-center ${
        isDragging ? 'border-primary bg-primary/5' : 'border-border'
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
          <Upload className="h-6 w-6 text-blue-500" />
        </div>
        
        <div>
          <h3 className="text-lg font-medium">Upload Files</h3>
          <p className="text-muted-foreground text-sm mt-1">
            Drop your CV, portfolio, certificates, or any career-related documents
          </p>
        </div>
        
        <Button 
          onClick={handleFileSelect}
          className="bg-blue-500 hover:bg-blue-600"
          disabled={isUploading}
        >
          {isUploading ? "Uploading..." : "Select Files"}
        </Button>
        
        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          multiple 
          onChange={handleFileChange}
          accept="application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,image/jpeg,image/png"
        />
        
        <p className="text-xs text-muted-foreground">
          Supports PDF, DOCX, JPG, PNG (max 10MB)
        </p>
      </div>
    </div>
  );
};
