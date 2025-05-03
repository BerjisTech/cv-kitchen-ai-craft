
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";

export interface ExtractedCVData {
  personal_info?: {
    full_name?: string;
    email?: string;
    phone?: string;
    location?: string;
    linkedin_url?: string;
    website?: string;
  };
  summary?: string;
  skills?: Array<{ name: string; level?: number }>;
  work_experience?: Array<{
    company: string;
    role: string;
    start_date: string;
    end_date?: string;
    description?: string;
  }>;
  education?: Array<{
    institution: string;
    degree: string;
    start_year: string;
    end_year?: string;
    description?: string;
  }>;
  certifications?: Array<{
    name: string;
    issuer?: string;
    date?: string;
  }>;
  languages?: Array<{
    language: string;
    level?: string;
  }>;
}

export async function extractCVData(documentId: string): Promise<ExtractedCVData | null> {
  try {
    console.log(`Attempting to extract data from document ID: ${documentId}`);
    toast.info("Starting CV data extraction...");

    // First check if we already have extracted data for this document
    let existingData = null;
    let existingError = null;
    
    try {
      const { data, error } = await supabase
        .from('cv_extracted_data')
        .select('extracted_data')
        .eq('document_id', documentId)
        .limit(1)
        .single();
        
      if (error) {
        console.error("Error fetching existing extracted data:", error);
        existingError = error;
      } else {
        existingData = data;
      }
    } catch (e) {
      console.error("Error checking for existing extracted data:", e);
      toast.error("Could not check if this document has already been processed");
      return null; // Do not proceed if we can't even check for existing data
    }
    
    // If there was an error checking for existing data, stop here
    if (existingError) {
      console.error("Error checking for existing extracted data:", existingError);
      toast.error(`Database error: ${existingError.message}`);
      return null;
    }
    
    // If we have existing data, use it unless it's a placeholder
    if (existingData?.extracted_data) {
      // Check if the extracted data contains placeholder content
      const extractedData = existingData.extracted_data as unknown as ExtractedCVData;
      
      if (extractedData.summary && 
          typeof extractedData.summary === 'string' && 
          !extractedData.summary.includes('placeholder') && 
          !extractedData.summary.includes('could not be processed')) {
        
        console.log("Using cached extracted CV data");
        toast.success("Using previously extracted CV data");
        return extractedData;
      }
    }
    
    // Get document details from database
    const { data: document, error: documentError } = await supabase
      .from('user_documents')
      .select('*')
      .eq('id', documentId)
      .single();
    
    if (documentError || !document) {
      console.error("Error getting document details:", documentError);
      toast.error("Could not find document details. The document may have been deleted.");
      return null;
    }
    
    // Verify the document file exists in storage
    try {
      const { data: fileExists, error: fileCheckError } = await supabase
        .storage
        .from('career-uploads')
        .createSignedUrl(document.filepath, 10); // Short expiry just to check existence
      
      if (fileCheckError || !fileExists) {
        console.error("File does not exist or is inaccessible:", document.filepath, fileCheckError);
        toast.error(`The file "${document.filename}" exists in the database but cannot be accessed in storage. It may have been deleted or corrupted.`);
        return null;
      }
    } catch (fileError) {
      console.error("Error verifying file existence:", fileError);
      toast.error(`Could not verify if "${document.filename}" exists in storage. It may be inaccessible.`);
      return null;
    }
    
    // Call the edge function to extract data
    try {
      const { data, error } = await supabase.functions.invoke('extract-cv-data', {
        body: {
          documentId: documentId
        }
      });
      
      if (error) {
        console.error("Error calling extract-cv-data function:", error);
        toast.error(`Failed to extract data from CV: ${error.message}`);
        return null;
      }
      
      if (!data || !data.success) {
        console.error("API returned error:", data?.error || "Unknown error");
        toast.error(`Failed to extract data: ${data?.error || "Unknown error"}`);
        return null;
      }
      
      console.log("Successfully extracted CV data:", data.extractedData);
      toast.success("Successfully extracted CV data");
      
      return data.extractedData as ExtractedCVData;
    } catch (error: any) {
      console.error("Error in CV extraction:", error);
      toast.error(`Failed to extract data from CV: ${error.message || "Unknown error"}`);
      return null;
    }
  } catch (error: any) {
    console.error("Unexpected error in extractCVData:", error);
    toast.error(`An unexpected error occurred: ${error.message || "Unknown error"}`);
    return null;
  }
}

