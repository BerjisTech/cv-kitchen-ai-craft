import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';
import type { ExtractedCVData, ProfileData } from './cv/types';

/**
 * Extracts data from a CV document using the Supabase Edge Function
 */
export async function extractCVData(documentId: string): Promise<ExtractedCVData | null> {
  try {
    // First check if we already have extracted data for this document
    let existingData = null;
    let existingError = null;
    
    try {
      // Changed from maybeSingle() to eq() + limit(1) to avoid multiple rows error
      const { data, error } = await supabase
        .from('cv_extracted_data')
        .select('extracted_data')
        .eq('document_id', documentId)
        .limit(1)
        .single();
      
      existingData = data;
      existingError = error;
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
      // We need to safely cast the JSON data to our ProfileData type
      const extractedData = existingData.extracted_data as unknown as ExtractedCVData;
      
      if (extractedData.summary && (
          extractedData.summary.includes('placeholder') || 
          extractedData.summary.includes('could not be processed')
        )) {
        // This is placeholder data, we should re-extract
        console.log("Found placeholder data, re-extracting");
      } else {
        // Use cached data
        console.log("Using cached CV extracted data");
        return extractedData;
      }
    }
    
    // Get the document details to pass to the function
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
    
    // Get the user ID to pass to the function
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      console.error("Error getting current user:", userError);
      toast.error("Could not identify the current user");
      return null;
    }
    
    // Call the extract-cv-data function with the document details and user ID
    toast.info(`Extracting data from "${document.filename}"...`, { duration: 5000 });
    
    try {
      const { data, error } = await supabase.functions.invoke('extract-cv-data', {
        body: {
          documentId,
          userId: user.id
        }
      });
      
      if (error) {
        console.error("Error calling extract-cv-data function:", error);
        
        // Provide more detailed error information
        let errorDetails = "Unknown error";
        if (error.message) errorDetails = error.message;
        
        toast.error(`Failed to extract data: ${errorDetails}`, { duration: 5000 });
        return null;
      }
      
      if (!data || data.error) {
        console.error("Function returned an error:", data?.error || "Unknown error");
        
        // Provide more context in the error message
        const errorMessage = data?.error || "Unknown processing error";
        toast.error(`Document processing failed: ${errorMessage}`, { duration: 5000 });
        return null;
      }
      
      toast.success(`Successfully extracted data from "${document.filename}"`, { duration: 3000 });
      
      // Cast the response data to our ExtractedCVData type
      return data as unknown as ExtractedCVData;
    } catch (functionError: any) {
      console.error("Error in extractCVData function call:", functionError);
      let errorMessage = "Failed to process document.";
      
      // Add more detailed error information
      if (functionError.message) {
        errorMessage += ` Details: ${functionError.message}`;
        console.error("Error message:", functionError.message);
      }
      
      if (functionError.response) {
        console.error("Function response object:", functionError.response);
        try {
          const responseStatus = functionError.response.status;
          const responseBody = await functionError.response.text();
          console.error(`Function response status: ${responseStatus}`);
          console.error("Function response body:", responseBody);
          
          // Try to parse as JSON for more details
          try {
            const responseJson = JSON.parse(responseBody);
            if (responseJson.error) {
              errorMessage = `Error: ${responseJson.error}`;
              if (responseJson.details) {
                errorMessage += ` (${responseJson.details})`;
              }
              console.error("Parsed error details:", responseJson);
            }
          } catch (e) {
            // Not JSON, use the text
            if (responseBody && responseBody.length < 100) {
              errorMessage += ` Server response: ${responseBody}`;
            }
          }
        } catch (e) {
          // Ignore errors reading response
          console.error("Error parsing response:", e);
        }
      }
      
      toast.error(errorMessage, { duration: 5000 });
      return null;
    }
  } catch (error: any) {
    console.error("Error in extractCVData:", error);
    toast.error(`Failed to process document: ${error.message || "Unknown error"}`, { duration: 5000 });
    return null;
  }
}

/**
 * Enhances user profile with data from their CVs
 */
