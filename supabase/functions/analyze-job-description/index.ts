
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.43.3";

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

    // Connect to Supabase to get user's CV documents
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || 'https://rnjxbvsodatbxaswmiol.supabase.co';
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJuanhidnNvZGF0Ynhhc3dtaW9sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYyMTM0ODIsImV4cCI6MjA2MTc4OTQ4Mn0.cH4bWWKpDelg6R8OC7E4ytjjALRuIDuS-AHa4Y5gK90';
    
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Get user's most recent CV content (in a real implementation, we'd extract text from PDFs/DOCXs)
    const { data: userDocs } = await supabase
      .from('user_documents')
      .select('*')
      .eq('user_id', userId)
      .eq('document_type', 'cv')
      .order('created_at', { ascending: false })
      .limit(1);

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

    // Store the analysis in the database
    const timestamp = new Date().toISOString();
    const { data: jobAnalysis, error: dbError } = await supabase
      .from('job_analyses')
      .insert({
        user_id: userId,
        job_description: jobDescription,
        analysis: analysisResult.choices[0].message.content,
        created_at: timestamp
      })
      .select()
      .single();

    if (dbError) {
      console.error('Database error:', dbError);
      // Continue anyway as this is not critical - we can still return the analysis
    }

    return new Response(
      JSON.stringify({
        analysis: analysisResult.choices[0].message.content,
        id: jobAnalysis?.id || null,
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
