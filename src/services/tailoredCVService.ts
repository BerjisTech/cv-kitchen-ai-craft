
import { supabase } from '@/integrations/supabase/client';
import { TailoredCV } from '@/types/tailoredCV';
import { toast } from '@/components/ui/sonner';
import { getProfile } from './profileService';

/**
 * Generates a tailored CV for a specific job based on analysis
 * @param jobDescription The job description text
 * @param analysisId The ID of the job analysis to generate the CV for
 * @param template The template to use for the CV
 * @returns The generated CV data
 */
export const generateTailoredCV = async (jobDescription: string, analysisId: string, template: string = 'modern'): Promise<TailoredCV | null> => {
  try {
    // Get the job analysis
    const { data: analysis, error: analysisError } = await supabase
      .from('job_analyses')
      .select('*')
      .eq('id', analysisId)
      .maybeSingle();
      
    if (analysisError) {
      console.error('Error retrieving analysis:', analysisError);
      toast.error('Failed to retrieve job analysis');
      throw new Error('Analysis not found');
    }
    
    if (!analysis) {
      toast.error('Job analysis not found');
      throw new Error('Analysis not found');
    }
    
    // Get current user to ensure we have the user_id
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      toast.error('You must be logged in to generate a CV');
      throw new Error('User not authenticated');
    }
    
    // Get the user's profile first to include in the request
    const userProfile = await getProfile();
    if (!userProfile) {
      console.warn('Could not fetch user profile, CV may contain placeholder data');
    }
    
    toast.info('Generating tailored CV... This may take a moment.');
    
    // Call the edge function to generate the CV
    const { data, error } = await supabase.functions.invoke('generate-tailored-cv', {
      body: { 
        jobDescription,
        userId: user.id,
        analysisId,
        userProfile  // Include the user's profile data in the request
      }
    });
    
    if (error) {
      console.error('Error in generateTailoredCV:', error);
      toast.error('Failed to generate CV. Please try again.');
      throw error;
    }
    
    if (!data) {
      toast.error('No data returned from CV generator');
      throw new Error('No data returned from CV generator');
    }
    
    toast.success('CV has been generated successfully!');
    
    // Return the CV data
    return data as TailoredCV;
  } catch (error) {
    console.error('Error in generateTailoredCV:', error);
    toast.error('Failed to generate CV');
    throw error;
  }
};

/**
 * Gets a tailored CV by ID
 * @param cvId The ID of the CV to retrieve
 * @returns The tailored CV data
 */
export const getTailoredCV = async (cvId: string): Promise<TailoredCV | null> => {
  try {
    if (!cvId) {
      console.error('No CV ID provided');
      return null;
    }
    
    const { data, error } = await supabase
      .from('tailored_cvs')
      .select('*')
      .eq('id', cvId)
      .maybeSingle();
      
    if (error) {
      console.error('Error getting tailored CV:', error);
      return null;
    }
    
    return data as TailoredCV;
  } catch (error) {
    console.error('Error in getTailoredCV:', error);
    return null;
  }
};

/**
 * Checks if a tailored CV exists for a specific analysis
 * @param analysisId The ID of the job analysis to check
 * @returns The tailored CV if it exists, null otherwise
 */
export const checkForExistingCV = async (analysisId: string): Promise<TailoredCV | null> => {
  try {
    if (!analysisId) {
      console.error('No analysis ID provided');
      return null;
    }
    
    const { data, error } = await supabase
      .from('tailored_cvs')
      .select('*')
      .eq('analysis_id', analysisId)
      .maybeSingle();
      
    if (error) {
      console.error('Error checking for existing CV:', error);
      return null;
    }
    
    return data as TailoredCV;
  } catch (error) {
    console.error('Error in checkForExistingCV:', error);
    return null;
  }
};

/**
 * Updates an existing tailored CV
 * @param cvId The ID of the CV to update
 * @param template The new template to use
 * @returns The updated CV data
 */
export const updateTailoredCV = async (cvId: string, template: string): Promise<TailoredCV | null> => {
  try {
    const { data, error } = await supabase
      .from('tailored_cvs')
      .update({ template, updated_at: new Date().toISOString() })
      .eq('id', cvId)
      .select()
      .single();
      
    if (error) {
      console.error('Error updating tailored CV:', error);
      toast.error('Failed to update CV template');
      throw error;
    }
    
    toast.success('CV template updated successfully');
    return data as TailoredCV;
  } catch (error) {
    console.error('Error in updateTailoredCV:', error);
    throw error;
  }
};
