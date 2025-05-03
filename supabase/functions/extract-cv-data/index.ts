import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { corsHeaders } from "./utils/cors.ts";
import { getDocument, getSignedURL, downloadDocumentContent } from "./services/document-service.ts";
import { extractDataWithOpenAI } from "./services/ai-service.ts";
import { checkExistingExtractedData } from "./services/data-service.ts";

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
    let documentId, userId;
    try {
      const requestBody = await req.json();
      documentId = requestBody.documentId;
      userId = requestBody.userId;
      
      console.log(`Processing request for documentId: ${documentId}, userId: ${userId}`);
      
      if (!documentId || !userId) {
        console.error("Missing required parameters");
        clearTimeout(timeoutId);
        return new Response(
          JSON.stringify({ error: 'Missing required parameters' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    } catch (parseError) {
      console.error("Error parsing request JSON:", parseError);
      clearTimeout(timeoutId);
      return new Response(
        JSON.stringify({ error: 'Invalid request format' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get Supabase credentials from environment
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseKey) {
      console.error("Missing Supabase environment variables");
      clearTimeout(timeoutId);
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
        clearTimeout(timeoutId); // Clear timeout as we're returning cached data
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
      clearTimeout(timeoutId);
      
      // Use fallback extraction in this case with generic data
      return generateMockExtraction(documentId, corsHeaders);
    }
    
    console.log("Found document:", document);

    // Generate signed URL for document download
    const signedURL = await getSignedURL(supabaseUrl, supabaseKey, document.filepath);
    if (!signedURL) {
      console.error("Failed to generate signed URL for file:", document.filepath);
      clearTimeout(timeoutId);
      
      // Use fallback extraction with document metadata
      return generateMockExtraction(documentId, corsHeaders, document);
    }
    
    // Download document content
    const { fileContent, fileContentDescription, error: downloadError } = 
      await downloadDocumentContent(signedURL, document);
    
    if (downloadError) {
      console.error("Error downloading document content:", downloadError);
      clearTimeout(timeoutId);
      
      // Use fallback extraction with document metadata
      return generateMockExtraction(documentId, corsHeaders, document);
    }
    
    // Process with AI using the abort signal
    const extractedData = await extractDataWithOpenAI(fileContentDescription, abortController.signal);
    if (extractedData.error) {
      console.error("Error in AI extraction:", extractedData.error);
      clearTimeout(timeoutId);
      
      // Use fallback extraction with document metadata
      return generateMockExtraction(documentId, corsHeaders, document);
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
    
    clearTimeout(timeoutId); // Clear timeout as we're successful
    return new Response(
      JSON.stringify(extractedData),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
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
 * Generates a mock extraction in case of document access issues
 */
function generateMockExtraction(documentId: string, corsHeaders: any, document?: any) {
  console.log("Generating mock extraction from document metadata:", document?.filename || "Unknown document");
  
  // Create a simple placeholder response
  const mockData = {
    fullName: document?.filename?.split('.')[0] || "Document Owner",
    title: "Professional",
    contact: {
      email: "example@email.com",
      phone: "",
      location: ""
    },
    summary: "This is a placeholder summary generated because the document could not be processed. The original file may be inaccessible or in an unsupported format.",
    skills: ["Communication", "Problem Solving", "Teamwork"],
    experience: [{
      company: "Example Company",
      role: "Professional Role",
      start: "2020",
      end: "Present",
      description: "This is placeholder data as the document could not be properly processed."
    }],
    education: [{
      school: "University",
      degree: "Degree",
      start: "2016",
      end: "2020",
      description: ""
    }]
  };

  // Store this placeholder data so we don't keep trying to process the problematic file
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (supabaseUrl && supabaseKey && document) {
      fetch(
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
            user_id: document.user_id,
            extracted_data: mockData
          })
        }
      ).catch(err => console.error("Error storing placeholder data:", err));
    }
  } catch (err) {
    console.error("Error in mock extraction data storage:", err);
  }
  
  return new Response(
    JSON.stringify(mockData),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}
