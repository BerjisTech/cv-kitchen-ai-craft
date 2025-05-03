
import { supabase } from "@/integrations/supabase/client";
import { UserDocument } from "./documentService";
import { toast } from "@/components/ui/sonner";
import { CVData } from "@/types/CVData";
import { ProfileData, updateProfile } from "./profileService";

/**
 * Extract CV data from uploaded documents and LinkedIn data
 */
export async function extractCVData(documentId: string): Promise<Partial<CVData> | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      toast.error("You must be logged in to extract CV data");
      return null;
    }
    
    toast.info("Extracting data from your CV...");
    
    // Call the edge function to extract CV data
    const { data, error } = await supabase.functions.invoke('extract-cv-data', {
      body: {
        documentId,
        userId: user.id
      }
    });
    
    if (error) {
      console.error("Error extracting CV data:", error);
      toast.error("Failed to extract data from CV");
      return null;
    }
    
    if (!data) {
      toast.error("No data could be extracted from the CV");
      return null;
    }
    
    console.log("Successfully extracted CV data:", data);
    toast.success("Successfully extracted data from your CV");
    return data as Partial<CVData>;
  } catch (error) {
    console.error("Error in extractCVData:", error);
    toast.error("Failed to extract data from CV");
    return null;
  }
}

/**
 * Update user profile with data extracted from CV
 */
export async function updateProfileWithCVData(cvData: Partial<CVData>): Promise<boolean> {
  try {
    if (!cvData) return false;
    
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      toast.error("You must be logged in to update your profile");
      return false;
    }
    
    console.log("Updating profile with CV data:", cvData);
    
    // Convert CV data to profile format
    const profileUpdates: Partial<ProfileData> = {
      full_name: cvData.fullName,
      role: cvData.title,
      bio: cvData.summary,
      location: cvData.contact?.location
    };
    
    if (cvData.contact?.email) {
      profileUpdates.email = cvData.contact.email;
    }
    
    if (cvData.contact?.phone) {
      profileUpdates.phone = cvData.contact.phone;
    }
    
    // Update the user's profile with the extracted data
    try {
      await updateProfile(profileUpdates);
      toast.success("Profile updated with CV data");
      
      // Save extracted skills, experience, and education data to specific tables for later use
      await saveExtractedCVDetailsData(user.id, cvData);
      
      return true;
    } catch (error) {
      console.error("Error updating profile with CV data:", error);
      toast.error("Failed to update profile with CV data");
      return false;
    }
  } catch (error) {
    console.error("Error in updateProfileWithCVData:", error);
    toast.error("Failed to update profile with CV data");
    return false;
  }
}

/**
 * Save extracted skills, experience and education data to database
 */
async function saveExtractedCVDetailsData(userId: string, cvData: Partial<CVData>): Promise<void> {
  try {
    console.log("Saving extracted CV details to database:", cvData);
    
    // Save skills
    if (cvData.skills && cvData.skills.length > 0) {
      console.log("Saving skills:", cvData.skills);
      
      // Delete existing skills from CV extraction to avoid duplicates
      await supabase
        .from('user_skills')
        .delete()
        .eq('user_id', userId)
        .eq('source', 'cv_extract');
      
      // Batch insert all skills
      const skillsToInsert = cvData.skills.map(skill => ({
        user_id: userId,
        name: skill,
        source: 'cv_extract'
      }));
      
      const { error: skillsError } = await supabase
        .from('user_skills')
        .insert(skillsToInsert);
        
      if (skillsError) {
        console.error("Error saving skills:", skillsError);
      } else {
        console.log(`Saved ${cvData.skills.length} skills to database`);
      }
    }
    
    // Save experience entries
    if (cvData.experience && cvData.experience.length > 0) {
      console.log("Saving experience:", cvData.experience);
      
      // Delete existing experience from CV extraction to avoid duplicates
      await supabase
        .from('user_experience')
        .delete()
        .eq('user_id', userId)
        .eq('source', 'cv_extract');
      
      // Batch insert all experience entries
      const experienceToInsert = cvData.experience.map(exp => ({
        user_id: userId,
        company: exp.company,
        role: exp.role,
        start_date: exp.start,
        end_date: exp.end === 'Present' ? null : exp.end,
        description: exp.description || '',
        source: 'cv_extract'
      }));
      
      const { error: expError } = await supabase
        .from('user_experience')
        .insert(experienceToInsert);
        
      if (expError) {
        console.error("Error saving experience:", expError);
      } else {
        console.log(`Saved ${cvData.experience.length} experience entries to database`);
      }
    }
    
    // Save education entries
    if (cvData.education && cvData.education.length > 0) {
      console.log("Saving education:", cvData.education);
      
      // Delete existing education from CV extraction to avoid duplicates
      await supabase
        .from('user_education')
        .delete()
        .eq('user_id', userId)
        .eq('source', 'cv_extract');
      
      // Batch insert all education entries
      const educationToInsert = cvData.education.map(edu => ({
        user_id: userId,
        institution: edu.school,
        degree: edu.degree,
        start_year: edu.start,
        end_year: edu.end === 'Present' ? null : edu.end,
        description: edu.description || '',
        source: 'cv_extract'
      }));
      
      const { error: eduError } = await supabase
        .from('user_education')
        .insert(educationToInsert);
        
      if (eduError) {
        console.error("Error saving education:", eduError);
      } else {
        console.log(`Saved ${cvData.education.length} education entries to database`);
      }
    }
    
    // Save languages
    if (cvData.languages && cvData.languages.length > 0) {
      console.log("Saving languages:", cvData.languages);
      
      // Delete existing languages from CV extraction to avoid duplicates
      await supabase
        .from('user_languages')
        .delete()
        .eq('user_id', userId);
      
      // Batch insert all languages
      const languagesToInsert = cvData.languages.map(lang => ({
        user_id: userId,
        language: lang.language,
        level: lang.proficiency || 'Conversational'
      }));
      
      const { error: langError } = await supabase
        .from('user_languages')
        .insert(languagesToInsert);
        
      if (langError) {
        console.error("Error saving languages:", langError);
      } else {
        console.log(`Saved ${cvData.languages.length} languages to database`);
      }
    }
    
    // Save certifications
    if (cvData.certifications && cvData.certifications.length > 0) {
      console.log("Saving certifications:", cvData.certifications);
      
      // Delete existing certifications from CV extraction to avoid duplicates
      await supabase
        .from('user_certifications')
        .delete()
        .eq('user_id', userId);
      
      // Batch insert all certifications
      const certificationsToInsert = cvData.certifications.map(cert => ({
        user_id: userId,
        name: cert.name,
        issuer: cert.issuer || '',
        date: cert.date || ''
      }));
      
      const { error: certError } = await supabase
        .from('user_certifications')
        .insert(certificationsToInsert);
        
      if (certError) {
        console.error("Error saving certifications:", certError);
      } else {
        console.log(`Saved ${cvData.certifications.length} certifications to database`);
      }
    }
    
  } catch (error) {
    console.error("Error saving detailed CV data:", error);
    // Don't throw, just log the error
  }
}

