
import { supabase } from '@/integrations/supabase/client';

/**
 * Gets the context for all CV documents for the current user
 */
export const getAllCVContext = async (): Promise<string[]> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return [];
    }

    // Fetch both CV documents and LinkedIn data if available
    const documentsResult = await supabase
      .from('user_documents')
      .select('*')
      .eq('user_id', user.id)
      .eq('document_type', 'cv');
      
    const linkedInResult = await supabase
      .from('linkedin_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();
    
    // Process LinkedIn data - handle errors gracefully
    const linkedInProfiles = linkedInResult.error ? [] : linkedInResult.data ? [linkedInResult.data] : [];
    
    if (!documentsResult.data || documentsResult.error) {
      console.error("Error fetching CV documents:", documentsResult.error);
      return [];
    }
    
    // Get the document contents
    const documents = documentsResult.data;
    const contexts: string[] = [];
    
    console.log(`Found ${documents.length} CV documents to process`);
    
    for (const doc of documents) {
      // Add document context with more details
      contexts.push(`CV Document: ${doc.filename} (ID: ${doc.id})`);
    }
    
    // Add LinkedIn context if available
    if (linkedInProfiles && linkedInProfiles.length > 0) {
      contexts.push('LinkedIn Profile Data Available');
    }
    
    return contexts;
  } catch (error) {
    console.error('Error getting CV context:', error);
    return [];
  }
};
