
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';
import type { ExtractedCVData } from './types';

/**
 * Extracts data from a CV document using the Supabase Edge Function
 */
export const extractCVData = async (documentId: string): Promise<ExtractedCVData | null> => {
  try {
    // Check if user is authenticated
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error("You must be logged in to extract CV data");
      return null;
    }

    // First check if we already have extracted data for this document
    const { data: existingData, error: existingError } = await supabase
      .from('cv_extracted_data')
      .select('extracted_data, id')
      .eq('document_id', documentId)
      .eq('user_id', user.id)
      .maybeSingle();
    
    if (existingError) {
      console.error("Error checking for existing extracted data:", existingError);
    } else if (existingData?.extracted_data) {
      // Check if the extracted data contains placeholder content
      const extractedData = existingData.extracted_data as ExtractedCVData;
      if (extractedData.summary && (
          extractedData.summary.includes('placeholder') || 
          extractedData.summary.includes('could not be processed')
      )) {
        console.log(`Cached data contains placeholders for document ${documentId}, removing it to force re-extraction`);
        
        // Delete the existing data with placeholders to force re-extraction
        await supabase
          .from('cv_extracted_data')
          .delete()
          .eq('id', existingData.id);
      } else {
        console.log(`Using cached extracted data for document ${documentId}`);
        return extractedData;
      }
    }

    // Get the document details to pass to the toast if extraction fails
    const { data: document } = await supabase
      .from('user_documents')
      .select('filename, filepath')
      .eq('id', documentId)
      .single();
    
    if (!document) {
      toast.error("Document not found. It may have been deleted.");
      return null;
    }

    console.log(`Extracting data from CV document ${documentId} for user ${user.id}`);
    toast.info("Extracting data from CV...", { duration: 3000 });
    
    try {
      // Call the Edge Function to extract data from the CV
      const { data, error } = await supabase.functions.invoke('extract-cv-data', {
        body: { 
          documentId, 
          userId: user.id 
        },
        // Add a reasonable timeout for the function call
        options: {
          timeout: 60000 // 60 seconds timeout
        }
      });

      if (error) {
        console.error("Error calling extract-cv-data function:", error);
        
        // Provide more detailed error feedback
        if (error.message.includes('422')) {
          toast.error(`The document "${document?.filename || 'file'}" could not be processed. It might be inaccessible or in an unsupported format.`);
        } else {
          toast.error(`Failed to extract data from ${document?.filename || 'document'}. Please try again later.`);
        }
        
        return null;
      }

      // Check if the extraction returned an error about the document not being processable
      if (data && data.error) {
        console.error(`Failed to extract data from ${data.documentName || document?.filename || 'document'}: ${data.error}`);
        toast.error(`Could not extract data from ${data.documentName || document?.filename || 'document'}: ${data.error}`);
        return null;
      }
      
      console.log("Extracted CV data:", data);
      
      // Store the extracted data in the database for future use
      if (data) {
        // Only store if we have actual data, not placeholder content
        if (!data.summary || !data.summary.includes('placeholder')) {
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
      }
      
      return data;
    } catch (functionError: any) {
      console.error("Error in extractCVData function call:", functionError);
      let errorMessage = "Failed to process document.";
      
      // Extract more detailed error message if available
      if (functionError.message) {
        if (functionError.message.includes("404")) {
          errorMessage = `The file "${document?.filename}" could not be found in storage.`;
        } else if (functionError.message.includes("403")) {
          errorMessage = "You don't have permission to access this file.";
        } else if (functionError.message.includes("timeout")) {
          errorMessage = "The extraction process timed out. The file may be too large or complex.";
        }
      }
      
      toast.error(errorMessage);
      return null;
    }
  } catch (error: any) {
    console.error('Error in extractCVData:', error);
    toast.error(`Failed to extract CV data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return null;
  }
};
