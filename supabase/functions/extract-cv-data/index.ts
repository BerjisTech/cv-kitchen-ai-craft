
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
        if (existingData && existingData.length > 0) {
          // Delete the existing cached extraction if it contains placeholder data
          if (existingData[0].extracted_data && 
              typeof existingData[0].extracted_data.summary === 'string' && 
              existingData[0].extracted_data.summary.includes('placeholder')) {
            
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
          } else {
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
        JSON.stringify({ error: `Failed to access document storage: ${errorText}` }),
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
        JSON.stringify({ error: `Failed to download document content: ${fileResponse.status}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    let fileContent;
    let fileContentDescription;
    
    console.log("Document file type:", document.file_type);
    
    // Handle different file types
    if (document.file_type?.includes('pdf')) {
      // For PDFs, we just get a blob and inform the OpenAI API this is a PDF
      fileContent = await fileResponse.blob();
      fileContentDescription = `This is a PDF document named "${document.filename}". As you don't have direct PDF parsing capabilities, please inform the user that PDF extraction is currently limited, and they should consider uploading a text-based CV for better results.`;
    } else {
      // For text documents, extract the content
      fileContent = await fileResponse.text();
      fileContentDescription = `${fileContent.substring(0, 15000)}${fileContent.length > 15000 ? '... [truncated]' : ''}`;
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
      - Be extremely thorough and extract as much detail as possible. The skills, languages, experience, and education fields should be comprehensive lists.
      - If a field can't be determined from the CV, use null or an empty array as appropriate. 
      - Do not make up or generate fictional data for any field.
      - If you cannot extract meaningful information (especially for PDFs), set the respective fields to null and DO NOT generate placeholder or fictional data.
      - DO NOT include a message saying the file couldn't be processed - just return the data structure with null values for fields you couldn't extract.
      - Ensure the output is valid JSON.
      - Fields can be null but the overall structure should be maintained.
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
              content: 'You are a CV parsing assistant that extracts structured information from resumes and CVs. Return ONLY valid JSON without any other text. Never fabricate data - if you cannot extract information, return null values or empty arrays.' 
            },
            { role: 'user', content: prompt }
          ],
          temperature: 0.1, // Using a very low temperature for more deterministic, factual responses
          response_format: { type: "json_object" }
        })
      });
      
      if (!openAIResponse.ok) {
        const errorText = await openAIResponse.text();
        console.error("OpenAI API error:", errorText);
        return new Response(
          JSON.stringify({ error: `OpenAI API error: ${errorText}` }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      const openAIData = await openAIResponse.json();
      console.log("OpenAI response received");
      
      if (!openAIData.choices || openAIData.choices.length === 0) {
        console.error("No content generated from OpenAI");
        return new Response(
          JSON.stringify({ error: "Failed to extract data from CV" }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      let extractedData;
      try {
        extractedData = JSON.parse(openAIData.choices[0].message.content);
        
        // Check if the extraction was meaningful or just null/empty values
        const hasRealContent = 
          (extractedData.fullName && extractedData.fullName !== document.filename.replace(/\.pdf$/i, '')) ||
          (extractedData.summary && !extractedData.summary.includes('placeholder')) ||
          (extractedData.skills && extractedData.skills.length > 0 && !extractedData.skills.includes('Communication')) ||
          (extractedData.experience && extractedData.experience.length > 0);
        
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
      } catch (error) {
        console.error("Error parsing OpenAI response as JSON:", error);
        console.error("Response content:", openAIData.choices[0].message.content);
        return new Response(
          JSON.stringify({ error: "Failed to parse extracted data" }),
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
        } else {
          console.log("Successfully saved extracted data to database");
        }
      } catch (dbError) {
        console.error("Error handling database operations:", dbError);
      }

      return new Response(
        JSON.stringify(extractedData),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } catch (openAIError) {
      console.error("OpenAI processing error:", openAIError);
      return new Response(
        JSON.stringify({ error: `Failed to process CV with AI: ${openAIError.message}` }),
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
