import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';

interface ExtractedCVData {
  fullName?: string;
  title?: string;
  contact?: {
    email?: string;
    phone?: string;
    location?: string;
    website?: string;
    linkedin?: string;
    github?: string;
  };
  summary?: string;
  skills?: string[];
  experience?: Array<{
    company?: string;
    role?: string;
    start?: string;
    end?: string | null;
    description?: string;
  }>;
  education?: Array<{
    school?: string;
    degree?: string;
    start?: string;
    end?: string | null;
    description?: string;
  }>;
  languages?: Array<{
    language?: string;
    proficiency?: string;
  }>;
  certifications?: Array<{
    name?: string;
    issuer?: string;
    date?: string;
  }>;
}

// Function to provide CV context data for job analysis
export const getAllCVContext = async (): Promise<string> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.log("User not authenticated, cannot get CV context");
      return "";
    }

    let contextData = "";

    // 1. Get basic profile info
    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    
    if (profileData) {
      contextData += `Name: ${profileData.full_name || 'Not specified'}\n`;
      contextData += `Role: ${profileData.role || 'Not specified'}\n`;
      contextData += `Bio: ${profileData.bio || 'Not specified'}\n\n`;
    }

    // 2. Get skills
    const { data: skills } = await supabase
      .from('user_skills')
      .select('*')
      .eq('user_id', user.id);
    
    if (skills && skills.length > 0) {
      contextData += "Skills:\n";
      skills.forEach((skill) => {
        contextData += `- ${skill.name}\n`;
      });
      contextData += "\n";
    }

    // 3. Get work experience
    const { data: experiences } = await supabase
      .from('user_experience')
      .select('*')
      .eq('user_id', user.id)
      .order('start_date', { ascending: false });
    
    if (experiences && experiences.length > 0) {
      contextData += "Work Experience:\n";
      experiences.forEach((exp) => {
        contextData += `- ${exp.role} at ${exp.company} (${exp.start_date || ''} to ${exp.end_date || 'Present'})\n`;
        if (exp.description) {
          contextData += `  ${exp.description}\n`;
        }
      });
      contextData += "\n";
    }

    // 4. Get education
    const { data: education } = await supabase
      .from('user_education')
      .select('*')
      .eq('user_id', user.id)
      .order('start_year', { ascending: false });
    
    if (education && education.length > 0) {
      contextData += "Education:\n";
      education.forEach((edu) => {
        contextData += `- ${edu.degree} from ${edu.institution} (${edu.start_year || ''} to ${edu.end_year || 'Present'})\n`;
        if (edu.description) {
          contextData += `  ${edu.description}\n`;
        }
      });
      contextData += "\n";
    }

    // 5. Get languages
    const { data: languages } = await supabase
      .from('user_languages')
      .select('*')
      .eq('user_id', user.id);
    
    if (languages && languages.length > 0) {
      contextData += "Languages:\n";
      languages.forEach((lang) => {
        contextData += `- ${lang.language}: ${lang.level}\n`;
      });
      contextData += "\n";
    }

    // 6. Get certifications
    const { data: certifications } = await supabase
      .from('user_certifications')
      .select('*')
      .eq('user_id', user.id);
    
    if (certifications && certifications.length > 0) {
      contextData += "Certifications:\n";
      certifications.forEach((cert) => {
        contextData += `- ${cert.name} from ${cert.issuer || 'N/A'} (${cert.date || 'N/A'})\n`;
      });
    }

    return contextData;
  } catch (error) {
    console.error('Error in getAllCVContext:', error);
    return "";
  }
};

