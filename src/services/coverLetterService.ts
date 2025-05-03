
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";

export interface CoverLetter {
  id: string;
  title: string;
  content: string;
  position: string | null;
  company: string | null;
  user_id: string;
  created_at: string;
  updated_at: string;
  last_updated?: string | null;
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
      .order('updated_at', { ascending: false });
      
    if (error) {
      console.error("Error fetching cover letters:", error);
      toast.error("Failed to load cover letters");
      return [];
    }
    
    return data as CoverLetter[];
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
    
    // Ensure required fields are present
    if (!coverLetterData.title || !coverLetterData.content) {
      toast.error("Cover letter title and content are required");
      return null;
    }
    
    const newCoverLetter = {
      title: coverLetterData.title,
      content: coverLetterData.content,
      position: coverLetterData.position || null,
      company: coverLetterData.company || null,
      user_id: user.id,
      last_updated: new Date().toISOString()
    };
    
    const { data, error } = await supabase
      .from('cover_letters')
      .insert(newCoverLetter)
      .select()
      .single();
      
    if (error) {
      console.error("Error creating cover letter:", error);
      toast.error("Failed to create cover letter");
      return null;
    }
    
    toast.success("Cover letter created successfully");
    return data as CoverLetter;
  } catch (error) {
    console.error("Error in createCoverLetter:", error);
    toast.error("Failed to create cover letter");
    return null;
  }
}

export async function updateCoverLetter(id: string, coverLetterData: Partial<CoverLetter>): Promise<CoverLetter | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      toast.error("You must be logged in to update a cover letter");
      return null;
    }
    
    const updates = {
      ...coverLetterData,
      updated_at: new Date().toISOString(),
      last_updated: new Date().toISOString()
    };
    
    // Make sure title and content are present if they're being updated
    if (updates.title === undefined && coverLetterData.title === undefined) {
      delete updates.title;
    }
    
    if (updates.content === undefined && coverLetterData.content === undefined) {
      delete updates.content;
    }
    
    const { data, error } = await supabase
      .from('cover_letters')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
      
    if (error) {
      console.error("Error updating cover letter:", error);
      toast.error("Failed to update cover letter");
      return null;
    }
    
    toast.success("Cover letter updated successfully");
    return data as CoverLetter;
  } catch (error) {
    console.error("Error in updateCoverLetter:", error);
    toast.error("Failed to update cover letter");
    return null;
  }
}

export async function deleteCoverLetter(id: string): Promise<boolean> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      toast.error("You must be logged in to delete a cover letter");
      return false;
    }
    
    const { error } = await supabase
      .from('cover_letters')
      .delete()
      .eq('id', id);
      
    if (error) {
      console.error("Error deleting cover letter:", error);
      toast.error("Failed to delete cover letter");
      return false;
    }
    
    toast.success("Cover letter deleted successfully");
    return true;
  } catch (error) {
    console.error("Error in deleteCoverLetter:", error);
    toast.error("Failed to delete cover letter");
    return false;
  }
}
