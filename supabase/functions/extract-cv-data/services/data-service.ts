
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
    console.log(`Updating profile for user ${userId} with extracted data`);
    console.log("Profile data keys:", Object.keys(profileData));
    
    // Update the main profile (profiles table)
    const profileUpdate: Record<string, any> = {
      updated_at: new Date().toISOString()
    };
    
    // Only add fields that exist in the data
    if (profileData.personal_info?.full_name) {
      profileUpdate.full_name = profileData.personal_info.full_name;
      console.log("Updating full_name:", profileData.personal_info.full_name);
    }
    
    if (profileData.personal_info?.location) {
      profileUpdate.location = profileData.personal_info.location;
      console.log("Updating location:", profileData.personal_info.location);
    }
    
    if (profileData.summary) {
      profileUpdate.bio = profileData.summary;
      console.log("Updating bio with summary");
    }
    
    if (profileData.personal_info?.website) {
      profileUpdate.website = profileData.personal_info.website;
      console.log("Updating website:", profileData.personal_info.website);
    }

    // Add linkedin_url if it exists in your profiles table
    if (profileData.personal_info?.linkedin_url) {
      profileUpdate.linkedin_url = profileData.personal_info.linkedin_url;
      console.log("Updating LinkedIn URL:", profileData.personal_info.linkedin_url);
    }

    // Update the profile if we have any data
    if (Object.keys(profileUpdate).length > 1) { // More than just updated_at
      console.log("Updating profiles table");
      
      const profileResponse = await fetch(`${supabaseUrl}/rest/v1/profiles?id=eq.${userId}`, {
        method: 'PATCH',
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify(profileUpdate)
      });
      
      if (!profileResponse.ok) {
        console.error("Error updating profile:", await profileResponse.text());
      }
    }
    
    // Update skills (user_skills table)
    if (profileData.skills && profileData.skills.length > 0) {
      console.log(`Updating ${profileData.skills.length} skills`);
      
      // First clear existing skills from CV extraction
      await fetch(`${supabaseUrl}/rest/v1/user_skills?user_id=eq.${userId}&source=eq.cv_extraction`, {
        method: 'DELETE',
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json'
        }
      });
      
      // Add all skills in batches
      const batchSize = 20;
      for (let i = 0; i < profileData.skills.length; i += batchSize) {
        const batch = profileData.skills.slice(i, i + batchSize);
        const skillsData = batch.map((skill: any) => ({
          user_id: userId,
          name: skill.name,
          level: skill.level || Math.floor(Math.random() * 31) + 70, // Between 70-100
          source: 'cv_extraction'
        }));
        
        await fetch(`${supabaseUrl}/rest/v1/user_skills`, {
          method: 'POST',
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal'
          },
          body: JSON.stringify(skillsData)
        });
      }
    }
    
    // Update experience (user_experience table)
    if (profileData.work_experience && profileData.work_experience.length > 0) {
      console.log(`Updating ${profileData.work_experience.length} work experiences`);
      
      // Clear existing experience from CV extraction
      await fetch(`${supabaseUrl}/rest/v1/user_experience?user_id=eq.${userId}&source=eq.cv_extraction`, {
        method: 'DELETE',
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json'
        }
      });
      
      // Add new experiences
      for (const exp of profileData.work_experience) {
        if (!exp.company || !exp.role) continue;
        
        await fetch(`${supabaseUrl}/rest/v1/user_experience`, {
          method: 'POST',
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal'
          },
          body: JSON.stringify({
            user_id: userId,
            company: exp.company,
            role: exp.role,
            start_date: exp.start_date || null,
            end_date: exp.end_date || null,
            description: exp.description || null,
            source: 'cv_extraction'
          })
        });
      }
    }
    
    // Update education (user_education table)
    if (profileData.education && profileData.education.length > 0) {
      console.log(`Updating ${profileData.education.length} education entries`);
      
      // Clear existing education from CV extraction
      await fetch(`${supabaseUrl}/rest/v1/user_education?user_id=eq.${userId}&source=eq.cv_extraction`, {
        method: 'DELETE',
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json'
        }
      });
      
      // Add new education entries
      for (const edu of profileData.education) {
        if (!edu.institution || !edu.degree) continue;
        
        await fetch(`${supabaseUrl}/rest/v1/user_education`, {
          method: 'POST',
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal'
          },
          body: JSON.stringify({
            user_id: userId,
            institution: edu.institution,
            degree: edu.degree,
            start_year: edu.start_year || null,
            end_year: edu.end_year || null,
            description: edu.description || null,
            source: 'cv_extraction'
          })
        });
      }
    }
    
    // Update certifications (user_certifications table)
    if (profileData.certifications && profileData.certifications.length > 0) {
      console.log(`Updating ${profileData.certifications.length} certifications`);
      
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
        if (!cert.name) continue;
        
        await fetch(`${supabaseUrl}/rest/v1/user_certifications`, {
          method: 'POST',
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal'
          },
          body: JSON.stringify({
            user_id: userId,
            name: cert.name,
            issuer: cert.issuer || null,
            date: cert.date || null
          })
        });
      }
    }
    
    // Update languages (user_languages table)
    if (profileData.languages && profileData.languages.length > 0) {
      console.log(`Updating ${profileData.languages.length} languages`);
      
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
        if (!lang.language) continue;
        
        await fetch(`${supabaseUrl}/rest/v1/user_languages`, {
          method: 'POST',
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal'
          },
          body: JSON.stringify({
            user_id: userId,
            language: lang.language,
            level: lang.level || 'intermediate'
          })
        });
      }
    }
    
    console.log("Profile update completed successfully");
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
