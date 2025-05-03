
import { supabase } from '@/integrations/supabase/client';
import { TailoredCV } from '@/types/tailoredCV';

/**
 * Generates a tailored CV for a specific job analysis
 * @param analysisId The ID of the job analysis to generate the CV for
 * @param template The template to use for the CV
 * @returns The generated CV data
 */
export const generateTailoredCV = async (analysisId: string, template: string = 'modern'): Promise<TailoredCV | null> => {
  try {
    // Get the job analysis
    const { data: analysis } = await supabase
      .from('job_analyses')
      .select('*')
      .eq('id', analysisId)
      .single();
      
    if (!analysis) {
      throw new Error('Analysis not found');
    }
    
    // Call the edge function to generate the CV
    const { data, error } = await supabase.functions.invoke('generate-tailored-cv', {
      body: { 
        analysis_id: analysisId,
        template
      }
    });
    
    if (error) {
      console.error('Error generating CV:', error);
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('Error in generateTailoredCV:', error);
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
    const { data, error } = await supabase
      .from('tailored_cvs')
      .select('*')
      .eq('id', cvId)
      .single();
      
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
    const { data, error } = await supabase
      .from('tailored_cvs')
      .select('*')
      .eq('analysis_id', analysisId)
      .maybeSingle();
      
    if (error || !data) {
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
      throw error;
    }
    
    return data as TailoredCV;
  } catch (error) {
    console.error('Error in updateTailoredCV:', error);
    throw error;
  }
};
