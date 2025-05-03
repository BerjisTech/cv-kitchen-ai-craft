
import React from 'react';
import { ArrowRight, FileText } from 'lucide-react';

interface AnalysisItemProps {
  title: string;
  timeAgo: string;
  onClick?: () => void;
  hasCV?: boolean;
}

export const AnalysisItem: React.FC<AnalysisItemProps> = ({ 
  title, 
  timeAgo, 
  onClick,
  hasCV = false
}) => {
  return (
    <div 
      className="flex justify-between items-center p-4 hover:bg-muted/20 cursor-pointer transition-colors"
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          onClick?.();
        }
      }}
    >
      <div className="flex items-center gap-2">
        {hasCV && (
          <div className="text-green-500 flex-shrink-0">
            <FileText className="h-4 w-4" />
          </div>
        )}
        <div>
          <h4 className="font-medium">{title}</h4>
          <p className="text-sm text-muted-foreground">{timeAgo}</p>
        </div>
      </div>
      <ArrowRight className="h-5 w-5 text-muted-foreground" />
    </div>
  );
};
