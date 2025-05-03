
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';
import { ExtractedCVData } from './types';

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
      
      // First, fetch existing skills to avoid duplicates
      const { data: existingSkills } = await supabase
        .from('user_skills')
        .select('name')
        .eq('user_id', user.id);
      
      const existingSkillNames = existingSkills ? existingSkills.map(skill => skill.name.toLowerCase()) : [];
      
      // Filter out skills that already exist
      const newSkills = cvData.skills.filter(skill => 
        skill && !existingSkillNames.includes(skill.toLowerCase())
      );
      
      if (newSkills.length > 0) {
        const skillsData = newSkills.map(skill => ({
          user_id: user.id,
          name: skill,
          source: 'cv_extraction',
          // Generate a random skill level between 70-100
          level: Math.floor(Math.random() * 31) + 70
        }));
        
        const skillsUpdateOperation = supabase
          .from('user_skills')
          .insert(skillsData);
        
        updates.push(Promise.resolve(skillsUpdateOperation));
      }
    }

    // 3. Process and store work experience
    if (cvData.experience && cvData.experience.length > 0) {
      console.log(`Processing ${cvData.experience.length} work experiences`);
      
      // Fetch existing experience to avoid duplicates
      const { data: existingExperiences } = await supabase
        .from('user_experience')
        .select('company, role, start_date')
        .eq('user_id', user.id);
      
      // Create a function to check if an experience already exists
      const experienceExists = (exp: any) => {
        return existingExperiences ? existingExperiences.some(existing => 
          existing.company === exp.company && 
          existing.role === exp.role &&
          existing.start_date === exp.start_date
        ) : false;
      };
      
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
        
        // Only add if it doesn't exist
        if (!experienceExists(experienceEntry)) {
          const experienceUpdateOperation = supabase
            .from('user_experience')
            .insert([experienceEntry]);
          
          updates.push(Promise.resolve(experienceUpdateOperation));
        }
      }
    }

    // 4. Process and store education
    if (cvData.education && cvData.education.length > 0) {
      console.log(`Processing ${cvData.education.length} education entries`);
      
      // Fetch existing education to avoid duplicates
      const { data: existingEducation } = await supabase
        .from('user_education')
        .select('institution, degree, start_year')
        .eq('user_id', user.id);
      
      // Create a function to check if an education entry already exists
      const educationExists = (edu: any) => {
        return existingEducation ? existingEducation.some(existing => 
          existing.institution === edu.institution && 
          existing.degree === edu.degree
        ) : false;
      };
      
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
        
        // Only add if it doesn't exist
        if (!educationExists(educationEntry)) {
          const educationUpdateOperation = supabase
            .from('user_education')
            .insert([educationEntry]);
          
          updates.push(Promise.resolve(educationUpdateOperation));
        }
      }
    }

    // 5. Process and store languages
    if (cvData.languages && cvData.languages.length > 0) {
      console.log(`Processing ${cvData.languages.length} languages`);
      
      // Fetch existing languages to avoid duplicates
      const { data: existingLanguages } = await supabase
        .from('user_languages')
        .select('language')
        .eq('user_id', user.id);
      
      const existingLanguageNames = existingLanguages ? existingLanguages.map(lang => lang.language.toLowerCase()) : [];
      
      // Filter out languages that already exist
      const newLanguages = cvData.languages.filter(lang => 
        lang.language && !existingLanguageNames.includes(lang.language.toLowerCase())
      );
      
      if (newLanguages.length > 0) {
        const languagesData = newLanguages.map(lang => ({
          user_id: user.id,
          language: lang.language || '',
          level: lang.proficiency || 'Intermediate'
        }));
        
        const languagesUpdateOperation = supabase
          .from('user_languages')
          .insert(languagesData);
        
        updates.push(Promise.resolve(languagesUpdateOperation));
      }
    }

    // 6. Process and store certifications
    if (cvData.certifications && cvData.certifications.length > 0) {
      console.log(`Processing ${cvData.certifications.length} certifications`);
      
      // Fetch existing certifications to avoid duplicates
      const { data: existingCertifications } = await supabase
        .from('user_certifications')
        .select('name, issuer')
        .eq('user_id', user.id);
      
      // Create a function to check if a certification already exists
      const certificationExists = (cert: any) => {
        return existingCertifications ? existingCertifications.some(existing => 
          existing.name === cert.name && 
          existing.issuer === cert.issuer
        ) : false;
      };
      
      // Process each certification
      for (const cert of cvData.certifications) {
        if (!cert.name) continue;
        
        const certEntry = {
          user_id: user.id,
          name: cert.name,
          issuer: cert.issuer || null,
          date: cert.date || null
        };
        
        // Only add if it doesn't exist
        if (!certificationExists(certEntry)) {
          const certUpdateOperation = supabase
            .from('user_certifications')
            .insert([certEntry]);
          
          updates.push(Promise.resolve(certUpdateOperation));
        }
      }
    }

    // Execute all updates and wait for them to complete
    if (updates.length > 0) {
      const results = await Promise.all(updates);
      
      // Check for errors
      for (const result of results) {
        if (result.error) {
          console.error("Error updating profile data:", result.error);
          return false;
        }
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
