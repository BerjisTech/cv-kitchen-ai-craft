
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";

export type ProfileData = {
  id: string;
  full_name: string | null;
  username: string | null;
  avatar_url: string | null;
  bio: string | null;
  website: string | null;
  role: string;
  email?: string;
  phone?: string;
  location?: string;
};

export async function getProfile(): Promise<ProfileData | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) throw new Error("User not authenticated");
    
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    
    if (error) throw error;
    
    // Create a ProfileData object with the required role field
    // Since role is not in the database, we'll default it to 'job_seeker'
    const profileData: ProfileData = {
      ...data,
      // Add the role field with a default value
      role: 'job_seeker',
      email: user.email
    };
    
    return profileData;
    
  } catch (error: any) {
    console.error("Error fetching profile:", error);
    toast.error("Failed to load profile data");
    return null;
  }
}

export async function updateProfile(updates: Partial<ProfileData>): Promise<boolean> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) throw new Error("User not authenticated");
    
    // Remove fields that aren't in the profiles table
    const { email, phone, location, role, ...profileData } = updates;
    
    const { error } = await supabase
      .from('profiles')
      .update(profileData)
      .eq('id', user.id);
      
    if (error) throw error;
    
    toast.success("Profile updated successfully");
    return true;
  } catch (error: any) {
    console.error("Error updating profile:", error);
    toast.error(error.message || "Failed to update profile");
    return false;
  }
}

export async function updatePassword(
  currentPassword: string,
  newPassword: string
): Promise<boolean> {
  try {
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });
    
    if (error) throw error;
    
    toast.success("Password updated successfully");
    return true;
  } catch (error: any) {
    console.error("Error updating password:", error);
    toast.error(error.message || "Failed to update password");
    return false;
  }
}

// Get profile by username
export async function getProfileByUsername(username: string): Promise<ProfileData | null> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('username', username)
      .single();
    
    if (error) throw error;
    
    // Create a ProfileData object with the required role field
    const profileData: ProfileData = {
      ...data,
      // Since role is not in the database, we'll default it to 'job_seeker'
      role: 'job_seeker'
    };
    
    return profileData;
    
  } catch (error: any) {
    console.error("Error fetching profile by username:", error);
    return null;
  }
}
