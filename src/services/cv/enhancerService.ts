
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';
import type { ExtractedCVData } from './types';

/**
 * Enhances the user's profile by processing all available CV data
 */
export const enhanceUserProfile = async (): Promise<boolean> => {
  try {
    // Check if user is authenticated
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error("You must be logged in to enhance your profile");
      return false;
    }

    toast.info("Enhancing your profile with CV data...", { duration: 5000 });

    // Call the Extract CV Data edge function with enhance flag
    const { data, error } = await supabase.functions.invoke('extract-cv-data', {
      body: { 
        userId: user.id,
        enhanceProfile: true,
        forceReExtract: true // Always force re-extraction to ensure fresh data
      }
    });

    if (error) {
      console.error("Error calling extract-cv-data function for profile enhancement:", error);
      toast.error(`Failed to enhance profile: ${error.message}`);
      return false;
    }

    if (data && data.error) {
      console.error("Error enhancing profile:", data.error);
      toast.error(`Failed to enhance profile: ${data.error}`);
      return false;
    }

    if (data && data.success) {
      toast.success("Profile enhanced successfully with CV data");
      return true;
    }

    return false;
  } catch (error: any) {
    console.error('Error in enhanceUserProfile:', error);
    toast.error(`Failed to enhance profile: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return false;
  }
};