export async function enhanceUserProfile(): Promise<boolean> {
  try {
    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      console.error("Error getting current user:", userError);
      toast.error("Could not identify the current user");
      return false;
    }
    
    toast.info("Enhancing your profile with CV data...", { duration: 5000 });
    
    try {
      // Call the extract-cv-data function with the enhance parameter and user ID
      const { data, error } = await supabase.functions.invoke('extract-cv-data', {
        body: {
          userId: user.id,
          enhanceProfile: true
        }
      });
      
      if (error) {
        // Provide more detailed error information
        let errorDetails = "Unknown error";
        if (error.message) errorDetails = error.message;
        
        console.error("Error enhancing profile:", error);
        console.error("Error details:", errorDetails);
        
        toast.error(`Failed to enhance profile: ${errorDetails}`, { duration: 5000 });
        return false;
      }
      
      if (!data || data.error) {
        const errorMessage = data?.error || "Unknown processing error";
        console.error("Profile enhancement returned an error:", errorMessage);
        
        toast.error(`Profile enhancement failed: ${errorMessage}`, { duration: 5000 });
        return false;
      }
      
      toast.success("Successfully enhanced your profile with CV data", { duration: 3000 });
      return true;
    } catch (functionError: any) {
      // Extract and log detailed information about the error
      console.error("Error calling extract-cv-data function for profile enhancement:", functionError);
      
      let errorMessage = "Failed to enhance profile.";
      
      if (functionError.message) {
        errorMessage += ` Details: ${functionError.message}`;
        console.error("Error message:", functionError.message);
      }
      
      // Try to extract response data if available
      if (functionError.response) {
        console.error("Error response object:", functionError.response);
        try {
          const responseStatus = functionError.response.status;
          const responseBody = await functionError.response.text();
          console.error(`Error response status: ${responseStatus}`);
          console.error("Error response body:", responseBody);
          
          try {
            const responseJson = JSON.parse(responseBody);
            if (responseJson.error) {
              errorMessage = `Error: ${responseJson.error}`;
              if (responseJson.details) {
                errorMessage += ` (${responseJson.details})`;
              }
              console.error("Parsed error details:", responseJson);
            }
          } catch (e) {
            // Not JSON
            if (responseBody && responseBody.length < 100) {
              errorMessage += ` Server response: ${responseBody}`;
            }
          }
        } catch (e) {
          // Ignore errors reading response
          console.error("Error parsing response:", e);
        }
      }
      
      toast.error(errorMessage, { duration: 5000 });
      return false;
    }
  } catch (error: any) {
    console.error("Error in enhanceUserProfile:", error);
    toast.error(`Failed to enhance profile: ${error.message || "Unknown error"}`, { duration: 5000 });
    return false;
  }
}

/**
 * Gets CV context for job analysis
 */
export async function getAllCVContext(): Promise<string> {
  try {
    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      console.error("Error getting current user:", userError);
      return "";
    }
    
    // Get the user's CV data from extracted_data
    // Changed to use order() and limit() instead of maybeSingle() to avoid the error
    const { data: cvData, error: cvError } = await supabase
      .from('cv_extracted_data')
      .select('extracted_data')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1);
    
    if (cvError || !cvData || cvData.length === 0) {
      console.log("No CV data found for context");
      return "";
    }
    
    // Format the CV data into context
    const extractedData = cvData[0].extracted_data as any;
    let context = "";
    
    // Personal info
    if (extractedData.personal_info) {
      context += "Personal Info:\n";
      if (extractedData.personal_info.full_name) context += `Name: ${extractedData.personal_info.full_name}\n`;
      if (extractedData.personal_info.location) context += `Location: ${extractedData.personal_info.location}\n`;
      context += "\n";
    }
    
    // Summary
    if (extractedData.summary) {
      context += "Summary:\n";
      context += extractedData.summary + "\n\n";
    }
    
    // Skills
    if (extractedData.skills && extractedData.skills.length > 0) {
      context += "Skills:\n";
      context += extractedData.skills.map((skill: any) => skill.name).join(", ") + "\n\n";
    }
    
    // Work experience
    if (extractedData.work_experience && extractedData.work_experience.length > 0) {
      context += "Work Experience:\n";
      extractedData.work_experience.forEach((exp: any) => {
        context += `${exp.role} at ${exp.company}`;
        if (exp.start_date) context += ` (${exp.start_date} - ${exp.end_date || 'Present'})`;
        context += "\n";
        if (exp.description) context += exp.description + "\n";
        context += "\n";
      });
    }
    
    // Education
    if (extractedData.education && extractedData.education.length > 0) {
      context += "Education:\n";
      extractedData.education.forEach((edu: any) => {
        context += `${edu.degree} at ${edu.institution}`;
        if (edu.start_year) context += ` (${edu.start_year} - ${edu.end_year || 'Present'})`;
        context += "\n";
        if (edu.description) context += edu.description + "\n";
        context += "\n";
      });
    }
    
    return context;
  } catch (error) {
    console.error("Error getting CV context:", error);
    return "";
  }
}

/**
 * Updates user profile with CV data
 */
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
