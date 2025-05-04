
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';

/**
 * Extracts data from a CV document
 */
export async function extractCVData(documentId: string) {
  try {
    // Call the extract-cv-data function
    const { data, error } = await supabase.functions.invoke('extract-cv-data', {
      body: { documentId }
    });
    
    if (error) {
      console.error("Error calling extract-cv-data function:", error);
      toast.error(`Failed to extract data: ${error.message}`);
      return null;
    }
    
    if (!data || data.error) {
      console.error("Function returned an error:", data?.error);
      toast.error(`Failed to extract data: ${data?.error || "Unknown error"}`);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error("Error extracting CV data:", error);
    toast.error(`Error: ${error instanceof Error ? error.message : "Unknown error"}`);
    return null;
  }
}

/**
 * Updates user profile with data extracted from a CV
 */
export async function updateProfileWithCVData(cvData: any) {
  try {
    // Call the extract-cv-data function with update flag
    const { data, error } = await supabase.functions.invoke('extract-cv-data', {
      body: { 
        updateProfile: true,
        cvData
      }
    });
    
    if (error) {
      console.error("Error updating profile with CV data:", error);
      toast.error(`Failed to update profile: ${error.message}`);
      return false;
    }
    
    if (!data || data.error) {
      console.error("Function returned an error:", data?.error);
      toast.error(`Failed to update profile: ${data?.error || "Unknown error"}`);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Error updating profile with CV data:", error);
    toast.error(`Error: ${error instanceof Error ? error.message : "Unknown error"}`);
    return false;
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
    
    const { data, error } = await supabase.functions.invoke('extract-cv-data', {
      body: {
        enhanceProfile: true,
        userId: user.id
      }
    });
    
    if (error) {
      console.error("Error enhancing profile:", error);
      toast.error(`Failed to enhance profile: ${error.message}`);
      return false;
    }
    
    if (!data || data.error) {
      console.error("Profile enhancement returned an error:", data?.error);
      toast.error(`Profile enhancement failed: ${data?.error || "Unknown error"}`);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Error in enhanceUserProfile:", error);
    toast.error(`Error: ${error instanceof Error ? error.message : "Unknown error"}`);
    return false;
  }
}

/**
 * Extract data from multiple CV documents using the advanced extraction
 */
export async function extractCVDataAdvanced(documentIds: string[]) {
  if (!documentIds || documentIds.length === 0) {
    toast.error("No documents selected for processing");
    return null;
  }
  
  try {
    // Get the documents details
    const { data: documents, error: documentsError } = await supabase
      .from('user_documents')
      .select('*')
      .in('id', documentIds);
    
    if (documentsError || !documents) {
      console.error("Error getting document details:", documentsError);
      toast.error("Could not retrieve document details");
      return null;
    }
    
    // Generate signed URLs for each document
    const files = await Promise.all(
      documents.map(async (doc) => {
        const { data: signedURL, error: signedURLError } = await supabase
          .storage
          .from('career-uploads')
          .createSignedUrl(doc.filepath, 60); // 60 seconds expiry
        
        if (signedURLError || !signedURL) {
          console.error(`Error creating signed URL for ${doc.filename}:`, signedURLError);
          return null;
        }
        
        return {
          id: doc.id,
          url: signedURL.signedUrl,
          filename: doc.filename,
          type: doc.file_type
        };
      })
    );
    
    // Filter out any null values (failed to get signed URL)
    const validFiles = files.filter(Boolean);
    
    if (validFiles.length === 0) {
      toast.error("Could not generate access links to any of the selected files");
      return null;
    }
    
    // Call the extract-cv-data-advanced function
    toast.info(`Processing ${validFiles.length} documents with advanced AI analysis...`);
    
    const { data, error } = await supabase.functions.invoke('extract-cv-data-advanced', {
      body: { files: validFiles }
    });
    
    if (error) {
      console.error("Error calling extract-cv-data-advanced function:", error);
      toast.error(`Failed to process documents: ${error.message}`);
      return null;
    }
    
    if (!data) {
      console.error("No data returned from function");
      toast.error("No data returned from document processing");
      return null;
    }
    
    if (data.error) {
      console.error("Function returned an error:", data.error);
      toast.error(`Document processing failed: ${data.error}`);
      return null;
    }
    
    toast.success(`Successfully processed ${validFiles.length} documents!`);
    return data;
  } catch (error) {
    console.error("Error in extractCVDataAdvanced:", error);
    toast.error(`Error: ${error instanceof Error ? error.message : "Unknown error"}`);
    return null;
  }
}