/**
 * Get all CV context for AI generation
 */
export async function getAllCVContext(): Promise<{
  cvDocuments: UserDocument[],
  linkedInData: any,
  profileData: ProfileData | null,
  extractedCVData: any[]
} | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return null;
    
    // Get all CV documents
    const { data: documents, error: documentsError } = await supabase
      .from('user_documents')
      .select('*')
      .eq('user_id', user.id)
      .eq('document_type', 'cv');
      
    if (documentsError) {
      console.error("Error fetching CV documents:", documentsError);
      return null;
    }
    
    // Get LinkedIn data if available
    const { data: linkedInData, error: linkedInError } = await supabase
      .from('linkedin_profiles')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();
      
    if (linkedInError && linkedInError.code !== 'PGRST116') {
      console.error("Error fetching LinkedIn data:", linkedInError);
    }
    
    // Get profile data
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();
      
    if (profileError) {
      console.error("Error fetching profile data:", profileError);
    }
    
    // Get extracted CV data
    const { data: extractedData, error: extractedError } = await supabase
      .from('cv_extracted_data')
      .select('*')
      .eq('user_id', user.id);
      
    if (extractedError) {
      console.error("Error fetching extracted CV data:", extractedError);
    }
    
    // Get skills data
    const { data: skillsData, error: skillsError } = await supabase
      .from('user_skills')
      .select('*')
      .eq('user_id', user.id);
      
    if (skillsError) {
      console.error("Error fetching user skills:", skillsError);
    }
    
    // Get experience data
    const { data: experienceData, error: experienceError } = await supabase
      .from('user_experience')
      .select('*')
      .eq('user_id', user.id)
      .order('start_date', { ascending: false });
      
    if (experienceError) {
      console.error("Error fetching user experience:", experienceError);
    }
    
    // Get education data
    const { data: educationData, error: educationError } = await supabase
      .from('user_education')
      .select('*')
      .eq('user_id', user.id)
      .order('start_year', { ascending: false });
      
    if (educationError) {
      console.error("Error fetching user education:", educationError);
    }
    
    // Convert document_type to the expected type
    const typedDocuments = documents ? documents.map(doc => ({
      ...doc,
      document_type: doc.document_type as 'cv' | 'portfolio' | 'certificate' | 'other'
    })) as UserDocument[] : [];
    
    // Combine all user data
    const enrichedProfileData = profileData ? {
      ...profileData,
      skills: skillsData || [],
      experience: experienceData || [],
      education: educationData || []
    } : null;
    
    return {
      cvDocuments: typedDocuments,
      linkedInData: linkedInData || null,
      profileData: enrichedProfileData as ProfileData | null,
      extractedCVData: extractedData || []
    };
  } catch (error) {
    console.error("Error gathering CV context:", error);
    return null;
  }
}

/**
 * Get user's comprehensive profile data from all sources
 */
export async function getComprehensiveUserData(): Promise<any> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return null;
  
  // Get basic profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();
    
  // Get skills
  const { data: skills } = await supabase
    .from('user_skills')
    .select('*')
    .eq('user_id', user.id);
    
  // Get experience
  const { data: experience } = await supabase
    .from('user_experience')
    .select('*')
    .eq('user_id', user.id)
    .order('start_date', { ascending: false });
    
  // Get education
  const { data: education } = await supabase
    .from('user_education')
    .select('*')
    .eq('user_id', user.id)
    .order('start_year', { ascending: false });
    
  // Get LinkedIn data
  const { data: linkedin } = await supabase
    .from('linkedin_profiles')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle();
    
  return {
    profile,
    skills,
    experience,
    education,
    linkedin
  };
}
