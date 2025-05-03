
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";

export interface CoverLetter {
  id: string;
  title: string;
  content: string;
  position: string;
  company: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  last_updated?: string;
}

export async function getUserCoverLetters(): Promise<CoverLetter[]> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      toast.error("You must be logged in to access cover letters");
      return [];
    }
    
    const { data, error } = await supabase
      .from('cover_letters')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error("Error fetching cover letters:", error);
      toast.error("Failed to load cover letters");
      return [];
    }
    
    // Format dates for display
    return data.map(letter => ({
      ...letter,
      last_updated: new Date(letter.updated_at).toLocaleDateString()
    }));
  } catch (error) {
    console.error("Error in getUserCoverLetters:", error);
    toast.error("Failed to load cover letters");
    return [];
  }
}

export async function createCoverLetter(coverLetterData: Partial<CoverLetter>): Promise<CoverLetter | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      toast.error("You must be logged in to create a cover letter");
      return null;
    }
    
    const { data, error } = await supabase
      .from('cover_letters')
      .insert({
        ...coverLetterData,
        user_id: user.id
      })
      .select()
      .single();
      
    if (error) {
      console.error("Error creating cover letter:", error);
      toast.error("Failed to create cover letter");
      return null;
    }
    
    toast.success("Cover letter created successfully");
    return data;
  } catch (error) {
    console.error("Error in createCoverLetter:", error);
    toast.error("Failed to create cover letter");
    return null;
  }
}
