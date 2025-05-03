
import { supabase } from "@/integrations/supabase/client";

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
    
    // Get the user's CV data from extracted_data - using array syntax and limit(1) to avoid multiple rows error
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
