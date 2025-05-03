
import { supabase } from "@/integrations/supabase/client";
import { UserDocument } from "./documentService";
import { toast } from "@/components/ui/sonner";
import { CVData } from "@/types/CVData";
import { ProfileData } from "./profileService";

/**
 * Extract CV data from uploaded documents and LinkedIn data
 */
export async function extractCVData(documentId: string): Promise<Partial<CVData> | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      toast.error("You must be logged in to extract CV data");
      return null;
    }
    
    // Call the edge function to extract CV data
    const { data, error } = await supabase.functions.invoke('extract-cv-data', {
      body: {
        documentId,
        userId: user.id
      }
    });
    
    if (error) {
      console.error("Error extracting CV data:", error);
      toast.error("Failed to extract data from CV");
      return null;
    }
    
    return data as Partial<CVData>;
  } catch (error) {
    console.error("Error in extractCVData:", error);
    toast.error("Failed to extract data from CV");
    return null;
  }
}

/**
 * Update user profile with data extracted from CV and LinkedIn
 */
export async function updateProfileWithCVData(cvData: Partial<CVData>): Promise<boolean> {
  try {
    if (!cvData) return false;
    
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      toast.error("You must be logged in to update your profile");
      return false;
    }
    
    // Convert CV data to profile format
    const profileUpdates: Partial<ProfileData> = {
      full_name: cvData.fullName,
      role: cvData.title,
      bio: cvData.summary
    };
    
    // Update the user's profile
    const { error } = await supabase
      .from('profiles')
      .update(profileUpdates)
      .eq('id', user.id);
      
    if (error) {
      console.error("Error updating profile with CV data:", error);
      toast.error("Failed to update profile with CV data");
      return false;
    }
    
    toast.success("Profile updated with CV data");
    return true;
  } catch (error) {
    console.error("Error in updateProfileWithCVData:", error);
    toast.error("Failed to update profile with CV data");
    return false;
  }
}

/**
 * Get all CV context for AI generation
 */
export async function getAllCVContext(): Promise<{
  cvDocuments: UserDocument[],
  linkedInData: any,
  profileData: ProfileData | null
} | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return null;
    
    // Get all CV documents
    const { data: documents, error: documentsError } = await supabase
      .from('user_documents')
      .select('*')
      .eq('user_id', user.id)
      .eq('document_type', 'cv');
      
    if (documentsError) {
      console.error("Error fetching CV documents:", documentsError);
      return null;
    }
    
    // Get LinkedIn data if available
    const { data: linkedInData, error: linkedInError } = await supabase
      .from('linkedin_profiles')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();
      
    if (linkedInError && linkedInError.code !== 'PGRST116') {
      console.error("Error fetching LinkedIn data:", linkedInError);
    }
    
    // Get profile data
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();
      
    if (profileError) {
      console.error("Error fetching profile data:", profileError);
    }
    
    return {
      cvDocuments: documents || [],
      linkedInData: linkedInData || null,
      profileData: profileData || null
    };
  } catch (error) {
    console.error("Error gathering CV context:", error);
    return null;
  }
}
