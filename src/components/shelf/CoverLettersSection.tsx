
import React from 'react';
import { FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CoverLettersSectionProps {
  coverLetters: any[];
  isLoading: boolean;
  handleCreateNew: () => void;
}

export const CoverLettersSection: React.FC<CoverLettersSectionProps> = ({
  coverLetters,
  isLoading,
  handleCreateNew
}) => {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Cover Letters</h2>
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {[1, 2].map(i => (
            <div key={i} className="glass-card overflow-hidden">
              <div className="aspect-[3/4] bg-gray-100 animate-pulse"></div>
              <div className="p-4">
                <div className="h-5 bg-gray-200 rounded animate-pulse mb-2"></div>
                <div className="h-4 bg-gray-200 rounded animate-pulse w-2/3"></div>
              </div>
            </div>
          ))}
        </div>
      ) : coverLetters.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {coverLetters.map((letter, index) => (
            <div key={index} className="glass-card overflow-hidden" style={{ backgroundColor: 'rgba(236, 253, 243, 0.4)' }}>
              <div className="aspect-[3/4] flex items-center justify-center bg-green-50/80">
                <FileText size={64} className="text-green-400" />
              </div>
              <div className="p-4">
                <h3 className="font-semibold">{letter.title}</h3>
                <p className="text-sm text-muted-foreground">{letter.position}</p>
              </div>
              <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
                <p className="text-xs text-muted-foreground">{letter.lastUpdated}</p>
                <div className="flex items-center gap-2">
                  <button className="text-gray-500 hover:text-gray-700">
                    <Eye size={16} />
                  </button>
                  <button className="text-gray-500 hover:text-gray-700">
                    <Edit size={16} />
                  </button>
                  <button className="text-gray-500 hover:text-gray-700">
                    <Download size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-10 bg-muted/20 rounded-lg">
          <FileText className="mx-auto h-12 w-12 text-green-300 mb-3" />
          <h3 className="text-lg font-medium mb-1">No cover letters yet</h3>
          <p className="text-muted-foreground mb-4">Create your first cover letter</p>
          <Button 
            onClick={handleCreateNew} 
            className="bg-green-500 hover:bg-green-600"
          >
            Create Cover Letter
          </Button>
        </div>
      )}
    </div>
  );
};
