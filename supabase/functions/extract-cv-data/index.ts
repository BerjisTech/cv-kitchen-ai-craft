
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
    const supabaseUrl = Deno.env.get('SUPABASE_URL') as string;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') as string;
    
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
    
    // Get a signed URL to download the document
    const storageResponse = await fetch(
      `${supabaseUrl}/storage/v1/object/sign/career-uploads/${document.filepath}`,
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
      return new Response(
        JSON.stringify({ error: `Failed to get document download URL: ${errorText}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const { signedURL } = await storageResponse.json();
    
    // Use OpenAI to extract data from the CV
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    
    if (!openAIApiKey) {
      return new Response(
        JSON.stringify({ error: 'OpenAI API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // For now, we'll just return a mock response
    // In a real implementation, you'd use OpenAI to analyze the document
    // and extract the relevant information
    
    const mockCVData = {
      fullName: "John Smith",
      title: "Senior Frontend Developer",
      contact: {
        email: "john.smith@example.com",
        phone: "+1 (555) 123-4567",
        location: "San Francisco, CA",
        website: "johnsmith.dev"
      },
      summary: "Experienced frontend developer with 5+ years of experience building modern web applications using React, TypeScript, and related technologies.",
      skills: ["React", "TypeScript", "JavaScript", "HTML", "CSS", "Tailwind CSS", "Node.js", "GraphQL"],
      experience: [
        {
          company: "Tech Solutions Inc.",
          role: "Senior Frontend Developer",
          start: "2021-01",
          end: "Present",
          description: "Lead frontend development for multiple client projects using React and TypeScript."
        },
        {
          company: "Web Innovations LLC",
          role: "Frontend Developer",
          start: "2018-03",
          end: "2020-12",
          description: "Developed and maintained web applications for various clients."
        }
      ],
      education: [
        {
          school: "University of Technology",
          degree: "Bachelor of Science in Computer Science",
          start: "2014",
          end: "2018",
          description: "Graduated with honors. Specialized in web development."
        }
      ]
    };
    
    // In a real implementation:
    // 1. Download the file from signedURL
    // 2. Convert the file to text (if PDF) or extract content
    // 3. Use OpenAI to analyze the content and extract structured data
    // 4. Return the structured data

    return new Response(
      JSON.stringify(mockCVData),
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
