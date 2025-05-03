
import { supabase } from '@/integrations/supabase/client';

export interface ProfileData {
  id?: string;
  username?: string;
  full_name?: string;
  avatar_url?: string;
  bio?: string;
  website?: string;
  location?: string;
  role?: string;
  created_at?: string;
  updated_at?: string;
}

export async function getProfile(): Promise<ProfileData | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return null;
    }
    
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
      
    if (error) {
      console.error("Error fetching profile:", error);
      return null;
    }
    
    return data as ProfileData;
  } catch (error) {
    console.error("Error in getProfile:", error);
    return null;
  }
}

export async function updateProfile(profileData: Partial<ProfileData>): Promise<ProfileData | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('Not authenticated');
    }
    
    // Remove id from update data if it exists
    const { id, ...updateData } = profileData;
    
    const { data, error } = await supabase
      .from('profiles')
      .update({
        ...updateData,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id)
      .select()
      .single();
      
    if (error) {
      console.error("Error updating profile:", error);
      throw error;
    }
    
    return data as ProfileData;
  } catch (error) {
    console.error("Error in updateProfile:", error);
    throw error;
  }
}

export async function getProfileByUsername(username: string): Promise<ProfileData | null> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('username', username)
      .single();
      
    if (error) {
      console.error("Error fetching profile by username:", error);
      return null;
    }
    
    return data as ProfileData;
  } catch (error) {
    console.error("Error in getProfileByUsername:", error);
    return null;
  }
}
