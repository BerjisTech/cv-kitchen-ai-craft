
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";

export interface SocialConnection {
  id: string;
  user_id: string;
  provider: 'linkedin' | 'github';
  provider_id: string;
  profile_url: string | null;
  display_name: string | null;
  access_token: string | null;
  refresh_token: string | null;
  created_at: string;
  updated_at: string;
}

export async function connectWithLinkedIn() {
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'linkedin_oidc',
      options: {
        redirectTo: `${window.location.origin}/auth/callback?provider=linkedin`,
        scopes: 'openid profile email',
      },
    });
    
    if (error) throw error;
    
    // The user will be redirected to LinkedIn for authorization
    
  } catch (error: any) {
    console.error("Error connecting with LinkedIn:", error);
    toast.error("Failed to connect with LinkedIn");
  }
}

export async function connectWithGitHub() {
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: `${window.location.origin}/auth/callback?provider=github`,
        scopes: 'read:user user:email',
      },
    });
    
    if (error) throw error;
    
    // The user will be redirected to GitHub for authorization
    
  } catch (error: any) {
    console.error("Error connecting with GitHub:", error);
    toast.error("Failed to connect with GitHub");
  }
}

export async function getUserConnections(): Promise<SocialConnection[]> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) throw new Error("Not authenticated");
    
    const { data, error } = await supabase
      .from('user_connections')
      .select('*')
      .eq('user_id', user.id);
      
    if (error) throw error;
    
    return data as SocialConnection[];
    
  } catch (error: any) {
    console.error("Error fetching user connections:", error);
    return [];
  }
}

export async function disconnectSocialAccount(provider: string): Promise<boolean> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) throw new Error("Not authenticated");
    
    const { error } = await supabase
      .from('user_connections')
      .delete()
      .match({ user_id: user.id, provider });
      
    if (error) throw error;
    
    toast.success(`Disconnected from ${provider}`);
    return true;
    
  } catch (error: any) {
    console.error("Error disconnecting social account:", error);
    toast.error("Failed to disconnect account");
    return false;
  }
}
