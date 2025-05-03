
import React from 'react';
import { FileText, Eye, Edit, Download } from 'lucide-react';
import { TailoredCV } from '@/types/tailoredCV';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface ResumesSectionProps {
  resumes: TailoredCV[];
  isLoading: boolean;
  handleViewCV: (cvId: string) => void;
  handleCreateNew: () => void;
  formatDate: (date: string) => string;
}

export const ResumesSection: React.FC<ResumesSectionProps> = ({
  resumes,
  isLoading,
  handleViewCV,
  handleCreateNew,
  formatDate
}) => {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Resumes</h2>
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="glass-card overflow-hidden">
              <div className="aspect-[3/4] bg-gray-100 animate-pulse"></div>
              <div className="p-4">
                <div className="h-5 bg-gray-200 rounded animate-pulse mb-2"></div>
                <div className="h-4 bg-gray-200 rounded animate-pulse w-2/3"></div>
              </div>
            </div>
          ))}
        </div>
      ) : resumes.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {resumes.map((resume) => (
            <div 
              key={resume.id} 
              className="glass-card overflow-hidden cursor-pointer"
              onClick={() => handleViewCV(resume.id)}
            >
              <div className="aspect-[3/4] bg-gray-100 flex items-center justify-center">
                <FileText size={64} className="text-gray-400" />
              </div>
              <div className="p-4">
                <h3 className="font-semibold">
                  {resume.cv_content?.title || resume.cv_content?.header?.title || "Untitled CV"}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {resume.template.charAt(0).toUpperCase() + resume.template.slice(1)} template
                </p>
              </div>
              <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
                <p className="text-xs text-muted-foreground">{formatDate(resume.created_at)}</p>
                <div className="flex items-center gap-2">
                  <button className="text-gray-500 hover:text-gray-700" onClick={(e) => {
                    e.stopPropagation();
                    handleViewCV(resume.id);
                  }}>
                    <Eye size={16} />
                  </button>
                  <button className="text-gray-500 hover:text-gray-700" onClick={(e) => {
                    e.stopPropagation();
                    // Edit functionality would be implemented here
                  }}>
                    <Edit size={16} />
                  </button>
                  <button className="text-gray-500 hover:text-gray-700" onClick={(e) => {
                    e.stopPropagation();
                    // Download functionality would be implemented here
                  }}>
                    <Download size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-10 bg-muted/20 rounded-lg">
          <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-3" />
          <h3 className="text-lg font-medium mb-1">No resumes yet</h3>
          <p className="text-muted-foreground mb-4">Create your first tailored CV in the Kitchen</p>
          <Button 
            onClick={handleCreateNew} 
            className="bg-blue-500 hover:bg-blue-600"
          >
            Create CV
          </Button>
        </div>
      )}
    </div>
  );
};
