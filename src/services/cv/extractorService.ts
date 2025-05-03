
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

    // First check if we already have extracted data for this document
    const { data: existingData, error: existingError } = await supabase
      .from('cv_extracted_data')
      .select('extracted_data')
      .eq('document_id', documentId)
      .eq('user_id', user.id)
      .maybeSingle();
    
    if (existingError) {
      console.error("Error checking for existing extracted data:", existingError);
    } else if (existingData?.extracted_data) {
      // Check if the extracted data contains placeholder content
      const extractedData = existingData.extracted_data as ExtractedCVData;
      if (extractedData.summary && extractedData.summary.includes('placeholder')) {
        console.log(`Cached data contains placeholders for document ${documentId}, re-extracting data`);
        // Continue with extraction to replace placeholder data
      } else {
        console.log(`Using cached extracted data for document ${documentId}`);
        return extractedData;
      }
    }

    console.log(`Extracting data from CV document ${documentId} for user ${user.id}`);
    toast.info("Extracting data from CV...", { duration: 2000 });
    
    // Call the Edge Function to extract data from the CV
    const { data, error } = await supabase.functions.invoke('extract-cv-data', {
      body: { documentId, userId: user.id },
    });

    if (error) {
      console.error("Error calling extract-cv-data function:", error);
      throw new Error(`Failed to extract data: ${error.message}`);
    }

    // Check if the extraction returned an error about the document not being processable
    if (data && data.error && data.documentName) {
      console.error(`Failed to extract data from ${data.documentName}: ${data.error}`);
      toast.error(`Could not extract data from ${data.documentName}: ${data.error}`);
      return null;
    }
    
    console.log("Extracted CV data:", data);
    
    // Store the extracted data in the database for future use
    if (data) {
      const { error: storageError } = await supabase.from('cv_extracted_data').insert({
        document_id: documentId,
        user_id: user.id,
        extracted_data: data
      });
      
      if (storageError) {
        // Log but don't throw - we still want to return the data even if storing fails
        console.error("Error storing extracted CV data:", storageError);
      }
    }
    
    return data;
  } catch (error) {
    console.error('Error in extractCVData:', error);
    toast.error(`Failed to extract CV data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return null;
  }
};
