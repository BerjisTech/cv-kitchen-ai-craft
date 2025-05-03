
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { AnalysisItem } from '@/components/kitchen/AnalysisItem';
import { JobAnalysis } from '@/services/jobAnalysisService';
import { getTailoredCV } from '@/services/tailoredCVService';

interface RecentAnalysesListProps {
  analyses: JobAnalysis[];
  onViewAnalysis: (id: string) => void;
}

export const RecentAnalysesList: React.FC<RecentAnalysesListProps> = ({ 
  analyses, 
  onViewAnalysis 
}) => {
  const [analysesWithCVs, setAnalysesWithCVs] = useState<{[key: string]: boolean}>({});
  
  useEffect(() => {
    const checkForCVs = async () => {
      const cvStatus: {[key: string]: boolean} = {};
      
      for (const analysis of analyses) {
        const cv = await getTailoredCV(analysis.id);
        cvStatus[analysis.id] = !!cv;
      }
      
      setAnalysesWithCVs(cvStatus);
    };
    
    if (analyses.length > 0) {
      checkForCVs();
    }
  }, [analyses]);
  
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
              hasCV={analysesWithCVs[analysis.id]}
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
