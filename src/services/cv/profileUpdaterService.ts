
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';
import type { ExtractedCVData } from './types';

/**
 * Updates the user's profile with CV data
 */
export const updateProfileWithCVData = async (cvData: ExtractedCVData): Promise<boolean> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error("You must be logged in to update your profile");
      return false;
    }

    console.log("Updating profile with extracted CV data");

    // 1. Update basic profile information
    if (cvData.personal_info?.full_name || 
        cvData.personal_info?.location || 
        cvData.summary || 
        cvData.personal_info?.website) {
      
      console.log("Updating basic profile information");
      
      const profileUpdate: Record<string, any> = {
        updated_at: new Date().toISOString()
      };
      
      if (cvData.personal_info?.full_name) {
        profileUpdate.full_name = cvData.personal_info.full_name;
      }
      
      if (cvData.personal_info?.location) {
        profileUpdate.location = cvData.personal_info.location;
      }
      
      if (cvData.summary) {
        profileUpdate.bio = cvData.summary;
      }
      
      if (cvData.personal_info?.website) {
        profileUpdate.website = cvData.personal_info.website;
      }
      
      const { error: profileError } = await supabase
        .from('profiles')
        .update(profileUpdate)
        .eq('id', user.id);
        
      if (profileError) {
        console.error("Error updating profile:", profileError);
      }
    }

    // 2. Process and store skills
    if (cvData.skills && cvData.skills.length > 0) {
      console.log(`Processing ${cvData.skills.length} skills`);
      
      // First, clear existing skills
      const { error: clearSkillsError } = await supabase
        .from('user_skills')
        .delete()
        .eq('user_id', user.id)
        .eq('source', 'cv_extraction');
        
      if (clearSkillsError) {
        console.error("Error clearing existing skills:", clearSkillsError);
      }
      
      // Add all skills from the CV
      const skillsData = cvData.skills.map(skill => ({
        user_id: user.id,
        name: skill.name,
        source: 'cv_extraction',
        level: skill.level || Math.floor(Math.random() * 31) + 70 // Generate a random skill level if not provided
      }));
      
      // Split into batches of 50 to avoid potential request size limits
      for (let i = 0; i < skillsData.length; i += 50) {
        const batch = skillsData.slice(i, i + 50);
        const { error: skillsError } = await supabase
          .from('user_skills')
          .insert(batch);
          
        if (skillsError) {
          console.error("Error inserting skills batch:", skillsError);
        }
      }
    }

    // 3. Process and store work experience
    if (cvData.work_experience && cvData.work_experience.length > 0) {
      console.log(`Processing ${cvData.work_experience.length} work experiences`);
      
      // Clear existing experience data from CV extraction
      const { error: clearExperienceError } = await supabase
        .from('user_experience')
        .delete()
        .eq('user_id', user.id)
        .eq('source', 'cv_extraction');
        
      if (clearExperienceError) {
        console.error("Error clearing existing experience:", clearExperienceError);
      }
      
      // Process each experience entry
      for (const exp of cvData.work_experience) {
        if (!exp.company || !exp.role) continue;
        
        const experienceEntry = {
          user_id: user.id,
          company: exp.company,
          role: exp.role,
          start_date: exp.start_date || null,
          end_date: exp.end_date || null,
          description: exp.description || null,
          source: 'cv_extraction'
        };
        
        const { error: experienceError } = await supabase
          .from('user_experience')
          .insert([experienceEntry]);
          
        if (experienceError) {
          console.error("Error inserting experience entry:", experienceError);
        }
      }
    }

    // 4. Process and store education
    if (cvData.education && cvData.education.length > 0) {
      console.log(`Processing ${cvData.education.length} education entries`);
      
      // Clear existing education data from CV extraction
      const { error: clearEducationError } = await supabase
        .from('user_education')
        .delete()
        .eq('user_id', user.id)
        .eq('source', 'cv_extraction');
        
      if (clearEducationError) {
        console.error("Error clearing existing education:", clearEducationError);
      }
      
      // Process each education entry
      for (const edu of cvData.education) {
        if (!edu.institution || !edu.degree) continue;
        
        const educationEntry = {
          user_id: user.id,
          institution: edu.institution,
          degree: edu.degree,
          start_year: edu.start_year || null,
          end_year: edu.end_year || null,
          description: edu.description || null,
          source: 'cv_extraction'
        };
        
        const { error: educationError } = await supabase
          .from('user_education')
          .insert([educationEntry]);
          
        if (educationError) {
          console.error("Error inserting education entry:", educationError);
        }
      }
    }

    // 5. Process and store languages
    if (cvData.languages && cvData.languages.length > 0) {
      console.log(`Processing ${cvData.languages.length} languages`);
      
      // Clear existing language data
      const { error: clearLanguagesError } = await supabase
        .from('user_languages')
        .delete()
        .eq('user_id', user.id);
        
      if (clearLanguagesError) {
        console.error("Error clearing existing languages:", clearLanguagesError);
      }
      
      // Add all languages from the CV
      const languagesData = cvData.languages.map(lang => ({
        user_id: user.id,
        language: lang.language || '',
        level: lang.level || 'Intermediate'
      }));
      
      const { error: languagesError } = await supabase
        .from('user_languages')
        .insert(languagesData);
        
      if (languagesError) {
        console.error("Error inserting languages:", languagesError);
      }
    }

    // 6. Process and store certifications
    if (cvData.certifications && cvData.certifications.length > 0) {
      console.log(`Processing ${cvData.certifications.length} certifications`);
      
      // Clear existing certifications
      const { error: clearCertificationsError } = await supabase
        .from('user_certifications')
        .delete()
        .eq('user_id', user.id);
        
      if (clearCertificationsError) {
        console.error("Error clearing existing certifications:", clearCertificationsError);
      }
      
      // Process each certification
      for (const cert of cvData.certifications) {
        if (!cert.name) continue;
        
        const certEntry = {
          user_id: user.id,
          name: cert.name,
          issuer: cert.issuer || null,
          date: cert.date || null
        };
        
        const { error: certError } = await supabase
          .from('user_certifications')
          .insert([certEntry]);
          
        if (certError) {
          console.error("Error inserting certification entry:", certError);
        }
      }
    }

    console.log("Successfully updated profile with CV data");
    return true;
  } catch (error) {
    console.error('Error in updateProfileWithCVData:', error);
    return false;
  }
};
