
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';
import { extractCVData } from './extractorService';
import { updateProfileWithCVData } from './profileUpdaterService';
import type { ExtractedCVData } from './types';

/**
 * Enhances the user's profile with data from all CVs
 */
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

    // Get LinkedIn data if available
    const { data: linkedinData } = await supabase
      .from('linkedin_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single()
      .catch(() => ({ data: null }));

    console.log(`Found ${documents.length} CV documents to process`);
    toast.info(`Processing ${documents.length} CV documents...`, { duration: 3000 });
    
    // 2. Extract text data from all CVs
    const cvTexts: string[] = [];
    const allExtractedData: ExtractedCVData[] = [];
    
    for (const doc of documents) {
      try {
        // Get extracted data from Supabase Edge Function
        const extractedData = await extractCVData(doc.id);
        if (extractedData) {
          allExtractedData.push(extractedData);
          
          // Convert extracted data to text format for AI prompt
          const textRepresentation = convertExtractedDataToText(extractedData, doc.filename);
          cvTexts.push(textRepresentation);
        }
      } catch (error) {
        console.error(`Error extracting data from document ${doc.id}:`, error);
      }
    }
    
    // Add LinkedIn data text if available
    if (linkedinData) {
      const linkedinText = convertLinkedInDataToText(linkedinData);
      if (linkedinText) {
        cvTexts.push(linkedinText);
      }
    }
    
    if (cvTexts.length === 0) {
      toast.error("Could not extract data from any of your CVs");
      return false;
    }

    console.log(`Successfully extracted text from ${cvTexts.length} sources`);
    
    // 3. Send the concatenated text to OpenAI for unified processing
    const mergedData = await generateUnifiedProfile(cvTexts.join("\n\n----- NEXT SOURCE -----\n\n"));
    
    if (!mergedData) {
      toast.error("Failed to generate unified profile data");
      return false;
    }

    console.log("Generated unified profile data:", mergedData);

    // 4. Update profile with the merged data
    const success = await updateProfileWithCVData(mergedData);
    return success;
  } catch (error) {
    console.error('Error in enhanceUserProfile:', error);
    return false;
  }
};

/**
 * Convert extracted CV data to text format for AI processing
 */
function convertExtractedDataToText(data: ExtractedCVData, filename: string): string {
  let text = `--- CV: ${filename} ---\n`;
  
  if (data.fullName) text += `Name: ${data.fullName}\n`;
  if (data.title) text += `Title: ${data.title}\n`;
  
  if (data.contact) {
    text += 'Contact Information:\n';
    if (data.contact.email) text += `Email: ${data.contact.email}\n`;
    if (data.contact.phone) text += `Phone: ${data.contact.phone}\n`;
    if (data.contact.location) text += `Location: ${data.contact.location}\n`;
    if (data.contact.website) text += `Website: ${data.contact.website}\n`;
    if (data.contact.linkedin) text += `LinkedIn: ${data.contact.linkedin}\n`;
  }
  
  if (data.summary) text += `Summary: ${data.summary}\n`;
  
  if (data.skills && data.skills.length > 0) {
    text += 'Skills:\n';
    data.skills.forEach(skill => {
      text += `- ${skill}\n`;
    });
  }
  
  if (data.experience && data.experience.length > 0) {
    text += 'Work Experience:\n';
    data.experience.forEach((job, index) => {
      text += `[${index + 1}] ${job.role || 'Unknown position'} at ${job.company || 'Unknown company'}\n`;
      text += `    Duration: ${job.start || 'Unknown'} to ${job.end || 'Present'}\n`;
      if (job.description) text += `    ${job.description}\n`;
    });
  }
  
  if (data.education && data.education.length > 0) {
    text += 'Education:\n';
    data.education.forEach((edu, index) => {
      text += `[${index + 1}] ${edu.degree || 'Unknown degree'} at ${edu.school || 'Unknown school'}\n`;
      text += `    Duration: ${edu.start || 'Unknown'} to ${edu.end || 'Present'}\n`;
      if (edu.description) text += `    ${edu.description}\n`;
    });
  }
  
  return text;
}

/**
 * Convert LinkedIn data to text format for AI processing
 */
