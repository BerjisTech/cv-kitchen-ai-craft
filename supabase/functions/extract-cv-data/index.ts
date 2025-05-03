
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
      return new Response(
        JSON.stringify(existingData),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get document information
    const document = await getDocument(supabaseUrl, supabaseKey, documentId);
    if (!document) {
      return new Response(
        JSON.stringify({ error: 'Document not found in database' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    console.log("Found document:", document);

    // Generate signed URL for document download
    const signedURL = await getSignedURL(supabaseUrl, supabaseKey, document.filepath);
    if (!signedURL) {
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
      return new Response(
        JSON.stringify({ 
          error: downloadError,
          documentName: document.filename 
        }),
        { status: 422, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Process with AI
    const extractedData = await extractDataWithOpenAI(fileContentDescription);
    if (extractedData.error) {
      return new Response(
        JSON.stringify({ 
          error: extractedData.error, 
          documentName: document.filename 
        }),
        { status: 422, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    return new Response(
      JSON.stringify(extractedData),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error('Error in extract-cv-data function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
