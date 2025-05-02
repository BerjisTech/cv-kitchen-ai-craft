
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, Linkedin, Github, File } from 'lucide-react';

interface UploadZoneProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  acceptedFileTypes?: string;
  onUpload?: (file: File) => void;
}

export const UploadZone: React.FC<UploadZoneProps> = ({
  title,
  description,
  icon,
  acceptedFileTypes = ".pdf,.docx",
  onUpload
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };
  
  const handleDragLeave = () => {
    setIsDragging(false);
  };
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };
  
  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };
  
  const handleFile = (file: File) => {
    setFile(file);
    if (onUpload) {
      onUpload(file);
    }
  };
  
  return (
    <div 
      className={`glass-card p-6 ${isDragging ? 'ring-2 ring-primary' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="flex flex-col items-center text-center">
        <div className="w-12 h-12 mb-4 flex items-center justify-center rounded-full bg-primary/10">
          {icon}
        </div>
        <h3 className="text-lg font-medium">{title}</h3>
        <p className="text-sm text-muted-foreground mt-1 mb-4">{description}</p>
        
        <label className="w-full">
          <div className="bg-primary/10 text-primary rounded-lg p-4 text-center cursor-pointer hover:bg-primary/20 transition-colors">
            {file ? (
              <div className="flex items-center justify-center gap-2">
                <File size={16} />
                <span className="text-sm font-medium">{file.name}</span>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2">
                <Upload size={16} />
                <span className="text-sm font-medium">Upload File</span>
              </div>
            )}
          </div>
          <input 
            type="file" 
            className="hidden" 
            accept={acceptedFileTypes} 
            onChange={handleFileInput}
          />
        </label>
        
        {!file && (
          <p className="text-xs text-muted-foreground mt-4">
            Drag and drop or click to upload
          </p>
        )}
        
        {file && (
          <Button 
            variant="outline" 
            className="mt-4 text-sm"
            onClick={() => setFile(null)}
          >
            Remove
          </Button>
        )}
      </div>
    </div>
  );
};
