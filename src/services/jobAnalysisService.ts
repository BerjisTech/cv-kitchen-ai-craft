
import { v4 as uuidv4 } from 'uuid';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";
import { getAllCVContext } from "./cv/contextService";

export interface JobAnalysis {
  id: string;
  job_description: string;
  analysis: string;
  created_at: string;
  updated_at: string;
}

/**
 * Analyzes a job description
 */
export async function analyzeJobDescription(jobDescription: string): Promise<JobAnalysis | null> {
  try {
    toast.info("Analyzing job description...", { duration: 5000 });
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      toast.error("You need to be logged in to analyze job descriptions");
      return null;
    }

    // Get CV data for context
    const cvContext = await getAllCVContext();
    
    // Call the analyze-job-description function
    const { data, error } = await supabase.functions.invoke('analyze-job-description', {
      body: { 
        job_description: jobDescription,
        cv_context: cvContext
      }
    });

    if (error || !data) {
      console.error("Error analyzing job description:", error);
      toast.error("Failed to analyze job description");
      return null;
    }

    // Store the analysis in the database
    const analysis = {
      id: uuidv4(),
      job_description: jobDescription,
      analysis: data.analysis,
      user_id: user.id
    };

    const { error: insertError } = await supabase
      .from('job_analyses')
      .insert(analysis);

    if (insertError) {
      console.error("Error saving job analysis:", insertError);
      toast.error("Failed to save analysis");
      return null;
    }

    toast.success("Job analysis complete!");
    return {
      ...analysis,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  } catch (error) {
    console.error("Error in analyzeJobDescription:", error);
    toast.error("An error occurred during analysis");
    return null;
  }
}

/**
 * Gets a job analysis by ID
 */
export async function getAnalysisById(id: string): Promise<JobAnalysis | null> {
  try {
    const { data, error } = await supabase
      .from('job_analyses')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error || !data) {
      console.error("Error getting analysis:", error);
      return null;
    }
    
    return data as JobAnalysis;
  } catch (error) {
    console.error("Error in getAnalysisById:", error);
    return null;
  }
}

/**
 * Gets recent job analyses
 */
export async function getRecentAnalyses(): Promise<JobAnalysis[]> {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return [];
    }
    
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
  } catch (error) {
    console.error("Error in getRecentAnalyses:", error);
    return [];
  }
}
