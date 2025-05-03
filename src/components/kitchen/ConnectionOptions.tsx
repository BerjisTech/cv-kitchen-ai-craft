
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileUp, Linkedin, Github } from 'lucide-react';
import { connectWithGitHub, connectWithLinkedIn } from '@/services/socialConnectionService';

interface ConnectionOptionsProps {
  hasLinkedInConnection: boolean;
  hasGitHubConnection: boolean;
  onFileUpload: (files: FileList) => void;
}

export const ConnectionOptions: React.FC<ConnectionOptionsProps> = ({
  hasLinkedInConnection,
  hasGitHubConnection,
  onFileUpload
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Previous CVs */}
      <Card className="p-5 space-y-4">
        <div className="flex items-center gap-2 text-muted-foreground">
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
            <FileUp className="h-4 w-4 text-blue-500" />
          </div>
          <h3 className="font-medium text-foreground">Previous CVs</h3>
        </div>
        
        <p className="text-sm text-muted-foreground">
          Upload your existing CVs to extract your experience and skills automatically.
        </p>
        
        <Button 
          variant="outline" 
          className="w-full flex items-center justify-center gap-2"
          onClick={() => document.getElementById('cv-file-input')?.click()}
        >
          <FileUp className="h-4 w-4" />
          <span>Upload CV</span>
          <input
            id="cv-file-input"
            type="file"
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files.length > 0) {
                onFileUpload(e.target.files);
              }
            }}
            accept="application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          />
        </Button>
      </Card>
      
      {/* LinkedIn Import */}
      <Card className="p-5 space-y-4">
        <div className="flex items-center gap-2 text-muted-foreground">
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
            <Linkedin className="h-4 w-4 text-blue-500" />
          </div>
          <h3 className="font-medium text-foreground">LinkedIn Import</h3>
        </div>
        
        <p className="text-sm text-muted-foreground">
          Connect your LinkedIn profile to import your professional experience.
        </p>
        
        <Button 
          className="w-full bg-blue-600 hover:bg-blue-700 flex items-center justify-center gap-2"
          onClick={connectWithLinkedIn}
          disabled={hasLinkedInConnection}
        >
          <Linkedin className="h-4 w-4" />
          <span>{hasLinkedInConnection ? 'LinkedIn Connected' : 'Connect LinkedIn'}</span>
        </Button>
      </Card>
      
      {/* GitHub Import */}
      <Card className="p-5 space-y-4">
        <div className="flex items-center gap-2 text-muted-foreground">
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
            <Github className="h-4 w-4 text-blue-500" />
          </div>
          <h3 className="font-medium text-foreground">GitHub Import</h3>
        </div>
        
        <p className="text-sm text-muted-foreground">
          Connect GitHub to showcase your projects and technical contributions.
        </p>
        
        <Button 
          variant="outline"
          className="w-full bg-gray-800 text-white hover:bg-gray-900 flex items-center justify-center gap-2"
          onClick={connectWithGitHub}
          disabled={hasGitHubConnection}
        >
          <Github className="h-4 w-4" />
          <span>{hasGitHubConnection ? 'GitHub Connected' : 'Connect GitHub'}</span>
        </Button>
      </Card>
    </div>
  );
};
