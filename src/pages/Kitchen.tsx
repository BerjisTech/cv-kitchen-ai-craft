
import React from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { UploadZone } from '@/components/kitchen/UploadZone';
import { FileText, Linkedin, Github, Image } from 'lucide-react';

const Kitchen = () => {
  const handleUpload = (file: File) => {
    console.log('Uploaded file:', file);
    // Here you would handle the file upload to your backend
  };
  
  return (
    <MainLayout>
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Kitchen</h1>
        <p className="text-muted-foreground">
          Upload your content here to create amazing CVs and cover letters
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <UploadZone
          title="Upload CV"
          description="Upload your existing CV in PDF or DOCX format"
          icon={<FileText className="h-6 w-6 text-primary" />}
          acceptedFileTypes=".pdf,.docx"
          onUpload={handleUpload}
        />
        
        <UploadZone
          title="Connect LinkedIn"
          description="Import your profile data from LinkedIn"
          icon={<Linkedin className="h-6 w-6 text-primary" />}
          acceptedFileTypes=""
          onUpload={handleUpload}
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <UploadZone
          title="Connect GitHub"
          description="Import your projects and contributions from GitHub"
          icon={<Github className="h-6 w-6 text-primary" />}
          acceptedFileTypes=""
          onUpload={handleUpload}
        />
        
        <UploadZone
          title="Upload Portfolio"
          description="Add images or documents to showcase your work"
          icon={<Image className="h-6 w-6 text-primary" />}
          acceptedFileTypes=".png,.jpg,.jpeg,.pdf"
          onUpload={handleUpload}
        />
      </div>
    </MainLayout>
  );
};

export default Kitchen;
