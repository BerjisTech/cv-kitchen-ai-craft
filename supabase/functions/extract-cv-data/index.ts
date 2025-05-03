
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { corsHeaders } from "./utils/cors.ts";
import { getDocument, getSignedURL, downloadDocumentContent } from "./services/document-service.ts";
import { extractDataWithOpenAI } from "./services/ai-service.ts";
import { checkExistingExtractedData, updateUserProfile, getUserCVs } from "./services/data-service.ts";

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
      
      if (!documentId && !userId) {
        console.error("Missing required parameters: documentId and userId");
        clearTimeout(timeoutId);
        return new Response(
          JSON.stringify({ error: 'Missing required parameters: documentId and userId' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
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

/**
 * Process a single document
 */
async function processDocument(documentId: string, userId: string, signal: AbortSignal) {
  // Get Supabase credentials from environment
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  
  if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase environment variables");
    return new Response(
      JSON.stringify({ error: 'Server configuration error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  // Check for existing extracted data
  try {
    const existingData = await checkExistingExtractedData(supabaseUrl, supabaseKey, documentId, userId);
    if (existingData) {
      console.log("Using cached extracted data");
      return new Response(
        JSON.stringify(existingData),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  } catch (cacheError) {
    console.error("Error checking for cached data:", cacheError);
    // Continue with extraction if error checking cache
  }

  // Get document information
  const document = await getDocument(supabaseUrl, supabaseKey, documentId);
  if (!document) {
    console.error("Document not found:", documentId);
    return new Response(
      JSON.stringify({ error: "Document not found or access denied" }),
      { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
  
  console.log("Found document:", document);

  // Generate signed URL for document download
  const signedURL = await getSignedURL(supabaseUrl, supabaseKey, document.filepath);
  if (!signedURL) {
    console.error("Failed to generate signed URL for file:", document.filepath);
    return new Response(
      JSON.stringify({ error: "Failed to access document file" }),
      { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
  
  // Download document content
  const { fileContent, fileContentDescription, error: downloadError } = 
    await downloadDocumentContent(signedURL, document);
  
  if (downloadError) {
    console.error("Error downloading document content:", downloadError);
    return new Response(
      JSON.stringify({ error: downloadError }),
      { status: 422, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
  
  // Process with AI using the abort signal
  const extractedData = await extractDataWithOpenAI(fileContentDescription, signal);
  if (extractedData.error) {
    console.error("Error in AI extraction:", extractedData.error);
    return new Response(
      JSON.stringify({ error: extractedData.error }),
      { status: 422, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
  
  // Store the extracted data in the database for future use
  try {
    if (extractedData && !extractedData.error) {
      const storeResponse = await fetch(
        `${supabaseUrl}/rest/v1/cv_extracted_data`,
        {
          method: 'POST',
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal'
          },
          body: JSON.stringify({
            document_id: documentId,
            user_id: userId,
            extracted_data: extractedData
          })
        }
      );

      if (!storeResponse.ok) {
        console.error("Failed to store extracted data:", await storeResponse.text());
      } else {
        console.log("Successfully stored extracted data for future use");
      }
    }
  } catch (storeError) {
    console.error("Error storing extracted data:", storeError);
    // Continue since we still want to return the data even if storing fails
  }
  
  // Update user profile data
  try {
    await updateUserProfile(supabaseUrl, supabaseKey, userId, extractedData);
  } catch (updateError) {
    console.error("Error updating user profile:", updateError);
    // Continue since we still want to return the data even if updating fails
  }
  
  return new Response(
    JSON.stringify(extractedData),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

/**
 * Enhance user profile based on all available CVs
 */
async function enhanceUserProfile(userId: string, signal: AbortSignal) {
  // Get Supabase credentials
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  
  if (!supabaseUrl || !supabaseKey) {
    return new Response(
      JSON.stringify({ error: 'Server configuration error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  // Get all CVs for the user
  const cvs = await getUserCVs(supabaseUrl, supabaseKey, userId);
  if (!cvs || cvs.length === 0) {
    return new Response(
      JSON.stringify({ error: 'No CVs found for this user' }),
      { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  // Process each CV
  const extractedData: any[] = [];
  
  for (const cv of cvs) {
    try {
      // Get signed URL for the document
      const signedUrl = await getSignedURL(supabaseUrl, supabaseKey, cv.filepath);
      if (!signedUrl) continue;
      
      // Download document content
      const { fileContent, fileContentDescription, error } = 
        await downloadDocumentContent(signedUrl, cv);
      
      if (error || !fileContentDescription) continue;
      
      // Extract data from the CV
      const cvData = await extractDataWithOpenAI(fileContentDescription, signal);
      if (cvData.error) continue;
      
      // Store the raw extracted data in cv_extracted_data table
      await fetch(`${supabaseUrl}/rest/v1/cv_extracted_data`, {
        method: 'POST',
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({
          user_id: userId,
          document_id: cv.id,
          extracted_data: cvData
        })
      });
      
      extractedData.push(cvData);
    } catch (error) {
      console.error(`Error processing CV ${cv.id}:`, error);
      continue;
    }
  }

  if (extractedData.length === 0) {
    return new Response(
      JSON.stringify({ error: 'Could not extract data from any CVs' }),
      { status: 422, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  // For simplicity, we'll just use the first CV's data
  // In a production system, you'd want to merge data from multiple CVs
  const profileData = extractedData[0];
  
  // Update user profile in database
  const updateResult = await updateUserProfile(supabaseUrl, supabaseKey, userId, profileData);
  
  if (updateResult.error) {
    return new Response(
      JSON.stringify({ error: updateResult.error }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  return new Response(
    JSON.stringify({ success: true, profile: profileData }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}
