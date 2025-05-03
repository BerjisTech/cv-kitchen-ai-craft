
import React from 'react';
import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { JobAnalysis } from '@/services/jobAnalysisService';

export interface AnalysisItemProps {
  analysis: JobAnalysis;
  onView: () => void;
}

export const AnalysisItem: React.FC<AnalysisItemProps> = ({ analysis, onView }) => {
  const getJobTitle = () => {
    const firstLine = analysis.job_description.split('\n')[0];
    return firstLine.length > 50 ? `${firstLine.substring(0, 50)}...` : firstLine;
  };

  const formatTimeAgo = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch (error) {
      return "recently";
    }
  };

  return (
    <div className="p-4 border rounded-md bg-muted/10">
      <h3 className="font-medium mb-2">{getJobTitle()}</h3>
      <p className="text-sm text-muted-foreground mb-2">
        {analysis.analysis.substring(0, 100)}...
      </p>
      <div className="flex justify-between items-center mt-3">
        <span className="text-xs text-muted-foreground">
          {formatTimeAgo(analysis.created_at)}
        </span>
        <Button variant="ghost" size="sm" onClick={onView}>
          <Eye className="h-4 w-4 mr-1" /> View
        </Button>
      </div>
    </div>
  );
};
