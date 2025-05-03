
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AnalysisItem } from './AnalysisItem';
import { JobAnalysis } from '@/services/jobAnalysisService';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface RecentAnalysesListProps {
  analyses: JobAnalysis[];
  onViewAnalysis: (id: string) => void;
  isLoading?: boolean;
}

export const RecentAnalysesList: React.FC<RecentAnalysesListProps> = ({
  analyses,
  onViewAnalysis,
  isLoading = false
}) => {
  return (
    <Card className="glass-card">
      <CardHeader className="pb-3">
        <CardTitle>Recent Job Analyses</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          Array(3).fill(0).map((_, index) => (
            <div key={index} className="p-4 border rounded-md bg-muted/10">
              <Skeleton className="h-5 w-3/4 mb-3" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-2/3" />
              <div className="flex justify-end mt-3">
                <Skeleton className="h-9 w-24" />
              </div>
            </div>
          ))
        ) : analyses.length > 0 ? (
          analyses.map((analysis) => (
            <AnalysisItem 
              key={analysis.id}
              analysis={analysis}
              onView={() => onViewAnalysis(analysis.id)}
            />
          ))
        ) : (
          <div className="text-center py-6">
            <p className="text-muted-foreground mb-4">No job analyses yet. Analyze a job description to get started.</p>
            <Button variant="outline" className="gap-2">
              <PlusCircle size={16} />
              Analyze New Job
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
