
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";
import { getAllCVContext } from "./cvDataExtractorService";

export interface JobAnalysis {
  id: string;
  user_id: string;
  job_description: string;
  analysis: string;
  created_at: string;
  updated_at: string;
  has_cv?: boolean;
}

export async function analyzeJobDescription(description: string): Promise<JobAnalysis | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      toast.error("You must be logged in to analyze job descriptions");
      return null;
    }
    
    // Get all CV context for analysis
    const cvContext = await getAllCVContext();
    
    toast.loading("Analyzing job description...", { id: "job-analysis" });
    
    let result: any;
    let error: any;
    
    try {
      // Call the edge function to analyze the job description
      const response = await supabase.functions.invoke('analyze-job-description', {
        body: {
          jobDescription: description,
          userId: user.id,
          cvContext: cvContext
        }
      });
      
      result = response.data;
      error = response.error;
    } catch (err) {
      console.error("Error calling analyze-job-description function:", err);
      error = err;
    }
    
    if (error) {
      console.error("Error analyzing job description:", error);
      toast.error("Failed to analyze job description", { id: "job-analysis" });
      throw error;
    }
    
    if (!result || !result.analysis) {
      toast.error("Failed to generate analysis", { id: "job-analysis" });
      throw new Error("No analysis generated");
    }
    
    // Save the analysis to the database
    const { data, error: dbError } = await supabase
      .from('job_analyses')
      .insert({
        user_id: user.id,
        job_description: description,
        analysis: result.analysis
      })
      .select('*')
      .single();
    
    if (dbError) {
      console.error("Error saving job analysis:", dbError);
      toast.error("Failed to save analysis", { id: "job-analysis" });
      throw dbError;
    }
    
    toast.success("Job description analyzed successfully", { id: "job-analysis" });
    return data as JobAnalysis;
    
  } catch (error: any) {
    console.error("Error in analyzeJobDescription:", error);
    toast.error("An error occurred during analysis", { id: "job-analysis" });
    throw error;
  }
}

export async function getRecentAnalyses(): Promise<JobAnalysis[]> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.log("User not authenticated");
      return [];
    }
    
    // First get the analyses
    const { data: analyses, error } = await supabase
      .from('job_analyses')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(5);
    
    if (error) {
      console.error("Error fetching job analyses:", error);
      return [];
    }
    
    // For each analysis, check if a CV exists for it
    const analysesWithCVFlag = await Promise.all(analyses.map(async (analysis) => {
      const { data: cvs, error: cvError } = await supabase
        .from('tailored_cvs')
        .select('id')
        .eq('analysis_id', analysis.id)
        .limit(1);
      
      if (cvError) {
        console.error(`Error checking CV for analysis ${analysis.id}:`, cvError);
      }
      
      return {
        ...analysis,
        has_cv: cvs && cvs.length > 0
      };
    }));
    
    return analysesWithCVFlag as JobAnalysis[];
  } catch (error) {
    console.error("Error in getRecentAnalyses:", error);
    return [];
  }
}

export async function getAnalysisById(id: string): Promise<JobAnalysis | null> {
  try {
    const { data, error } = await supabase
      .from('job_analyses')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error("Error fetching job analysis:", error);
      return null;
    }
    
    // Check if a CV exists for this analysis
    const { data: cvs, error: cvError } = await supabase
      .from('tailored_cvs')
      .select('id')
      .eq('analysis_id', id)
      .limit(1);
    
    if (cvError) {
      console.error(`Error checking CV for analysis ${id}:`, cvError);
    }
    
    return {
      ...data,
      has_cv: cvs && cvs.length > 0
    } as JobAnalysis;
    
  } catch (error) {
    console.error("Error in getAnalysisById:", error);
    return null;
  }
}
