
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
    const documentResponse = await fetch(
      `${supabaseUrl}/rest/v1/user_documents?id=eq.${documentId}&select=*`,
      {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    if (!documentResponse.ok) {
      const errorText = await documentResponse.text();
      console.error("Failed to retrieve document:", errorText);
      return new Response(
        JSON.stringify({ error: `Failed to retrieve document: ${errorText}` }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const documents = await documentResponse.json();
    
    if (!documents || documents.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Document not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const document = documents[0];
    console.log("Found document:", document);
    
    // Get a signed URL to download the document
    let signedURLRequest = `${supabaseUrl}/storage/v1/object/sign/career-uploads/${document.filepath}`;
    console.log("Generating signed URL from:", signedURLRequest);
    
    const storageResponse = await fetch(
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
    
    if (!storageResponse.ok) {
      const errorText = await storageResponse.text();
      console.error("Failed to get document download URL:", errorText);
      return new Response(
        JSON.stringify({ error: `Failed to get document download URL: ${errorText}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
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
    const fileResponse = await fetch(fullSignedUrl);
    if (!fileResponse.ok) {
      console.error("Failed to download document content, status:", fileResponse.status);
      return new Response(
        JSON.stringify({ error: `Failed to download document content: ${fileResponse.statusText}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Get file content as text or blob depending on the file type
    console.log("Document file type:", document.file_type);
    const fileContent = document.file_type?.includes('pdf') 
      ? await fileResponse.blob()
      : await fileResponse.text();
    
    // Use OpenAI to extract data from the CV
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    
    if (!openAIApiKey) {
      return new Response(
        JSON.stringify({ error: 'OpenAI API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    console.log("Calling OpenAI to extract CV data...");
    
    // For PDFs, we'd need additional processing (potentially through a PDF parsing library)
    // For now, we'll handle text content (like plain text or assuming we've extracted text from a PDF)
    const textContent = document.file_type?.includes('pdf')
      ? `[This is a PDF file named ${document.filename}]` // In a real implementation, we'd extract text from the PDF
      : fileContent;
    
    // Create a prompt for OpenAI to extract structured data from the CV text
    const prompt = `
      Extract detailed structured data from this CV/resume:
      
      ${typeof textContent === 'string' ? textContent.substring(0, 15000) : ''} ${typeof textContent === 'string' && textContent.length > 15000 ? '... [truncated]' : ''}
      
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
      
      Be extremely thorough and extract as much detail as possible. The skills, languages, experience, and education fields should be comprehensive lists.
      If any field can't be determined from the CV, use null or an empty array as appropriate. Ensure the output is valid JSON.
    `;
    
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
            content: 'You are a CV parsing assistant that extracts structured information from resumes and CVs. Return ONLY valid JSON without any other text.' 
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.3,
        response_format: { type: "json_object" }
      })
    });
    
    if (!openAIResponse.ok) {
      const errorText = await openAIResponse.text();
      console.error("OpenAI API error:", errorText);
      return new Response(
        JSON.stringify({ error: `Failed to extract data from CV: API error` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const openAIData = await openAIResponse.json();
    console.log("OpenAI response received");
    
    if (!openAIData.choices || openAIData.choices.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Failed to extract data from CV: No content generated' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    let extractedData;
    try {
      extractedData = JSON.parse(openAIData.choices[0].message.content);
      console.log("Successfully extracted CV data");
    } catch (error) {
      console.error("Error parsing OpenAI response as JSON:", error);
      console.error("Response content:", openAIData.choices[0].message.content);
      return new Response(
        JSON.stringify({ error: 'Failed to parse extracted CV data as JSON' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Store the extracted data in a dedicated table for future use
    try {
      // Check if entry exists for this user and document
      const existingDataResponse = await fetch(
        `${supabaseUrl}/rest/v1/cv_extracted_data?user_id=eq.${userId}&document_id=eq.${documentId}`,
        {
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      const existingData = await existingDataResponse.json();
      let dbResult;
      
      if (existingData && existingData.length > 0) {
        // Update existing record
        dbResult = await fetch(
          `${supabaseUrl}/rest/v1/cv_extracted_data?id=eq.${existingData[0].id}`,
          {
            method: 'PATCH',
            headers: {
              'apikey': supabaseKey,
              'Authorization': `Bearer ${supabaseKey}`,
              'Content-Type': 'application/json',
              'Prefer': 'return=minimal'
            },
            body: JSON.stringify({
              extracted_data: extractedData,
              updated_at: new Date().toISOString()
            })
          }
        );
      } else {
        // Create new record
        dbResult = await fetch(
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
              user_id: userId,
              document_id: documentId,
              extracted_data: extractedData,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
          }
        );
      }
      
      if (!dbResult.ok) {
        const errorText = await dbResult.text();
        console.error("Error saving extracted data to database:", errorText);
        // Continue processing even if saving to DB failed
      } else {
        console.log("Successfully saved extracted data to database");
      }
    } catch (dbError) {
      console.error("Error handling database operations:", dbError);
      // Continue even if DB operations failed
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
