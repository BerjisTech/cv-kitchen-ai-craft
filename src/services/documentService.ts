
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";

export interface UserDocument {
  id: string;
  user_id: string;
  filename: string;
  filepath: string;
  document_type: 'cv' | 'portfolio' | 'certificate' | 'other';
  file_size: number;
  file_type: string;
  created_at: string;
  updated_at: string;
}

export async function getUserDocuments(type?: string): Promise<UserDocument[]> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) throw new Error("Not authenticated");
    
    let query = supabase
      .from('user_documents')
      .select('*')
      .eq('user_id', user.id);
      
    if (type) {
      query = query.eq('document_type', type);
    }
    
    const { data, error } = await query.order('created_at', { ascending: false });
    
    if (error) throw error;
    
    // Convert document_type to the expected type
    return (data as any[]).map(doc => ({
      ...doc,
      document_type: doc.document_type as 'cv' | 'portfolio' | 'certificate' | 'other'
    }));
    
  } catch (error: any) {
    console.error("Error fetching documents:", error);
    toast.error("Failed to load your documents");
    return [];
  }
}

export async function deleteDocument(id: string): Promise<boolean> {
  try {
    // First get the document to find the storage path
    const { data: document, error: fetchError } = await supabase
      .from('user_documents')
      .select('filepath')
      .eq('id', id)
      .single();
      
    if (fetchError) throw fetchError;
    
    // Delete from storage
    const { error: storageError } = await supabase
      .storage
      .from('career-uploads')
      .remove([document.filepath]);
      
    if (storageError) throw storageError;
    
    // Delete from database
    const { error: dbError } = await supabase
      .from('user_documents')
      .delete()
      .eq('id', id);
      
    if (dbError) throw dbError;
    
    toast.success("Document deleted successfully");
    return true;
    
  } catch (error: any) {
    console.error("Error deleting document:", error);
    toast.error("Failed to delete document");
    return false;
  }
}

export async function getDownloadUrl(filepath: string): Promise<string | null> {
  try {
    const { data, error } = await supabase
      .storage
      .from('career-uploads')
      .createSignedUrl(filepath, 60); // 60 seconds expiry
      
    if (error) throw error;
    
    return data.signedUrl;
    
  } catch (error: any) {
    console.error("Error getting download URL:", error);
    return null;
  }
}
