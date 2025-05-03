
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";

export interface JobAnalysis {
  id: string;
  user_id: string;
  job_description: string;
  analysis: string;
  created_at: string;
}

export async function analyzeJobDescription(jobDescription: string): Promise<{ analysis: string; id: string } | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      toast.error("You must be logged in to analyze job descriptions");
      return null;
    }
    
    console.log("Calling analyze-job-description function with user ID:", user.id);
    
    const { data, error } = await supabase.functions.invoke('analyze-job-description', {
      body: {
        jobDescription,
        userId: user.id,
      },
    });
    
    if (error) {
      console.error("Error analyzing job description:", error);
      toast.error("Failed to analyze job description");
      return null;
    }
    
    return data;
  } catch (error: any) {
    console.error("Error in job analysis service:", error);
    toast.error("An error occurred during analysis");
    return null;
  }
}

export async function getRecentAnalyses(): Promise<JobAnalysis[]> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return [];
    
    // Using explicit type casting to fix the type issues
    const { data, error } = await supabase
      .from('job_analyses')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(5);
    
    if (error) {
      console.error("Error fetching recent analyses:", error);
      return [];
    }
    
    return data as JobAnalysis[];
  } catch (error: any) {
    console.error("Error fetching recent analyses:", error);
    return [];
  }
}

export async function getAnalysisById(id: string): Promise<JobAnalysis | null> {
  try {
    // Using explicit type casting to fix the type issues
    const { data, error } = await supabase
      .from('job_analyses')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error("Error fetching analysis:", error);
      return null;
    }
    
    return data as JobAnalysis;
  } catch (error: any) {
    console.error("Error fetching analysis:", error);
    return null;
  }
}
