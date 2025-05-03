
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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

    // Get document information
    let documentResponse;
    try {
      documentResponse = await fetch(
        `${supabaseUrl}/rest/v1/user_documents?id=eq.${documentId}&select=*`,
        {
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json'
          }
        }
      );
    } catch (fetchError) {
      console.error("Network error fetching document:", fetchError);
      return new Response(
        JSON.stringify({ error: `Network error: Could not connect to database` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    if (!documentResponse.ok) {
      const errorText = await documentResponse.text();
      console.error("Failed to retrieve document:", errorText);
      return new Response(
        JSON.stringify({ error: `Failed to retrieve document info: ${errorText}` }),
        { status: documentResponse.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const documents = await documentResponse.json();
    
    if (!documents || documents.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Document not found in database' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const document = documents[0];
    console.log("Found document:", document);
    
    // Before proceeding, check if we already have extracted data for this document
    try {
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
          if (extractedData.summary && (
              typeof extractedData.summary === 'string' && 
              (extractedData.summary.includes('placeholder') || 
              extractedData.summary.includes('could not be processed')))) {
            
            console.log("Found placeholder data for document:", documentId, "- deleting it to force re-extraction");
            
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
          } else if (!extractedData.summary?.includes('placeholder')) {
            console.log("Using existing extracted data for document:", documentId);
            return new Response(
              JSON.stringify(existingData[0].extracted_data),
              { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }
        }
      }
    } catch (err) {
      console.error("Error checking for existing data:", err);
      // Continue with extraction if error checking cache
    }
    
    // Generate a signed URL to download the document
    const signedURLRequest = `${supabaseUrl}/storage/v1/object/sign/career-uploads/${document.filepath}`;
    console.log("Generating signed URL from:", signedURLRequest);
    
    let storageResponse;
    try {
      storageResponse = await fetch(
        signedURLRequest,
        {
          method: 'POST',
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ expiresIn: 300 })
        }
      );
    } catch (signError) {
      console.error("Network error generating signed URL:", signError);
      return new Response(
        JSON.stringify({ 
          error: `Network error: Could not generate file access URL`,
          documentName: document.filename
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    if (!storageResponse.ok) {
      const errorText = await storageResponse.text();
      console.error("Failed to get document download URL:", errorText);
      return new Response(
        JSON.stringify({ 
          error: `Storage error: File may not exist in the storage bucket`,
          documentName: document.filename
        }),
        { status: 422, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const { signedURL } = await storageResponse.json();
    console.log("Got signed URL for document:", signedURL);
    
    // Make sure URL is absolute
    const fullSignedUrl = signedURL.startsWith('http') 
      ? signedURL 
      : `${supabaseUrl}${signedURL.startsWith('/') ? '' : '/'}${signedURL}`;
    
    console.log("Using full signed URL:", fullSignedUrl);
    
    // Download the document content
    let fileResponse;
    try {
      fileResponse = await fetch(fullSignedUrl);
    } catch (downloadError) {
      console.error("Network error downloading file:", downloadError);
      return new Response(
        JSON.stringify({ 
          error: `Network error: Could not download the file`,
          documentName: document.filename
        }),
        { status: 422, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    if (!fileResponse.ok) {
      console.error("Failed to download document content, status:", fileResponse.status);
      return new Response(
        JSON.stringify({ 
          error: `Failed to download document: the file seems to be inaccessible`,
          documentName: document.filename 
        }),
        { status: 422, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    let fileContent;
    let fileContentDescription;
    
    console.log("Document file type:", document.file_type);
    
    try {
      // Handle different file types
      if (document.file_type?.includes('pdf')) {
        try {
          // For PDFs, we just get a blob and inform the OpenAI API this is a PDF
          fileContent = await fileResponse.blob();
          if (fileContent.size === 0) {
            return new Response(
              JSON.stringify({ 
                error: `The PDF file appears to be empty or corrupted`,
                documentName: document.filename 
              }),
              { status: 422, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }
          fileContentDescription = `This is a PDF document named "${document.filename}" that contains a CV/resume.`;
        } catch (pdfError) {
          console.error("Error processing PDF:", pdfError);
          return new Response(
            JSON.stringify({ 
              error: `Failed to process PDF document: ${pdfError.message}`,
              documentName: document.filename 
            }),
            { status: 422, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      } else {
        try {
          // For text documents, extract the content
          fileContent = await fileResponse.text();
          if (!fileContent || fileContent.length < 50) {
            return new Response(
              JSON.stringify({ 
                error: `The document appears to be empty or contains too little text to process`,
                documentName: document.filename 
              }),
              { status: 422, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }
          fileContentDescription = `${fileContent.substring(0, 15000)}${fileContent.length > 15000 ? '... [truncated]' : ''}`;
        } catch (textError) {
          console.error("Error processing text document:", textError);
          return new Response(
            JSON.stringify({ 
              error: `Failed to process text document: ${textError.message}`,
              documentName: document.filename 
            }),
            { status: 422, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      }
    } catch (fileError) {
      console.error("Error reading document content:", fileError);
      return new Response(
        JSON.stringify({ 
          error: `Failed to read document content: ${fileError.message}`,
          documentName: document.filename 
        }),
        { status: 422, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Use OpenAI to extract data from the CV
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    
    if (!openAIApiKey) {
      return new Response(
        JSON.stringify({ error: 'OpenAI API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    console.log("Calling OpenAI to extract CV data...");
    
    // Create a prompt for OpenAI to extract structured data from the CV text
    const prompt = `
      Extract detailed structured data from this CV/resume:
      
      ${fileContentDescription}
      
      Return a complete JSON object with the following structure:
      {
        "fullName": "person's full name",
        "title": "professional title/role",
        "contact": {
          "email": "email address",
          "phone": "phone number",
          "location": "city, country or region",
          "website": "personal website or portfolio URL",
          "linkedin": "LinkedIn profile URL",
          "github": "GitHub profile URL"
        },
        "summary": "professional summary or objective (detailed)",
        "skills": ["skill1", "skill2", ...],
        "experience": [
          {
            "company": "company name",
            "role": "job title",
            "start": "start date (YYYY-MM format)",
            "end": "end date (YYYY-MM format) or 'Present'",
            "description": "job responsibilities and achievements"
          },
          ...
        ],
        "education": [
          {
            "school": "institution name",
            "degree": "degree name",
            "start": "start year",
            "end": "end year or 'Present'",
            "description": "additional information about the education"
          },
          ...
        ],
        "languages": [
          {
            "language": "language name",
            "proficiency": "proficiency level"
          },
          ...
        ],
        "certifications": [
          {
            "name": "certification name",
            "issuer": "issuing organization",
            "date": "date obtained"
          },
          ...
        ]
      }
      
      IMPORTANT INSTRUCTIONS:
      - Be extremely thorough and extract as much detail as possible.
      - If a field can't be determined from the CV, use null or an empty array as appropriate. 
      - Do not make up or generate fictional data for any field.
      - DO NOT include a message saying the file couldn't be processed - just return the data structure with null values for fields you couldn't extract.
      - Ensure the output is valid JSON.
      - Fields can be null but the overall structure should be maintained.
      - NEVER include placeholder text in any field, especially in the summary.
      - If you cannot extract enough information to create a meaningful profile, return: { "error": "Not enough data to create a meaningful profile" }
    `;
    
    try {
      const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openAIApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { 
              role: 'system', 
              content: 'You are a CV parsing assistant that extracts structured information from resumes and CVs. Return ONLY valid JSON without any other text. Never fabricate data - if you cannot extract information, return null values or empty arrays. If you cannot extract enough information to create a meaningful profile, return an error message.' 
            },
            { role: 'user', content: prompt }
          ],
          temperature: 0, // Using zero temperature for deterministic, factual responses
          response_format: { type: "json_object" }
        })
      });
      
      if (!openAIResponse.ok) {
        const errorText = await openAIResponse.text();
        console.error("OpenAI API error:", errorText);
        return new Response(
          JSON.stringify({ error: `AI processing error: ${errorText.substring(0, 100)}` }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      const openAIData = await openAIResponse.json();
      console.log("OpenAI response received");
      
      if (!openAIData.choices || openAIData.choices.length === 0) {
        console.error("No content generated from OpenAI");
        return new Response(
          JSON.stringify({ error: "Failed to extract data from CV", documentName: document.filename }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      let extractedData;
      try {
        extractedData = JSON.parse(openAIData.choices[0].message.content);
        
        // Check if the extraction returned an error
        if (extractedData.error) {
          console.log("OpenAI returned an error:", extractedData.error);
          return new Response(
            JSON.stringify({ 
              error: extractedData.error, 
              documentName: document.filename 
            }),
            { status: 422, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        // Check if the extraction was meaningful or just null/empty values
        const hasRealContent = 
          (extractedData.fullName && extractedData.fullName.length > 3) ||
          (extractedData.summary && extractedData.summary.length > 50 && !extractedData.summary.includes('placeholder')) ||
          (extractedData.skills && extractedData.skills.length > 2) ||
          (extractedData.experience && extractedData.experience.length > 0 && extractedData.experience[0].company);
        
        if (!hasRealContent) {
          console.log("Extraction resulted in minimal or no useful data");
          return new Response(
            JSON.stringify({ 
              error: "Could not extract meaningful data from this document", 
              documentName: document.filename 
            }),
            { status: 422, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        console.log("Successfully extracted CV data");
        
        // Don't store in database here, let the client handle that
        return new Response(
          JSON.stringify(extractedData),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
        
      } catch (error) {
        console.error("Error parsing OpenAI response as JSON:", error);
        console.error("Response content:", openAIData.choices[0].message.content);
        return new Response(
          JSON.stringify({ error: "Failed to parse extracted data", documentName: document.filename }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    } catch (openAIError) {
      console.error("OpenAI processing error:", openAIError);
      return new Response(
        JSON.stringify({ error: `Failed to process CV with AI: ${openAIError.message}`, documentName: document.filename }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
  } catch (error) {
    console.error('Error in extract-cv-data function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
