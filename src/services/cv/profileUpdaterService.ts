
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

    // Start a batch of database operations
    const updates: Promise<any>[] = [];

    // 1. Update basic profile information
    if (cvData.fullName || cvData.title || cvData.summary || cvData.contact) {
      console.log("Updating basic profile information");
      const profileUpdateOperation = supabase
        .from('profiles')
        .update({
          full_name: cvData.fullName || undefined,
          role: cvData.title || undefined,
          bio: cvData.summary || undefined,
          location: cvData.contact?.location || undefined,
          website: cvData.contact?.website || undefined,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);
      
      updates.push(Promise.resolve(profileUpdateOperation));
    }

    // 2. Process and store skills
    if (cvData.skills && cvData.skills.length > 0) {
      console.log(`Processing ${cvData.skills.length} skills`);
      
      // First, clear existing skills to avoid duplicates
      const clearSkillsOperation = supabase
        .from('user_skills')
        .delete()
        .eq('user_id', user.id)
        .eq('source', 'cv_extraction');
        
      updates.push(Promise.resolve(clearSkillsOperation));
      
      // Add all skills from the CV
      const skillsData = cvData.skills.map(skill => ({
        user_id: user.id,
        name: skill,
        source: 'cv_extraction',
        // Generate a random skill level between 70-100
        level: Math.floor(Math.random() * 31) + 70
      }));
      
      // Split into batches of 50 to avoid potential request size limits
      for (let i = 0; i < skillsData.length; i += 50) {
        const batch = skillsData.slice(i, i + 50);
        const skillsUpdateOperation = supabase
          .from('user_skills')
          .insert(batch);
        
        updates.push(Promise.resolve(skillsUpdateOperation));
      }
    }

    // 3. Process and store work experience
    if (cvData.experience && cvData.experience.length > 0) {
      console.log(`Processing ${cvData.experience.length} work experiences`);
      
      // Clear existing experience data from CV extraction
      const clearExperienceOperation = supabase
        .from('user_experience')
        .delete()
        .eq('user_id', user.id)
        .eq('source', 'cv_extraction');
        
      updates.push(Promise.resolve(clearExperienceOperation));
      
      // Process each experience entry
      for (const exp of cvData.experience) {
        if (!exp.company || !exp.role) continue;
        
        const experienceEntry = {
          user_id: user.id,
          company: exp.company,
          role: exp.role,
          start_date: exp.start || null,
          end_date: exp.end || null,
          description: exp.description || null,
          source: 'cv_extraction'
        };
        
        const experienceUpdateOperation = supabase
          .from('user_experience')
          .insert([experienceEntry]);
        
        updates.push(Promise.resolve(experienceUpdateOperation));
      }
    }

    // 4. Process and store education
    if (cvData.education && cvData.education.length > 0) {
      console.log(`Processing ${cvData.education.length} education entries`);
      
      // Clear existing education data from CV extraction
      const clearEducationOperation = supabase
        .from('user_education')
        .delete()
        .eq('user_id', user.id)
        .eq('source', 'cv_extraction');
        
      updates.push(Promise.resolve(clearEducationOperation));
      
      // Process each education entry
      for (const edu of cvData.education) {
        if (!edu.school || !edu.degree) continue;
        
        const educationEntry = {
          user_id: user.id,
          institution: edu.school,
          degree: edu.degree,
          start_year: edu.start || null,
          end_year: edu.end || null,
          description: edu.description || null,
          source: 'cv_extraction'
        };
        
        const educationUpdateOperation = supabase
          .from('user_education')
          .insert([educationEntry]);
        
        updates.push(Promise.resolve(educationUpdateOperation));
      }
    }

    // 5. Process and store languages
    if (cvData.languages && cvData.languages.length > 0) {
      console.log(`Processing ${cvData.languages.length} languages`);
      
      // Clear existing language data
      const clearLanguagesOperation = supabase
        .from('user_languages')
        .delete()
        .eq('user_id', user.id);
        
      updates.push(Promise.resolve(clearLanguagesOperation));
      
      // Add all languages from the CV
      const languagesData = cvData.languages.map(lang => ({
        user_id: user.id,
        language: lang.language || '',
        level: lang.proficiency || 'Intermediate'
      }));
      
      const languagesUpdateOperation = supabase
        .from('user_languages')
        .insert(languagesData);
      
      updates.push(Promise.resolve(languagesUpdateOperation));
    }

    // 6. Process and store certifications
    if (cvData.certifications && cvData.certifications.length > 0) {
      console.log(`Processing ${cvData.certifications.length} certifications`);
      
      // Clear existing certifications
      const clearCertificationsOperation = supabase
        .from('user_certifications')
        .delete()
        .eq('user_id', user.id);
        
      updates.push(Promise.resolve(clearCertificationsOperation));
      
      // Process each certification
      for (const cert of cvData.certifications) {
        if (!cert.name) continue;
        
        const certEntry = {
          user_id: user.id,
          name: cert.name,
          issuer: cert.issuer || null,
          date: cert.date || null
        };
        
        const certUpdateOperation = supabase
          .from('user_certifications')
          .insert([certEntry]);
        
        updates.push(Promise.resolve(certUpdateOperation));
      }
    }

    // Execute all updates and wait for them to complete
    if (updates.length > 0) {
      console.log(`Executing ${updates.length} database operations`);
      const results = await Promise.all(updates);
      
      // Check for errors
      const errors = results.filter(result => result.error);
      if (errors.length > 0) {
        console.error("Errors updating profile data:", errors.map(e => e.error));
        return false;
      }
      
      console.log("Successfully updated profile with CV data");
      return true;
    } else {
      console.log("No updates to make from CV data");
      return true;
    }
  } catch (error) {
    console.error('Error in updateProfileWithCVData:', error);
    return false;
  }
};
