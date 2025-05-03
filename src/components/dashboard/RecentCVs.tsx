
import React, { useEffect, useState } from 'react';
import { FileText, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';

interface CVTemplate {
  id: string;
  title: string;
  description: string;
  timeAgo: string;
  cvId: string;
}

const CVTemplate = ({ title, description, timeAgo, cvId }: CVTemplate) => (
  <div className="bg-muted/30 rounded-lg overflow-hidden flex flex-col">
    <div className="aspect-[3/4] flex items-center justify-center p-4 bg-muted/20">
      <FileText className="h-16 w-16 text-muted-foreground/60" />
    </div>
    <div className="p-4">
      <h3 className="font-medium">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
      <div className="mt-2 flex justify-between items-center">
        <span className="text-xs text-muted-foreground">{timeAgo}</span>
        <Link to={`/kitchen/cv-viewer/${cvId}`}>
          <Button variant="ghost" size="sm" className="p-1 h-auto">
            <Eye size={16} />
          </Button>
        </Link>
      </div>
    </div>
  </div>
);

export const RecentCVs = () => {
  const [cvs, setCvs] = useState<CVTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRecentCVs = async () => {
      try {
        setIsLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          setIsLoading(false);
          return;
        }
        
        const { data, error } = await supabase
          .from('tailored_cvs')
          .select('id, cv_content, template, created_at')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(3);
          
        if (error) {
          console.error("Error fetching CVs:", error);
          setIsLoading(false);
          return;
        }
        
        if (data) {
          const formattedCVs = data.map(cv => {
            // Handle different possible data structures in cv_content
            let title = "Untitled CV";
            
            if (cv.cv_content && typeof cv.cv_content === 'object') {
              if ('title' in cv.cv_content) {
                title = (cv.cv_content as any).title || title;
              } else if ('header' in cv.cv_content && typeof (cv.cv_content as any).header === 'object') {
                title = (cv.cv_content as any).header?.title || title;
              }
            }
            
            return {
              id: cv.id,
              title: title,
              description: `${cv.template.charAt(0).toUpperCase() + cv.template.slice(1)} template`,
              timeAgo: format(new Date(cv.created_at), 'MMM d, yyyy'),
              cvId: cv.id
            };
          });
          
          setCvs(formattedCVs);
        }
      } catch (error) {
        console.error("Error loading recent CVs:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchRecentCVs();
  }, []);

  return (
    <div className="mt-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Recent CVs</h2>
        <Button variant="link" size="sm" className="text-primary" asChild>
          <Link to="/shelf">View All</Link>
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {isLoading ? (
          Array(3).fill(0).map((_, index) => (
            <div key={index} className="bg-muted/30 rounded-lg overflow-hidden flex flex-col">
              <div className="aspect-[3/4] flex items-center justify-center p-4 bg-muted/20">
                <Skeleton className="h-16 w-16 rounded" />
              </div>
              <div className="p-4">
                <Skeleton className="h-5 w-2/3 mb-2" />
                <Skeleton className="h-4 w-1/2 mb-2" />
                <div className="mt-2 flex justify-between items-center">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-6 w-6 rounded" />
                </div>
              </div>
            </div>
          ))
        ) : cvs.length > 0 ? (
          cvs.map((cv) => (
            <CVTemplate 
              key={cv.id}
              id={cv.id}
              title={cv.title}
              description={cv.description}
              timeAgo={cv.timeAgo}
              cvId={cv.cvId}
            />
          ))
        ) : (
          <div className="col-span-3 text-center py-8 bg-muted/20 rounded-lg">
            <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-2" />
            <h3 className="text-lg mb-2">No CVs created yet</h3>
            <p className="text-muted-foreground mb-4">Create your first CV in the Kitchen</p>
            <Button asChild>
              <Link to="/kitchen">Create CV</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
