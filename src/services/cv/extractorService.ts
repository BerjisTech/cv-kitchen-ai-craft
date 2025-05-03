
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';
import type { ExtractedCVData } from './types';

/**
 * Extracts data from a CV document using the Supabase Edge Function
 */
export const extractCVData = async (documentId: string): Promise<ExtractedCVData | null> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error("You must be logged in to extract CV data");
      return null;
    }

    console.log(`Extracting data from CV document ${documentId} for user ${user.id}`);
    
    // Call the Edge Function to extract data from the CV
    const { data, error } = await supabase.functions.invoke('extract-cv-data', {
      body: { documentId, userId: user.id },
    });

    if (error) {
      console.error("Error calling extract-cv-data function:", error);
      throw new Error(`Failed to extract data: ${error.message}`);
    }

    console.log("Extracted CV data:", data);
    return data;
  } catch (error) {
    console.error('Error in extractCVData:', error);
    throw error;
  }
};
