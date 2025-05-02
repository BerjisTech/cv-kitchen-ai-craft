
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";

/**
 * Sets a user's role to superadmin
 * @param userId The ID of the user to promote
 * @returns Whether the operation was successful
 */
export async function promoteToSuperadmin(userId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('profiles')
      .update({ role: 'superadmin' })
      .eq('id', userId);
    
    if (error) throw error;
    
    toast.success("User promoted to superadmin");
    return true;
  } catch (error: any) {
    console.error("Error promoting user:", error);
    toast.error(error.message || "Failed to promote user");
    return false;
  }
}

/**
 * Utility function to get current user's ID
 * @returns The current user's ID or null
 */
export async function getCurrentUserId(): Promise<string | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    return user?.id || null;
  } catch (error) {
    console.error("Error getting current user:", error);
    return null;
  }
}
