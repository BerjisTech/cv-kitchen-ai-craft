
import { supabase } from '@/integrations/supabase/client';

/**
 * Get all CV context data for job analysis
 */
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
