
import React, { useState, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Linkedin, Upload, FileText, ArrowRight, FileJson, Files } from 'lucide-react';
import { processLinkedInFiles, saveLinkedInData } from '@/services/linkedinImportService';
import { toast } from '@/components/ui/sonner';

export const LinkedInImport = () => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      // Convert FileList to array
      const filesArray = Array.from(e.target.files);
      setSelectedFiles(filesArray);
    }
  };
  
  const handleImport = async () => {
    if (selectedFiles.length === 0) {
      toast.error("Please select at least one LinkedIn data file");
      return;
    }
    
    setIsLoading(true);
    try {
      const linkedInData = await processLinkedInFiles(selectedFiles);
      if (linkedInData) {
        const success = await saveLinkedInData(linkedInData);
        if (success) {
          setSelectedFiles([]);
        }
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-6">
        <div className="flex flex-col space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <Linkedin className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <h3 className="font-medium text-lg">Import LinkedIn Data</h3>
              <p className="text-sm text-muted-foreground">
                Upload your LinkedIn data export to populate your profile
              </p>
            </div>
          </div>
          
          <div className="bg-muted/50 p-4 rounded-md">
            <h4 className="font-medium mb-2">How to get your LinkedIn data:</h4>
            <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
              <li>Go to <a href="https://www.linkedin.com/mypreferences/d/download-my-data" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline">
                LinkedIn's Download Your Data
              </a></li>
              <li>Click "Request archive" and select "The works" (JSON or CSV format)</li>
              <li>Wait for the email from LinkedIn (usually within 10 minutes)</li>
              <li>Download the archive and extract the files</li>
              <li>Upload the relevant files below (Profile.json/csv, Positions.json/csv, etc.)</li>
            </ol>
          </div>
          
          <div className="border-2 border-dashed border-muted rounded-md p-4">
            <div className="flex flex-col items-center gap-3 py-4">
              <div className="flex gap-2">
                <FileJson className="h-10 w-10 text-blue-500" />
                <Files className="h-10 w-10 text-green-500" />
              </div>
              <div className="text-center">
                <p className="font-medium">Select Files</p>
                <p className="text-sm text-muted-foreground">
                  Upload Profile, Positions, Education files (JSON or CSV format)
                </p>
              </div>
              <Button 
                variant="outline" 
                onClick={() => fileInputRef.current?.click()}
                className="mt-2"
              >
                <Upload className="h-4 w-4 mr-2" />
                Choose Files
              </Button>
              <input 
                type="file" 
                ref={fileInputRef} 
                multiple 
                accept="application/json,text/csv" 
                className="hidden" 
                onChange={handleFileChange} 
              />
            </div>
          </div>
          
          {selectedFiles.length > 0 && (
            <div className="bg-muted/30 p-3 rounded">
              <p className="font-medium mb-2">Selected files:</p>
              <ul className="text-sm space-y-1">
                {selectedFiles.map((file, index) => {
                  const isCSV = file.name.toLowerCase().endsWith('.csv');
                  return (
                    <li key={index} className="flex items-center gap-2">
                      {isCSV ? 
                        <Files className="h-4 w-4 text-green-500" /> : 
                        <FileJson className="h-4 w-4 text-blue-500" />
                      }
                      {file.name}
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
          
          <Button 
            className="w-full" 
            disabled={selectedFiles.length === 0 || isLoading}
            onClick={handleImport}
          >
            {isLoading ? "Importing..." : "Import LinkedIn Data"}
            {!isLoading && <ArrowRight className="ml-2 h-4 w-4" />}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
