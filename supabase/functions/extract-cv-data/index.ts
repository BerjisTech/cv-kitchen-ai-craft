
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
    const { documentId, userId } = await req.json();
    
    if (!documentId || !userId) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get Supabase credentials from environment
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseKey) {
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check for existing extracted data
    const existingData = await checkExistingExtractedData(supabaseUrl, supabaseKey, documentId, userId);
    if (existingData) {
      clearTimeout(timeoutId); // Clear timeout as we're returning cached data
      return new Response(
        JSON.stringify(existingData),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get document information
    const document = await getDocument(supabaseUrl, supabaseKey, documentId);
    if (!document) {
      clearTimeout(timeoutId);
      return new Response(
        JSON.stringify({ 
          error: 'Document not found in database. It may have been deleted.',
          documentId
        }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    console.log("Found document:", document);

    // Generate signed URL for document download
    const signedURL = await getSignedURL(supabaseUrl, supabaseKey, document.filepath);
    if (!signedURL) {
      clearTimeout(timeoutId);
      return new Response(
        JSON.stringify({ 
          error: `Storage error: File may not exist in the storage bucket`,
          documentName: document.filename
        }),
        { status: 422, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Download document content
    const { fileContent, fileContentDescription, error: downloadError } = 
      await downloadDocumentContent(signedURL, document);
    
    if (downloadError) {
      clearTimeout(timeoutId);
      return new Response(
        JSON.stringify({ 
          error: downloadError,
          documentName: document.filename 
        }),
        { status: 422, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Process with AI using the abort signal
    const extractedData = await extractDataWithOpenAI(fileContentDescription, abortController.signal);
    if (extractedData.error) {
      clearTimeout(timeoutId);
      return new Response(
        JSON.stringify({ 
          error: extractedData.error, 
          documentName: document.filename 
        }),
        { status: 422, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
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
