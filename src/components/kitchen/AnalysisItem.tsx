
import React from 'react';
import { ArrowRight } from 'lucide-react';

interface AnalysisItemProps {
  title: string;
  timeAgo: string;
  onClick?: () => void;
}

export const AnalysisItem: React.FC<AnalysisItemProps> = ({ title, timeAgo, onClick }) => {
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
      <div>
        <h4 className="font-medium">{title}</h4>
        <p className="text-sm text-muted-foreground">{timeAgo}</p>
      </div>
      <ArrowRight className="h-5 w-5 text-muted-foreground" />
    </div>
  );
};