export async function updateProfileWithCVData(cvData: ExtractedCVData): Promise<boolean> {
  try {
    console.log("Updating profile with extracted CV data:", cvData);
    toast.info("Updating your profile with extracted data...");

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error("You must be logged in to update your profile");
      return false;
    }

    // Start a transaction
    let success = true;

    // Update the profile
    if (cvData.personal_info) {
      try {
        const { error } = await supabase
          .from('profiles')
          .update({
            full_name: cvData.personal_info.full_name,
            bio: cvData.summary,
            location: cvData.personal_info.location,
            website: cvData.personal_info.website,
            updated_at: new Date().toISOString()
          })
          .eq('id', user.id);

        if (error) {
          console.error("Error updating profile:", error);
          success = false;
        }
      } catch (e) {
        console.error("Exception updating profile:", e);
        success = false;
      }
    }

    // Update skills
    if (cvData.skills && cvData.skills.length > 0) {
      try {
        // First delete existing skills
        const { error: deleteError } = await supabase
          .from('user_skills')
          .delete()
          .eq('user_id', user.id);

        if (deleteError) {
          console.error("Error deleting existing skills:", deleteError);
          success = false;
        } else {
          // Insert new skills
          const skillsToInsert = cvData.skills.map(skill => ({
            user_id: user.id,
            name: skill.name,
            level: skill.level || 3, // Default to intermediate
            source: 'cv_extraction'
          }));

          const { error: insertError } = await supabase
            .from('user_skills')
            .insert(skillsToInsert);

          if (insertError) {
            console.error("Error inserting skills:", insertError);
            success = false;
          }
        }
      } catch (e) {
        console.error("Exception updating skills:", e);
        success = false;
      }
    }

    // Update work experience
    if (cvData.work_experience && cvData.work_experience.length > 0) {
      try {
        // Delete existing experience
        const { error: deleteError } = await supabase
          .from('user_experience')
          .delete()
          .eq('user_id', user.id);

        if (deleteError) {
          console.error("Error deleting existing experience:", deleteError);
          success = false;
        } else {
          // Insert new experience
          const experienceToInsert = cvData.work_experience.map(exp => ({
            user_id: user.id,
            company: exp.company,
            role: exp.role,
            start_date: exp.start_date,
            end_date: exp.end_date,
            description: exp.description,
            source: 'cv_extraction'
          }));

          const { error: insertError } = await supabase
            .from('user_experience')
            .insert(experienceToInsert);

          if (insertError) {
            console.error("Error inserting experience:", insertError);
            success = false;
          }
        }
      } catch (e) {
        console.error("Exception updating experience:", e);
        success = false;
      }
    }

    // Update education
    if (cvData.education && cvData.education.length > 0) {
      try {
        // Delete existing education
        const { error: deleteError } = await supabase
          .from('user_education')
          .delete()
          .eq('user_id', user.id);

        if (deleteError) {
          console.error("Error deleting existing education:", deleteError);
          success = false;
        } else {
          // Insert new education
          const educationToInsert = cvData.education.map(edu => ({
            user_id: user.id,
            institution: edu.institution,
            degree: edu.degree,
            start_year: edu.start_year,
            end_year: edu.end_year,
            description: edu.description,
            source: 'cv_extraction'
          }));

          const { error: insertError } = await supabase
            .from('user_education')
            .insert(educationToInsert);

          if (insertError) {
            console.error("Error inserting education:", insertError);
            success = false;
          }
        }
      } catch (e) {
        console.error("Exception updating education:", e);
        success = false;
      }
    }

    // Update languages
    if (cvData.languages && cvData.languages.length > 0) {
      try {
        // Delete existing languages
        const { error: deleteError } = await supabase
          .from('user_languages')
          .delete()
          .eq('user_id', user.id);

        if (deleteError) {
          console.error("Error deleting existing languages:", deleteError);
          success = false;
        } else {
          // Insert new languages
          const languagesToInsert = cvData.languages.map(lang => ({
            user_id: user.id,
            language: lang.language,
            level: lang.level || 'intermediate'
          }));

          const { error: insertError } = await supabase
            .from('user_languages')
            .insert(languagesToInsert);

          if (insertError) {
            console.error("Error inserting languages:", insertError);
            success = false;
          }
        }
      } catch (e) {
        console.error("Exception updating languages:", e);
        success = false;
      }
    }

    // Update certifications
    if (cvData.certifications && cvData.certifications.length > 0) {
      try {
        // Delete existing certifications
        const { error: deleteError } = await supabase
          .from('user_certifications')
          .delete()
          .eq('user_id', user.id);

        if (deleteError) {
          console.error("Error deleting existing certifications:", deleteError);
          success = false;
        } else {
          // Insert new certifications
          const certificationsToInsert = cvData.certifications.map(cert => ({
            user_id: user.id,
            name: cert.name,
            issuer: cert.issuer,
            date: cert.date
          }));

          const { error: insertError } = await supabase
            .from('user_certifications')
            .insert(certificationsToInsert);

          if (insertError) {
            console.error("Error inserting certifications:", insertError);
            success = false;
          }
        }
      } catch (e) {
        console.error("Exception updating certifications:", e);
        success = false;
      }
    }

    if (success) {
      toast.success("Profile updated with CV data successfully");
      return true;
    } else {
      toast.error("Some updates failed. Profile may be partially updated.");
      return false;
    }
  } catch (error: any) {
    console.error("Error updating profile with CV data:", error);
    toast.error(`Failed to update profile: ${error.message || "Unknown error"}`);
    return false;
  }
}

export async function enhanceUserProfile(): Promise<boolean> {
  try {
    toast.info("Enhancing your profile with all available data...");
    
    // Get all documents
    const { data: documents, error: documentsError } = await supabase
      .from('user_documents')
      .select('*')
      .eq('document_type', 'cv');
    
    if (documentsError) {
      console.error("Error fetching CV documents:", documentsError);
      toast.error("Failed to find your CV documents");
      return false;
    }
    
    if (!documents || documents.length === 0) {
      toast.error("No CV documents found to extract data from");
      return false;
    }
    
    console.log(`Found ${documents.length} CV documents to process`);
    toast.info(`Processing ${documents.length} CV documents...`);
    
    // Process all documents
    let successCount = 0;
    for (const doc of documents) {
      try {
        console.log(`Processing document: ${doc.filename}`, doc);
        const cvData = await extractCVData(doc.id);
        
        if (cvData) {
          const success = await updateProfileWithCVData(cvData);
          if (success) successCount++;
        }
      } catch (error) {
        console.error(`Error processing document ${doc.id}:`, error);
      }
    }
    
    if (successCount > 0) {
      toast.success(`Successfully processed ${successCount} out of ${documents.length} CV documents`);
      return true;
    } else {
      toast.error("Failed to extract data from any CV documents");
      return false;
    }
  } catch (error: any) {
    console.error("Error enhancing user profile:", error);
    toast.error(`Failed to enhance profile: ${error.message || "Unknown error"}`);
    return false;
  }
}
