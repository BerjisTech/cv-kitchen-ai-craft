
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
    const { prompt, userId } = await req.json();
    
    if (!prompt || !userId) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    console.log("Processing CV unification request for user:", userId);

    // Get OpenAI API key from environment
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    
    if (!openAIApiKey) {
      return new Response(
        JSON.stringify({ error: 'OpenAI API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    console.log("Calling OpenAI to unify CV data...");
    
    // Check if the prompt contains enough data to process
    if (prompt.length < 200 || !prompt.includes('Work Experience') || !prompt.includes('Education')) {
      return new Response(
        JSON.stringify({ error: "Not enough CV data provided to create a meaningful profile" }),
        { status: 422, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Call OpenAI API to process the data
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini', // Using a capable model for complex data consolidation
        messages: [
          { 
            role: 'system', 
            content: 'You are a CV parsing specialist that merges information from multiple sources into a single comprehensive profile. Return ONLY valid JSON without any other text. Use only actual data from the provided sources - NEVER invent or generate generic data where information is missing. NEVER return placeholder content. Return null values rather than inventing data. If the input is low quality or missing essential information, simply return an error message indicating that there is not enough information to create a meaningful profile.'
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.0,  // Using temperature 0 for most consistent output without creativity
        response_format: { type: "json_object" }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenAI API error:", errorText);
      return new Response(
        JSON.stringify({ error: `OpenAI API error: ${errorText}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const data = await response.json();
    console.log("OpenAI response received");
    
    if (!data.choices || data.choices.length === 0) {
      console.error("No content generated from OpenAI");
      return new Response(
        JSON.stringify({ error: "Failed to generate unified profile" }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    let unifiedData;
    try {
      unifiedData = JSON.parse(data.choices[0].message.content);
      console.log("Successfully processed unified CV data");
      
      // Check if we got generic/placeholder data in any field
      const hasPlaceholder = (text) => {
        if (!text) return false;
        return text.includes("placeholder") || 
               text.includes("could not be processed") ||
               text.includes("Experienced professional with") ||
               text.includes("not enough information");
      };
      
      if (unifiedData.error) {
        return new Response(
          JSON.stringify({ error: unifiedData.error }),
          { status: 422, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      if (hasPlaceholder(unifiedData.summary)) {
        return new Response(
          JSON.stringify({ error: "Failed to extract meaningful data from your CVs" }),
          { status: 422, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      // Check if result is meaningful based on required fields
      const isMeaningful = unifiedData.fullName && 
                         unifiedData.summary && 
                         unifiedData.summary.length > 50 &&
                         Array.isArray(unifiedData.skills) && 
                         unifiedData.skills.length > 0;
      
      if (!isMeaningful) {
        return new Response(
          JSON.stringify({ error: "Could not extract enough meaningful data from your documents" }),
          { status: 422, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    } catch (error) {
      console.error("Error parsing OpenAI response as JSON:", error);
      return new Response(
        JSON.stringify({ error: "Failed to parse unified profile data" }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify(unifiedData),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error('Error in unify-cv-data function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
