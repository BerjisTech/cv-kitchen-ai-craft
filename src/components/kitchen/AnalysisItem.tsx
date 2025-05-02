
import React from 'react';
import { ArrowRight } from 'lucide-react';

interface AnalysisItemProps {
  title: string;
  timeAgo: string;
}

export const AnalysisItem: React.FC<AnalysisItemProps> = ({ title, timeAgo }) => {
  return (
    <div className="flex justify-between items-center p-4 hover:bg-muted/20 cursor-pointer transition-colors">
      <div>
        <h4 className="font-medium">{title}</h4>
        <p className="text-sm text-muted-foreground">{timeAgo}</p>
      </div>
      <ArrowRight className="h-5 w-5 text-muted-foreground" />
    </div>
  );
};
