
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { checkExistingExtractedData, updateUserProfile, getUserCVs } from "./services/data-service.ts";

// Define CORS headers for all responses
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};

/**
 * Process a document by extracting its text and data
 */
async function processDocument(documentId: string, userId: string, abortSignal: AbortSignal) {
  // Import services dynamically to reduce cold start time
  const { extractTextFromDocument } = await import("./services/document-service.ts");
  const { extractDataWithAI } = await import("./services/ai-service.ts");
  
  console.log(`Started processing document ${documentId} for user ${userId}`);
  
  try {
    // Always delete any existing extracted data for this document
    await checkExistingExtractedData(
      Deno.env.get('SUPABASE_URL') || '', 
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '', 
      documentId,
      userId
    );
    
    // Extract text from the document
    console.log("Extracting text from document...");
    const textContent = await extractTextFromDocument(
      Deno.env.get('SUPABASE_URL') || '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '',
      documentId,
      abortSignal
    );
    
    if (!textContent) {
      console.error("Failed to extract text from document");
      return new Response(
        JSON.stringify({ error: 'Failed to extract text from document' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    console.log(`Successfully extracted text from document (${textContent.length} characters)`);
    
    // Extract data from the text content using AI
    console.log("Extracting data from text content using AI...");
    const extractedData = await extractDataWithAI(textContent, abortSignal);
    
    if (!extractedData) {
      console.error("Failed to extract data from document text");
      return new Response(
        JSON.stringify({ error: 'Failed to extract data from document text' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    console.log("Successfully extracted data from document text");
    
    // Store the extracted data
    console.log("Storing extracted data in database...");
    
    const storeDataResponse = await fetch(
      `${Deno.env.get('SUPABASE_URL')}/rest/v1/cv_extracted_data`,
      {
        method: 'POST',
        headers: {
          'apikey': Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '',
          'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({
          user_id: userId,
          document_id: documentId,
          extracted_data: extractedData
        }),
        signal: abortSignal
      }
    );
    
    if (!storeDataResponse.ok) {
      console.error("Failed to store extracted data:", await storeDataResponse.text());
      return new Response(
        JSON.stringify({ error: 'Failed to store extracted data' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    console.log("Extracted data stored successfully");
    
    // Update the user profile with the extracted data
    console.log("Updating user profile with extracted data...");
    const profileUpdateResult = await updateUserProfile(
      Deno.env.get('SUPABASE_URL') || '', 
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '', 
      userId, 
      extractedData
    );
    
    if (profileUpdateResult.error) {
      console.error("Error updating profile:", profileUpdateResult.error);
      return new Response(
        JSON.stringify({ error: `Error updating profile: ${profileUpdateResult.error}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    console.log("User profile updated successfully");
    
    // Return the extracted data
    return new Response(
      JSON.stringify(extractedData),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error("Error processing document:", error);
    return new Response(
      JSON.stringify({ error: error.message || 'Unknown error processing document' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

/**
 * Enhance a user's profile using all their uploaded CVs
 */
async function enhanceUserProfile(userId: string, abortSignal: AbortSignal) {
  // Import services dynamically to reduce cold start time
  const { extractTextFromDocument } = await import("./services/document-service.ts");
  const { extractDataWithAI } = await import("./services/ai-service.ts");
  
  console.log(`Starting profile enhancement for user ${userId}`);
  
  try {
    // Get all CV documents for the user
    const userCVs = await getUserCVs(
      Deno.env.get('SUPABASE_URL') || '', 
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '', 
      userId
    );
    
    if (!userCVs || userCVs.length === 0) {
      console.log("No CVs found for user");
      return new Response(
        JSON.stringify({ error: 'No CVs found. Please upload at least one CV document.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    console.log(`Found ${userCVs.length} CVs for user`);
    
    // Process each CV to extract text and data
    const allExtractedData = [];
    
    for (const cv of userCVs) {
      console.log(`Processing CV: ${cv.filename}`);
      
      try {
        // Always delete any existing extracted data for this document
        await checkExistingExtractedData(
          Deno.env.get('SUPABASE_URL') || '', 
          Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '', 
          cv.id,
          userId
        );
        
        // Extract text from document
        const textContent = await extractTextFromDocument(
          Deno.env.get('SUPABASE_URL') || '',
          Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '',
          cv.id,
          abortSignal
        );
        
        if (!textContent) {
          console.log(`Failed to extract text from ${cv.filename}, skipping...`);
          continue;
        }
        
        console.log(`Extracted ${textContent.length} characters from ${cv.filename}`);
        
        // Extract data from text
        const extractedData = await extractDataWithAI(textContent, abortSignal);
        
        if (!extractedData) {
          console.log(`Failed to extract data from ${cv.filename}, skipping...`);
          continue;
        }
        
        console.log(`Successfully extracted data from ${cv.filename}`);
        
        // Store the extracted data
        const storeDataResponse = await fetch(
          `${Deno.env.get('SUPABASE_URL')}/rest/v1/cv_extracted_data`,
          {
            method: 'POST',
            headers: {
              'apikey': Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '',
              'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''}`,
              'Content-Type': 'application/json',
              'Prefer': 'return=minimal'
            },
            body: JSON.stringify({
              user_id: userId,
              document_id: cv.id,
              extracted_data: extractedData
            }),
            signal: abortSignal
          }
        );
        
        if (!storeDataResponse.ok) {
          console.error(`Failed to store extracted data for ${cv.filename}:`, await storeDataResponse.text());
        } else {
          console.log(`Stored extracted data for ${cv.filename}`);
          allExtractedData.push(extractedData);
        }
      } catch (cvError) {
        console.error(`Error processing CV ${cv.filename}:`, cvError);
        // Continue with next CV
      }
    }
    
    if (allExtractedData.length === 0) {
      console.error("Failed to extract data from any CV");
      return new Response(
        JSON.stringify({ error: 'Failed to extract data from any CV' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Merge extracted data and update profile
    console.log("Merging extracted data and updating profile...");
    const mergedData = allExtractedData.reduce((result, data) => {
      // Combine personal info
      if (data.personal_info) {
        result.personal_info = { ...result.personal_info, ...data.personal_info };
      }
      
      // Combine summary
      if (data.summary && (!result.summary || result.summary.length < data.summary.length)) {
        result.summary = data.summary;
      }
      
      // Combine skills (no duplicates)
      if (data.skills && data.skills.length > 0) {
        const existingSkillNames = (result.skills || []).map(s => s.name.toLowerCase());
        const newSkills = data.skills.filter(s => !existingSkillNames.includes(s.name.toLowerCase()));
        result.skills = [...(result.skills || []), ...newSkills];
      }
      
      // Combine work experience (no duplicates)
      if (data.work_experience && data.work_experience.length > 0) {
        const existingExperiences = result.work_experience || [];
        
        for (const exp of data.work_experience) {
          const isDuplicate = existingExperiences.some(
            e => e.company === exp.company && e.role === exp.role
          );
          
          if (!isDuplicate) {
            existingExperiences.push(exp);
          }
        }
        
        result.work_experience = existingExperiences;
      }
      
      // Combine education (no duplicates)
      if (data.education && data.education.length > 0) {
        const existingEducation = result.education || [];
        
        for (const edu of data.education) {
          const isDuplicate = existingEducation.some(
            e => e.institution === edu.institution && e.degree === edu.degree
          );
          
          if (!isDuplicate) {
            existingEducation.push(edu);
          }
        }
        
        result.education = existingEducation;
      }
      
      // Combine certifications (no duplicates)
      if (data.certifications && data.certifications.length > 0) {
        const existingCerts = result.certifications || [];
        
        for (const cert of data.certifications) {
          const isDuplicate = existingCerts.some(c => c.name === cert.name);
          
          if (!isDuplicate) {
            existingCerts.push(cert);
          }
        }
        
        result.certifications = existingCerts;
      }
      
      // Combine languages (no duplicates)
      if (data.languages && data.languages.length > 0) {
        const existingLangs = result.languages || [];
        
        for (const lang of data.languages) {
          const isDuplicate = existingLangs.some(l => l.language === lang.language);
          
          if (!isDuplicate) {
            existingLangs.push(lang);
          }
        }
        
        result.languages = existingLangs;
      }
      
      return result;
    }, {});
    
    // Update the user's profile with the merged data
    console.log("Updating profile with merged data...");
    const profileUpdateResult = await updateUserProfile(
      Deno.env.get('SUPABASE_URL') || '', 
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '', 
      userId, 
      mergedData
    );
    
    if (profileUpdateResult.error) {
      console.error("Error updating profile with merged data:", profileUpdateResult.error);
      return new Response(
        JSON.stringify({ error: `Error updating profile: ${profileUpdateResult.error}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    console.log("Profile successfully enhanced with data from all CVs");
    
    return new Response(
      JSON.stringify({ success: true, message: 'Profile enhanced successfully' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error("Error enhancing user profile:", error);
    return new Response(
      JSON.stringify({ error: error.message || 'Unknown error enhancing profile' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Set a default abort controller with a reasonable timeout
  const abortController = new AbortController();
  const timeoutId = setTimeout(() => abortController.abort(), 55000); // 55 seconds timeout

  try {
    console.log("Extract CV data function invoked");
    
    // Parse request body
    let requestData;
    try {
      requestData = await req.json();
      const documentId = requestData.documentId;
      const userId = requestData.userId;
      const forceReExtract = requestData.forceReExtract === true;
      
      if (!userId && !requestData.updateProfile && !requestData.enhanceProfile) {
        console.error("Missing required parameter: userId");
        clearTimeout(timeoutId);
        return new Response(
          JSON.stringify({ error: 'Missing required parameter: userId' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      if (forceReExtract) {
        console.log("Force re-extraction flag set to true - will ignore cached data");
      }
      
      // If profile update with CV data is requested
      if (requestData.updateProfile && requestData.cvData && requestData.userId) {
        console.log(`Processing profile update with CV data for userId: ${requestData.userId}`);
        console.log("CV data received:", JSON.stringify(requestData.cvData).substring(0, 200) + "...");
        
        // Update user profile with the provided CV data
        const updateResult = await updateUserProfile(
          Deno.env.get('SUPABASE_URL') || '', 
          Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '', 
          requestData.userId, 
          requestData.cvData
        );
        
        clearTimeout(timeoutId);
        if (updateResult.error) {
          return new Response(
            JSON.stringify({ error: updateResult.error }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        return new Response(
          JSON.stringify({ success: true }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      // If specific document processing is requested
      if (documentId && userId) {
        console.log(`Processing request for documentId: ${documentId}, userId: ${userId}`);
        return await processDocument(documentId, userId, abortController.signal);
      }
      
      // If bulk profile enhancement is requested
      if (userId && requestData.enhanceProfile) {
        console.log(`Processing profile enhancement request for userId: ${userId}`);
        return await enhanceUserProfile(userId, abortController.signal);
      }
      
      // Invalid request
      console.error("Missing required parameters or invalid request format");
      clearTimeout(timeoutId);
      return new Response(
        JSON.stringify({ error: 'Missing required parameters or invalid request format' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } catch (parseError) {
      console.error("Error parsing request JSON:", parseError);
      clearTimeout(timeoutId);
      return new Response(
        JSON.stringify({ error: 'Invalid request format' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  } catch (error) {
    clearTimeout(timeoutId);
    
    // Special handling for AbortError
    if (error.name === 'AbortError') {
      console.error('Function timed out after 55 seconds');
      return new Response(
        JSON.stringify({ 
          error: 'The extraction process timed out. The file may be too large or complex.',
          details: 'Server timeout after 55 seconds'
        }),
        { status: 408, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    console.error('Error in extract-cv-data function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'An unexpected error occurred',
        details: error.stack || 'No stack trace available'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