function convertLinkedInDataToText(linkedinData: any): string {
  if (!linkedinData) return '';
  
  let text = '--- LinkedIn Profile Data ---\n';
  
  const profile = linkedinData.profile_data;
  if (profile) {
    if (profile.firstName && profile.lastName) {
      text += `Name: ${profile.firstName} ${profile.lastName}\n`;
    }
    if (profile.headline) {
      text += `Headline: ${profile.headline}\n`;
    }
    if (profile.summary) {
      text += `Summary: ${profile.summary}\n`;
    }
    if (profile.locationName) {
      text += `Location: ${profile.locationName}\n`;
    }
  }
  
  // Add LinkedIn positions data
  const positions = linkedinData.positions_data;
  if (positions && positions.length > 0) {
    text += 'Work Experience:\n';
    positions.forEach((position: any, index: number) => {
      text += `[${index + 1}] ${position.title || 'Unknown position'} at ${position.companyName || 'Unknown company'}\n`;
      
      // Format start and end dates if available
      let startDate = 'Unknown';
      if (position.startDate && position.startDate.year) {
        startDate = `${position.startDate.year}`;
        if (position.startDate.month) startDate = `${position.startDate.year}-${position.startDate.month.toString().padStart(2, '0')}`;
      }
      
      let endDate = 'Present';
      if (position.endDate && position.endDate.year) {
        endDate = `${position.endDate.year}`;
        if (position.endDate.month) endDate = `${position.endDate.year}-${position.endDate.month.toString().padStart(2, '0')}`;
      }
      
      text += `    Duration: ${startDate} to ${endDate}\n`;
      if (position.description) text += `    ${position.description}\n`;
    });
  }
  
  // Add LinkedIn education data
  const education = linkedinData.education_data;
  if (education && education.length > 0) {
    text += 'Education:\n';
    education.forEach((edu: any, index: number) => {
      text += `[${index + 1}] ${edu.degreeName || 'Unknown degree'} ${edu.fieldOfStudy ? `in ${edu.fieldOfStudy}` : ''} at ${edu.schoolName || 'Unknown school'}\n`;
      
      // Format start and end dates if available
      let startYear = edu.startDate?.year || 'Unknown';
      let endYear = edu.endDate?.year || 'Present';
      
      text += `    Duration: ${startYear} to ${endYear}\n`;
    });
  }
  
  // Add LinkedIn skills
  const skills = linkedinData.skills_data;
  if (skills && skills.length > 0) {
    text += 'Skills:\n';
    skills.forEach((skill: any) => {
      const skillName = typeof skill === 'string' ? skill : skill.name;
      if (skillName) text += `- ${skillName}\n`;
    });
  }
  
  return text;
}

/**
 * Generate a unified profile using AI from multiple CV sources
 */
async function generateUnifiedProfile(parsedText: string): Promise<ExtractedCVData | null> {
  try {
    // Call the Supabase Edge Function to generate the unified profile
    const prompt = `
You are given multiple CVs for the same user. Use all of them to extract and generate a unified, comprehensive profile.

Return the result strictly in the following JSON format:
{
  "fullName": "User's full name",
  "title": "Professional Title",
  "contact": {
    "email": "user@example.com",
    "phone": "phone number",
    "location": "City, Country",
    "website": "personal website if available",
    "linkedin": "LinkedIn URL if available",
    "github": "GitHub URL if available"
  },
  "summary": "Professional summary paragraph that captures key experience, skills and career focus",
  "skills": ["skill1", "skill2", "..."],
  "experience": [
    {
      "company": "Company Name",
      "role": "Job Title",
      "start": "YYYY-MM",
      "end": "YYYY-MM or null for present",
      "description": "Detailed description of responsibilities and achievements"
    },
    ...
  ],
  "education": [
    {
      "school": "School Name",
      "degree": "Degree Name",
      "start": "YYYY",
      "end": "YYYY or null for present",
      "description": "Additional details about the education"
    },
    ...
  ],
  "languages": [
    {
      "language": "Language Name",
      "proficiency": "Level (e.g. Native, Fluent, Intermediate, Basic)"
    },
    ...
  ],
  "certifications": [
    {
      "name": "Certification Name",
      "issuer": "Issuing Organization",
      "date": "YYYY-MM"
    },
    ...
  ]
}

Be sure to:
- Use ONLY real data found in the documents
- Do not generate or invent ANY information not present in the source documents
- If you find conflicting information (like different names), use the most recent source
- Merge all the relevant information from the CVs
- Eliminate duplicates
- Ensure all dates are in proper YYYY-MM format where possible
- Include all appropriate skills mentioned across documents
- Write a comprehensive summary that highlights the person's experience, skills, and career focus
- Format multi-paragraph text without line breaks (use spaces instead)
- If data for a field is not available in ANY source, either omit the field or leave it as null/empty string

CV TEXTS:
${parsedText}
`;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    console.log("Sending parsed text to AI for processing");
    toast.info("Analyzing your CV data with AI...", { duration: 5000 });
    
    const { data, error } = await supabase.functions.invoke('unify-cv-data', {
      body: { prompt, userId: user.id }
    });
    
    if (error) {
      console.error("Error calling unify-cv-data function:", error);
      throw error;
    }
    
    console.log("Successfully generated unified CV data from AI");
    return data as ExtractedCVData;
  } catch (error) {
    console.error("Error generating unified profile:", error);
    return null;
  }
}
