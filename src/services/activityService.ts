
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';

export interface UserActivity {
  id: string;
  title: string;
  time: string;
  type: 'cv_created' | 'cv_downloaded' | 'profile_updated' | 'cover_letter_created';
  icon: string;
  created_at: string;
}

export async function getUserActivity(): Promise<UserActivity[]> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return [];
    }
    
    // Fetch recent tailored CVs
    const { data: cvs, error: cvError } = await supabase
      .from('tailored_cvs')
      .select('id, created_at, cv_content, template')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(3);
      
    if (cvError) {
      console.error("Error fetching recent CVs:", cvError);
    }
    
    // Fetch recent job analyses
    const { data: analyses, error: analysesError } = await supabase
      .from('job_analyses')
      .select('id, created_at, job_description')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(3);
      
    if (analysesError) {
      console.error("Error fetching recent analyses:", analysesError);
    }
    
    // Format activities
    const activities: UserActivity[] = [];
    
    // Add CV activities
    if (cvs) {
      cvs.forEach(cv => {
        // Handle different possible data structures in cv_content
        let title = "Untitled CV";
        
        if (cv.cv_content && typeof cv.cv_content === 'object') {
          if ('title' in cv.cv_content) {
            title = (cv.cv_content as any).title || title;
          } else if ('header' in cv.cv_content && typeof (cv.cv_content as any).header === 'object') {
            title = (cv.cv_content as any).header?.title || title;
          }
        }
        
        activities.push({
          id: `cv-${cv.id}`,
          title: `Created "${title}" CV`,
          time: cv.created_at,
          type: 'cv_created',
          icon: 'fileText',
          created_at: cv.created_at
        });
      });
    }
    
    // Add analysis activities
    if (analyses) {
      analyses.forEach(analysis => {
        const jobTitle = analysis.job_description.split('\n')[0]?.substring(0, 30) || "Job Analysis";
        activities.push({
          id: `analysis-${analysis.id}`,
          title: `Analyzed job: ${jobTitle}...`,
          time: analysis.created_at,
          type: 'cv_created',
          icon: 'search',
          created_at: analysis.created_at
        });
      });
    }
    
    // Sort activities by date (newest first)
    activities.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    
    // Return at most 5 activities
    return activities.slice(0, 5);
    
  } catch (error) {
    console.error("Error fetching user activity:", error);
    return [];
  }
}
