
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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
    // Get the OpenAI API key from environment variables
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiApiKey) {
      throw new Error('OpenAI API key not found');
    }

    // Parse request body
    const { jobDescription, userId } = await req.json();

    if (!jobDescription) {
      throw new Error('Job description is required');
    }

    if (!userId) {
      throw new Error('User ID is required');
    }

    // Get Supabase URL and anon key from environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');
    
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Supabase configuration not found');
    }
    
    // We'll access the database directly through the REST API instead of using the client
    // This avoids issues with Supabase client creation in the edge function

    // Call OpenAI API to analyze the job description
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiApiKey}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You are a professional career advisor specializing in analyzing job descriptions and providing actionable insights to job seekers. Your task is to analyze the job description provided and extract key information to help the candidate tailor their application."
          },
          {
            role: "user",
            content: `Analyze this job description and provide insights on the key skills, qualifications, and experience needed. Also suggest how a candidate could tailor their CV to match this job better. Format your response with clear sections. Job description:\n\n${jobDescription}`
          }
        ],
        temperature: 0.7,
        max_tokens: 1500
      })
    });

    const analysisResult = await response.json();
    
    if (!response.ok) {
      console.error('OpenAI API error:', analysisResult);
      throw new Error(`OpenAI API error: ${analysisResult.error?.message || 'Unknown error'}`);
    }

    // Store the analysis in the database using Supabase REST API
    const timestamp = new Date().toISOString();
    const dbResponse = await fetch(`${supabaseUrl}/rest/v1/job_analyses`, {
      method: 'POST',
      headers: {
        'apikey': supabaseAnonKey,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({
        user_id: userId,
        job_description: jobDescription,
        analysis: analysisResult.choices[0].message.content,
        created_at: timestamp,
        updated_at: timestamp
      })
    });

    if (!dbResponse.ok) {
      const dbError = await dbResponse.json();
      console.error('Database error:', dbError);
      throw new Error('Failed to store analysis in database');
    }

    const jobAnalysis = await dbResponse.json();

    return new Response(
      JSON.stringify({
        analysis: analysisResult.choices[0].message.content,
        id: jobAnalysis[0]?.id || null,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in analyze-job-description function:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Unknown error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