export const extractCVData = async (documentId: string): Promise<ExtractedCVData | null> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error("You must be logged in to extract CV data");
      return null;
    }

    console.log(`Extracting data from CV document ${documentId} for user ${user.id}`);
    
    // Call the Edge Function to extract data from the CV
    const { data, error } = await supabase.functions.invoke('extract-cv-data', {
      body: { documentId, userId: user.id },
    });

    if (error) {
      console.error("Error calling extract-cv-data function:", error);
      throw new Error(`Failed to extract data: ${error.message}`);
    }

    console.log("Extracted CV data:", data);
    return data;
  } catch (error) {
    console.error('Error in extractCVData:', error);
    throw error;
  }
};

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
      
      const profileUpdatePromise = new Promise((resolve) => {
        profileUpdateOperation.then(response => resolve(response));
      });
      
      updates.push(profileUpdatePromise);
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
        
        const skillsUpdatePromise = new Promise((resolve) => {
          skillsUpdateOperation.then(response => resolve(response));
        });
        
        updates.push(skillsUpdatePromise);
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
          
          const experienceUpdatePromise = new Promise((resolve) => {
            experienceUpdateOperation.then(response => resolve(response));
          });
          
          updates.push(experienceUpdatePromise);
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
          
          const educationUpdatePromise = new Promise((resolve) => {
            educationUpdateOperation.then(response => resolve(response));
          });
          
          updates.push(educationUpdatePromise);
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
        
        const languagesUpdatePromise = new Promise((resolve) => {
          languagesUpdateOperation.then(response => resolve(response));
        });
        
        updates.push(languagesUpdatePromise);
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
          
          const certUpdatePromise = new Promise((resolve) => {
            certUpdateOperation.then(response => resolve(response));
          });
          
          updates.push(certUpdatePromise);
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

export const enhanceUserProfile = async (): Promise<boolean> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error("You must be logged in to enhance your profile");
      return false;
    }

    // 1. Get all CV documents
    const { data: documents, error: docsError } = await supabase
      .from('user_documents')
      .select('*')
      .eq('user_id', user.id)
      .eq('document_type', 'cv');
    
    if (docsError) {
      console.error("Error fetching CV documents:", docsError);
      return false;
    }
    
    if (!documents || documents.length === 0) {
      toast.info("No CVs found. Please upload a CV to enhance your profile.");
      return false;
    }

    console.log(`Found ${documents.length} CV documents to process`);
    
    // 2. Extract data from all CVs
    const allExtractedData: ExtractedCVData[] = [];
    
    for (const doc of documents) {
      try {
        const extractedData = await extractCVData(doc.id);
        if (extractedData) {
          allExtractedData.push(extractedData);
        }
      } catch (error) {
        console.error(`Error extracting data from document ${doc.id}:`, error);
        // Continue with other documents even if one fails
      }
    }
    
    if (allExtractedData.length === 0) {
      toast.error("Could not extract data from any of your CVs");
      return false;
    }

    console.log(`Successfully extracted data from ${allExtractedData.length} CVs`);
    
    // 3. Merge all extracted data
    const mergedData: ExtractedCVData = {
      fullName: allExtractedData[0]?.fullName || '',
      title: allExtractedData[0]?.title || '',
      contact: allExtractedData[0]?.contact || {},
      summary: allExtractedData[0]?.summary || '',
      skills: [],
      experience: [],
      education: [],
      languages: [],
      certifications: []
    };
    
    // Merge all skills, experiences, etc. from all CVs
    allExtractedData.forEach(data => {
      // Add skills
      if (data.skills) {
        data.skills.forEach(skill => {
          if (skill && !mergedData.skills?.includes(skill)) {
            mergedData.skills?.push(skill);
          }
        });
      }
      
      // Add experiences
      if (data.experience) {
        data.experience.forEach(exp => {
          const isDuplicate = mergedData.experience?.some(e => 
            e.company === exp.company && e.role === exp.role && e.start === exp.start
          );
          if (!isDuplicate) {
            mergedData.experience?.push(exp);
          }
        });
      }
      
      // Add education
      if (data.education) {
        data.education.forEach(edu => {
          const isDuplicate = mergedData.education?.some(e => 
            e.school === edu.school && e.degree === edu.degree
          );
          if (!isDuplicate) {
            mergedData.education?.push(edu);
          }
        });
      }
      
      // Add languages
      if (data.languages) {
        data.languages.forEach(lang => {
          const isDuplicate = mergedData.languages?.some(l => 
            l.language === lang.language
          );
          if (!isDuplicate) {
            mergedData.languages?.push(lang);
          }
        });
      }
      
      // Add certifications
      if (data.certifications) {
        data.certifications.forEach(cert => {
          const isDuplicate = mergedData.certifications?.some(c => 
            c.name === cert.name && c.issuer === cert.issuer
          );
          if (!isDuplicate) {
            mergedData.certifications?.push(cert);
          }
        });
      }
    });

    // 4. Update profile with the merged data
    const success = await updateProfileWithCVData(mergedData);
    return success;
  } catch (error) {
    console.error('Error in enhanceUserProfile:', error);
    return false;
  }
};
