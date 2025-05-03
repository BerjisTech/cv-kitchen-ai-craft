
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';
import { extractCVData } from './extractorService';
import { updateProfileWithCVData } from './profileUpdaterService';
import { ExtractedCVData } from './types';

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
