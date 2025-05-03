
/**
 * Checks if there is existing extracted data for a document
 */
export async function checkExistingExtractedData(
  supabaseUrl: string, 
  supabaseKey: string, 
  documentId: string, 
  userId: string
) {
  try {
    console.log(`Checking for existing extracted data for document ${documentId}`);
    
    const existingDataResponse = await fetch(
      `${supabaseUrl}/rest/v1/cv_extracted_data?document_id=eq.${documentId}&user_id=eq.${userId}`,
      {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    if (existingDataResponse.ok) {
      const existingData = await existingDataResponse.json();
      if (existingData && existingData.length > 0 && existingData[0].extracted_data) {
        // Check if the extracted data contains placeholder content
        const extractedData = existingData[0].extracted_data;
        
        if (extractedData.summary && 
            typeof extractedData.summary === 'string' && 
            (extractedData.summary.includes('placeholder') || 
            extractedData.summary.includes('could not be processed'))) {
          
          // If it's been more than a day, we can try re-extracting
          const createDate = new Date(existingData[0].created_at);
          const oneDayAgo = new Date();
          oneDayAgo.setDate(oneDayAgo.getDate() - 1);
          
          if (createDate < oneDayAgo) {
            console.log("Found placeholder data older than 24h for document:", documentId, "- allowing re-extraction attempt");
            
            await fetch(
              `${supabaseUrl}/rest/v1/cv_extracted_data?id=eq.${existingData[0].id}`,
              {
                method: 'DELETE',
                headers: {
                  'apikey': supabaseKey,
                  'Authorization': `Bearer ${supabaseKey}`,
                  'Content-Type': 'application/json'
                }
              }
            );
            return null;
          } else {
            console.log("Found recent placeholder data for document:", documentId, "- using it");
            return existingData[0].extracted_data;
          }
        } else if (!extractedData.summary?.includes('placeholder')) {
          console.log("Using existing extracted data for document:", documentId);
          return existingData[0].extracted_data;
        }
      }
    } else {
      console.error("Error checking for existing data:", await existingDataResponse.text());
    }
    return null;
  } catch (err) {
    console.error("Error checking for existing data:", err);
    // Continue with extraction if error checking cache
    return null;
  }
}

/**
 * Updates user profile in database with extracted data
 */
export async function updateUserProfile(
  supabaseUrl: string,
  supabaseKey: string,
  userId: string,
  profileData: any
) {
  try {
    // Update the main profile (profiles table)
    const profileUpdate: Record<string, any> = {
      full_name: profileData.personal_info?.full_name,
      location: profileData.personal_info?.location,
      bio: profileData.summary,
      website: profileData.personal_info?.website,
      updated_at: new Date().toISOString()
    };

    // Add linkedin_url if it exists in your profiles table
    if (profileData.personal_info?.linkedin_url) {
      profileUpdate.linkedin_url = profileData.personal_info.linkedin_url;
    }

    await fetch(`${supabaseUrl}/rest/v1/profiles?id=eq.${userId}`, {
      method: 'PATCH',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(profileUpdate)
    });
    
    // Update skills (user_skills table)
    if (profileData.skills && profileData.skills.length > 0) {
      // First clear existing skills
      await fetch(`${supabaseUrl}/rest/v1/user_skills?user_id=eq.${userId}`, {
        method: 'DELETE',
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json'
        }
      });
      
      // Add all skills
      for (const skill of profileData.skills) {
        await fetch(`${supabaseUrl}/rest/v1/user_skills`, {
          method: 'POST',
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            user_id: userId,
            name: skill.name,
            level: skill.level || 3, // Default to intermediate if not specified
            source: 'cv_extraction'
          })
        });
      }
    }
    
    // Update experience (user_experience table)
    if (profileData.work_experience && profileData.work_experience.length > 0) {
      // Clear existing experience
      await fetch(`${supabaseUrl}/rest/v1/user_experience?user_id=eq.${userId}`, {
        method: 'DELETE',
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json'
        }
      });
      
      // Add new experiences
      for (const exp of profileData.work_experience) {
        await fetch(`${supabaseUrl}/rest/v1/user_experience`, {
          method: 'POST',
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            user_id: userId,
            company: exp.company,
            role: exp.role,
            start_date: exp.start_date,
            end_date: exp.end_date || null,
            description: exp.description,
            source: exp.source || 'cv_extraction'
          })
        });
      }
    }
    
    // Update education (user_education table)
    if (profileData.education && profileData.education.length > 0) {
      // Clear existing education
      await fetch(`${supabaseUrl}/rest/v1/user_education?user_id=eq.${userId}`, {
        method: 'DELETE',
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json'
        }
      });
      
      // Add new education entries
      for (const edu of profileData.education) {
        await fetch(`${supabaseUrl}/rest/v1/user_education`, {
          method: 'POST',
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            user_id: userId,
            institution: edu.institution,
            degree: edu.degree,
            start_year: edu.start_year,
            end_year: edu.end_year,
            description: edu.description,
            source: edu.source || 'cv_extraction'
          })
        });
      }
    }
    
    // Update certifications (user_certifications table)
    if (profileData.certifications && profileData.certifications.length > 0) {
      // Clear existing certifications
      await fetch(`${supabaseUrl}/rest/v1/user_certifications?user_id=eq.${userId}`, {
        method: 'DELETE',
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json'
        }
      });
      
      // Add new certifications
      for (const cert of profileData.certifications) {
        await fetch(`${supabaseUrl}/rest/v1/user_certifications`, {
          method: 'POST',
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            user_id: userId,
            name: cert.name,
            issuer: cert.issuer,
            date: cert.date
          })
        });
      }
    }
    
    // Update languages (user_languages table)
    if (profileData.languages && profileData.languages.length > 0) {
      // Clear existing languages
      await fetch(`${supabaseUrl}/rest/v1/user_languages?user_id=eq.${userId}`, {
        method: 'DELETE',
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json'
        }
      });
      
      // Add new languages
      for (const lang of profileData.languages) {
        await fetch(`${supabaseUrl}/rest/v1/user_languages`, {
          method: 'POST',
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            user_id: userId,
            language: lang.language,
            level: lang.level || 'intermediate'
          })
        });
      }
    }
    
    return { success: true };
  } catch (error) {
    console.error("Error updating user profile:", error);
    return { error: error.message };
  }
}

/**
 * Gets all CV documents for a user
 */
export async function getUserCVs(supabaseUrl: string, supabaseKey: string, userId: string) {
  try {
    const response = await fetch(
      `${supabaseUrl}/rest/v1/user_documents?user_id=eq.${userId}&document_type=eq.cv&select=*`,
      {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch CVs: ${await response.text()}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching user CVs:", error);
    return [];
  }
}
