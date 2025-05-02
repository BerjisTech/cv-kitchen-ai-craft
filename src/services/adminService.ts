
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";

export async function getCurrentUserId(): Promise<string | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    return user?.id ?? null;
  } catch (error) {
    console.error("Error getting current user:", error);
    return null;
  }
}

export async function promoteToSuperadmin(userId: string): Promise<boolean> {
  try {
    console.log("Promoting user to superadmin:", userId);
    
    const { error } = await supabase
      .from('profiles')
      .update({ role: 'superadmin' })
      .eq('id', userId);
      
    if (error) throw error;
    
    toast.success("Successfully promoted to superadmin. Please refresh the page.");
    return true;
  } catch (error: any) {
    console.error("Error promoting to superadmin:", error);
    toast.error(error.message || "Failed to promote user");
    return false;
  }
}
