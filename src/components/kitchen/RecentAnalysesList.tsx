
import React from 'react';
import { Card } from '@/components/ui/card';
import { AnalysisItem } from '@/components/kitchen/AnalysisItem';
import { JobAnalysis } from '@/services/jobAnalysisService';

interface RecentAnalysesListProps {
  analyses: JobAnalysis[];
  onViewAnalysis: (id: string) => void;
}

export const RecentAnalysesList: React.FC<RecentAnalysesListProps> = ({ 
  analyses, 
  onViewAnalysis 
}) => {
  if (analyses.length === 0) return null;
  
  return (
    <div className="space-y-3">
      <h3 className="font-medium text-lg">Recent Analyses</h3>
      
      <Card className="overflow-hidden">
        {analyses.map((analysis) => (
          <React.Fragment key={analysis.id}>
            <AnalysisItem 
              title={analysis.job_description.substring(0, 60) + (analysis.job_description.length > 60 ? '...' : '')}
              timeAgo={new Date(analysis.created_at).toLocaleDateString()}
              onClick={() => onViewAnalysis(analysis.id)}
              aria-label={`View analysis for ${analysis.job_description.substring(0, 20)}...`}
            />
            {analysis !== analyses[analyses.length - 1] && (
              <div className="border-t border-border"></div>
            )}
          </React.Fragment>
        ))}
      </Card>
    </div>
  );
};
