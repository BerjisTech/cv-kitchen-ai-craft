
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
  email?: string;
  phone?: string;
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
    
    // Include email from auth.user
    return { 
      ...data as ProfileData, 
      email: user.email
    };
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
    
    // Extract fields that should not be sent to the profiles table
    const { id, email, phone, ...updateData } = profileData;
    
    // Prepare data for the profiles table update
    const profileUpdateData = {
      ...updateData,
      updated_at: new Date().toISOString()
    };
    
    // Update the profile
    const { data, error } = await supabase
      .from('profiles')
      .update(profileUpdateData)
      .eq('id', user.id)
      .select()
      .single();
      
    if (error) {
      console.error("Error updating profile:", error);
      throw error;
    }
    
    // Update phone in auth.user metadata if it's included
    if (phone !== undefined) {
      try {
        await supabase.auth.updateUser({
          data: { phone }
        });
      } catch (metaError) {
        console.error("Error updating user metadata:", metaError);
        // Continue even if metadata update fails
      }
    }
    
    // Include email and phone in the returned data
    return { 
      ...data as ProfileData, 
      email: user.email,
      phone: profileData.phone
    };
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

export async function updatePassword(currentPassword: string, newPassword: string): Promise<boolean> {
  try {
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });

    if (error) {
      console.error("Error updating password:", error);
      throw error;
    }
    
    return true;
  } catch (error) {
    console.error("Error in updatePassword:", error);
    return false;
  }
}
