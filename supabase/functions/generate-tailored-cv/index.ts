
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
    const { jobDescription, userId, analysisId } = await req.json();
    
    if (!jobDescription || !userId || !analysisId) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create Supabase client for accessing user data
    const supabaseUrl = Deno.env.get('SUPABASE_URL') as string;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') as string;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get job analysis to ensure it exists
    const { data: analysisData, error: analysisError } = await supabase
      .from('job_analyses')
      .select('*')
      .eq('id', analysisId)
      .maybeSingle();
      
    if (analysisError || !analysisData) {
      console.error('Error retrieving analysis:', analysisError);
      return new Response(
        JSON.stringify({ error: 'Analysis not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get user profile data
    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    // Get LinkedIn data if available
    const { data: linkedinData } = await supabase
      .from('linkedin_profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    // Fetch existing CV documents
    const { data: documents } = await supabase
      .from('user_documents')
      .select('*')
      .eq('user_id', userId)
      .eq('document_type', 'cv');

    // Prepare the prompt with all available user data
    const prompt = generatePromptForCV(jobDescription, profileData, linkedinData, documents);
    
    // Call OpenAI API to generate tailored CV content
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    
    if (!openAIApiKey) {
      return new Response(
        JSON.stringify({ error: 'OpenAI API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { 
            role: 'system', 
            content: 'You are an expert CV writer who helps tailor CVs based on job descriptions. Return a structured JSON response only.' 
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        response_format: { type: "json_object" },
      }),
    });

    if (!openAIResponse.ok) {
      const errorText = await openAIResponse.text();
      console.error('OpenAI API error:', errorText);
      return new Response(
        JSON.stringify({ error: `OpenAI API error: ${errorText}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const openAIData = await openAIResponse.json();
    
    if (!openAIData.choices || openAIData.choices.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No response generated from OpenAI' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    let generatedCV;
    try {
      generatedCV = JSON.parse(openAIData.choices[0].message.content);
    } catch (parseError) {
      console.error('Error parsing OpenAI response as JSON:', parseError);
      return new Response(
        JSON.stringify({ error: 'Failed to parse AI generated content as JSON' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Store the generated CV
    const { data: cvData, error: cvError } = await supabase
      .from('tailored_cvs')
      .insert([{
        user_id: userId,
        analysis_id: analysisId,
        job_description: jobDescription,
        cv_content: generatedCV,
        template: 'modern',
      }])
      .select()
      .maybeSingle();
      
    if (cvError) {
      console.error('Failed to save generated CV:', cvError);
      return new Response(
        JSON.stringify({ error: `Failed to save generated CV: ${cvError.message}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify(cvData),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in generate-tailored-cv function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// Helper function to create a Supabase client
function createClient(supabaseUrl: string, supabaseKey: string) {
  return {
    from: (table: string) => ({
      select: (columns: string) => ({
        eq: (column: string, value: any) => ({
          single: () => fetchFromSupabase(supabaseUrl, supabaseKey, table, columns, column, value, true),
          limit: (limit: number) => fetchFromSupabase(supabaseUrl, supabaseKey, table, columns, column, value, false, limit),
          maybeSingle: () => fetchFromSupabase(supabaseUrl, supabaseKey, table, columns, column, value, true, 1, true)
        })
      }),
      insert: (data: any) => ({
        select: () => ({
          single: () => insertIntoSupabase(supabaseUrl, supabaseKey, table, data),
          maybeSingle: () => insertIntoSupabase(supabaseUrl, supabaseKey, table, data, true)
        })
      })
    })
  };
}

async function fetchFromSupabase(
  url: string, 
  key: string, 
  table: string, 
  columns: string, 
  filterColumn: string, 
  filterValue: any, 
  single = false, 
  limit?: number,
  maybeSingle = false
) {
  let endpoint = `${url}/rest/v1/${table}?select=${columns}&${filterColumn}=eq.${filterValue}`;
  
  if (limit) {
    endpoint += `&limit=${limit}`;
  }
  
  try {
    const response = await fetch(endpoint, {
      headers: {
        'apikey': key,
        'Authorization': `Bearer ${key}`
      }
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Error fetching from ${table}:`, errorText);
      return { data: null, error: { message: errorText } };
    }
    
    const data = await response.json();
    
    if (single && !maybeSingle && data.length === 0) {
      return { data: null, error: { message: 'No record found' } };
    }
    
    return { 
      data: single ? (data.length > 0 ? data[0] : null) : data,
      error: null 
    };
  } catch (error) {
    console.error(`Error in fetchFromSupabase for ${table}:`, error);
    return { data: null, error };
  }
}

async function insertIntoSupabase(
  url: string, 
  key: string, 
  table: string, 
  data: any,
  maybeSingle = false
) {
  try {
    const response = await fetch(`${url}/rest/v1/${table}`, {
      method: 'POST',
      headers: {
        'apikey': key,
        'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: Array.isArray(data) ? JSON.stringify(data) : JSON.stringify([data])
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error(`Error inserting into ${table}:`, errorData);
      return { error: { message: JSON.stringify(errorData) } };
    }
    
    const responseData = await response.json();
    return { 
      data: maybeSingle ? responseData[0] : responseData, 
      error: null 
    };
  } catch (error) {
    console.error(`Error in insertIntoSupabase for ${table}:`, error);
    return { data: null, error };
  }
}

function generatePromptForCV(
  jobDescription: string, 
  profileData: any, 
  linkedinData: any, 
  existingCVs: any[]
) {
  let prompt = `
I need you to create a tailored CV for a job description. 
Here's the job description:

${jobDescription}

`;

  if (profileData) {
    prompt += `
User profile information:
- Name: ${profileData.full_name || 'Not provided'}
${profileData.bio ? `- Bio: ${profileData.bio}` : ''}
`;
  }

  if (linkedinData) {
    prompt += `\nLinkedIn data:\n`;
    
    if (linkedinData.profile_data) {
      const profile = linkedinData.profile_data;
      prompt += `
Profile Summary: ${profile.summary || 'Not provided'}
`;
    }
    
    if (linkedinData.positions_data && Array.isArray(linkedinData.positions_data)) {
      prompt += `\nWork Experience:\n`;
      linkedinData.positions_data.forEach((position: any, idx: number) => {
        prompt += `
${idx + 1}. ${position.title || 'Unknown position'} at ${position.companyName || 'Unknown company'}
   Duration: ${position.startDate ? `${position.startDate.month}/${position.startDate.year}` : 'Unknown'} to ${position.endDate ? `${position.endDate.month}/${position.endDate.year}` : 'Present'}
   Description: ${position.description || 'No description provided'}
`;
      });
    }
    
    if (linkedinData.education_data && Array.isArray(linkedinData.education_data)) {
      prompt += `\nEducation:\n`;
      linkedinData.education_data.forEach((education: any, idx: number) => {
        prompt += `
${idx + 1}. ${education.schoolName || 'Unknown institution'} - ${education.degreeName || 'Unknown degree'} ${education.fieldOfStudy ? `in ${education.fieldOfStudy}` : ''}
   Duration: ${education.startDate ? `${education.startDate.year}` : 'Unknown'} to ${education.endDate ? `${education.endDate.year}` : 'Present'}
`;
      });
    }
    
    if (linkedinData.skills_data && Array.isArray(linkedinData.skills_data)) {
      prompt += `\nSkills:\n`;
      linkedinData.skills_data.forEach((skill: any) => {
        prompt += `- ${skill.name || skill}\n`;
      });
    }
  }

  if (existingCVs && existingCVs.length > 0) {
    prompt += `\nThe user has ${existingCVs.length} existing CV document(s).\n`;
  }

  prompt += `
Based on the information provided, create a tailored CV for this job. Structure it as a JSON object with the following sections:
1. header (including name, contact info, etc.)
2. summary (tailored to job)
3. workExperience (array of the most relevant experiences)
4. education (array of educational background)
5. skills (array of relevant skills for this job)
6. certifications (array of relevant certifications if any)

Each work experience should include: title, company, dates, and bullets (array of accomplishments).
Each education item should include: degree, institution, and year.

Return ONLY a valid JSON object without any explanation or additional text.
`;

  return prompt;
}
