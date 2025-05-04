
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';
import type { ExtractedCVData, ProfileData } from './types';

/**
 * Extracts data from a CV document using the Supabase Edge Function
 */
export async function extractCVData(documentId: string): Promise<ExtractedCVData | null> {
  try {
    // Get the document details to pass to the function
    const { data: document, error: documentError } = await supabase
      .from('user_documents')
      .select('*')
      .eq('id', documentId)
      .single();
    
    if (documentError || !document) {
      console.error("Error getting document details:", documentError);
      toast.error("Could not find document details. The document may have been deleted.");
      return null;
    }
    
    // Verify the document file exists in storage
    try {
      const { data: fileExists, error: fileCheckError } = await supabase
        .storage
        .from('career-uploads')
        .createSignedUrl(document.filepath, 10); // Short expiry just to check existence
      
      if (fileCheckError || !fileExists) {
        console.error("File does not exist or is inaccessible:", document.filepath, fileCheckError);
        toast.error(`The file "${document.filename}" exists in the database but cannot be accessed in storage. It may have been deleted or corrupted.`);
        return null;
      }
    } catch (fileError) {
      console.error("Error verifying file existence:", fileError);
      toast.error(`Could not verify if "${document.filename}" exists in storage. It may be inaccessible.`);
      return null;
    }
    
    // Get the user ID to pass to the function
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      console.error("Error getting current user:", userError);
      toast.error("Could not identify the current user");
      return null;
    }
    
    // Call the extract-cv-data function with the document details and user ID
    toast.info(`Extracting data from "${document.filename}"...`, { duration: 5000 });
    
    try {
      const { data, error } = await supabase.functions.invoke('extract-cv-data', {
        body: {
          documentId,
          userId: user.id,
          forceReExtract: true // Always force re-extraction to ensure fresh data
        }
      });
      
      if (error) {
        console.error("Error calling extract-cv-data function:", error);
        
        // Provide more detailed error information
        let errorDetails = "Unknown error";
        if (error.message) errorDetails = error.message;
        
        toast.error(`Failed to extract data: ${errorDetails}`, { duration: 5000 });
        return null;
      }
      
      if (!data || data.error) {
        console.error("Function returned an error:", data?.error || "Unknown error");
        
        // Provide more context in the error message
        const errorMessage = data?.error || "Unknown processing error";
        toast.error(`Document processing failed: ${errorMessage}`, { duration: 5000 });
        return null;
      }
      
      toast.success(`Successfully extracted data from "${document.filename}"`, { duration: 3000 });
      
      // Cast the response data to our ExtractedCVData type
      return data as unknown as ExtractedCVData;
    } catch (functionError: any) {
      console.error("Error in extractCVData function call:", functionError);
      let errorMessage = "Failed to process document.";
      
      // Add more detailed error information
      if (functionError.message) {
        errorMessage += ` Details: ${functionError.message}`;
        console.error("Error message:", functionError.message);
      }
      
      if (functionError.response) {
        console.error("Function response object:", functionError.response);
        try {
          const responseStatus = functionError.response.status;
          const responseBody = await functionError.response.text();
          console.error(`Function response status: ${responseStatus}`);
          console.error("Function response body:", responseBody);
          
          // Try to parse as JSON for more details
          try {
            const responseJson = JSON.parse(responseBody);
            if (responseJson.error) {
              errorMessage = `Error: ${responseJson.error}`;
              if (responseJson.details) {
                errorMessage += ` (${responseJson.details})`;
              }
              console.error("Parsed error details:", responseJson);
            }
          } catch (e) {
            // Not JSON, use the text
            if (responseBody && responseBody.length < 100) {
              errorMessage += ` Server response: ${responseBody}`;
            }
          }
        } catch (e) {
          // Ignore errors reading response
          console.error("Error parsing response:", e);
        }
      }
      
      toast.error(errorMessage, { duration: 5000 });
      return null;
    }
  } catch (error: any) {
    console.error("Error in extractCVData:", error);
    toast.error(`Failed to process document: ${error.message || "Unknown error"}`, { duration: 5000 });
    return null;
  }
}

/**
 * Enhances user profile with data from their CVs
 */
export async function enhanceUserProfile(): Promise<boolean> {
  try {
    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      console.error("Error getting current user:", userError);
      toast.error("Could not identify the current user");
      return false;
    }
    
    toast.info("Enhancing your profile with CV data...", { duration: 5000 });
    
    try {
      // Call the extract-cv-data function with the enhance parameter and user ID
      const { data, error } = await supabase.functions.invoke('extract-cv-data', {
        body: {
          userId: user.id,
          enhanceProfile: true
        }
      });
      
      if (error) {
        // Provide more detailed error information
        let errorDetails = "Unknown error";
        if (error.message) errorDetails = error.message;
        
        console.error("Error enhancing profile:", error);
        console.error("Error details:", errorDetails);
        
        toast.error(`Failed to enhance profile: ${errorDetails}`, { duration: 5000 });
        return false;
      }
      
      if (!data || data.error) {
        const errorMessage = data?.error || "Unknown processing error";
        console.error("Profile enhancement returned an error:", errorMessage);
        
        toast.error(`Profile enhancement failed: ${errorMessage}`, { duration: 5000 });
        return false;
      }
      
      toast.success("Successfully enhanced your profile with CV data", { duration: 3000 });
      return true;
    } catch (functionError: any) {
      // Extract and log detailed information about the error
      console.error("Error calling extract-cv-data function for profile enhancement:", functionError);
      
      let errorMessage = "Failed to enhance profile.";
      
      if (functionError.message) {
        errorMessage += ` Details: ${functionError.message}`;
        console.error("Error message:", functionError.message);
      }
      
      // Try to extract response data if available
      if (functionError.response) {
        console.error("Error response object:", functionError.response);
        try {
          const responseStatus = functionError.response.status;
          const responseBody = await functionError.response.text();
          console.error(`Error response status: ${responseStatus}`);
          console.error("Error response body:", responseBody);
          
          try {
            const responseJson = JSON.parse(responseBody);
            if (responseJson.error) {
              errorMessage = `Error: ${responseJson.error}`;
              if (responseJson.details) {
                errorMessage += ` (${responseJson.details})`;
              }
              console.error("Parsed error details:", responseJson);
            }
          } catch (e) {
            // Not JSON
            if (responseBody && responseBody.length < 100) {
              errorMessage += ` Server response: ${responseBody}`;
            }
          }
        } catch (e) {
          // Ignore errors reading response
          console.error("Error parsing response:", e);
        }
      }
      
      toast.error(errorMessage, { duration: 5000 });
      return false;
    }
  } catch (error: any) {
    console.error("Error in enhanceUserProfile:", error);
    toast.error(`Failed to enhance profile: ${error.message || "Unknown error"}`, { duration: 5000 });
    return false;
  }
}
