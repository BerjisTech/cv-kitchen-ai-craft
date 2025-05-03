
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
    const { jobDescription, userId, analysisId, userProfile } = await req.json();
    
    if (!jobDescription || !userId || !analysisId) {
      console.error("Missing required parameters:", { jobDescription: !!jobDescription, userId: !!userId, analysisId: !!analysisId });
      return new Response(
        JSON.stringify({ error: 'Missing required parameters' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log("Processing request with:", { userId, analysisId });

    // Create Supabase client for accessing user data
    const supabaseUrl = Deno.env.get('SUPABASE_URL') as string;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') as string;
    
    if (!supabaseUrl || !supabaseKey) {
      console.error("Missing Supabase configuration");
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get job analysis to ensure it exists using fetch directly instead of client
    const analysisResponse = await fetch(`${supabaseUrl}/rest/v1/job_analyses?id=eq.${analysisId}&select=*`, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
    
    if (!analysisResponse.ok) {
      const errorText = await analysisResponse.text();
      console.error("Error fetching analysis:", errorText);
      return new Response(
        JSON.stringify({ error: `Failed to retrieve analysis: ${errorText}` }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const analysisData = await analysisResponse.json();
    
    if (!analysisData || analysisData.length === 0) {
      console.error("Analysis not found for ID:", analysisId);
      return new Response(
        JSON.stringify({ error: 'Analysis not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log("Analysis found:", { id: analysisData[0].id });

    // Get user profile data - use provided profile first if available
    let profileData = userProfile;
    
    // If no profile was provided in the request, fetch it from the database
    if (!profileData) {
      const profileResponse = await fetch(`${supabaseUrl}/rest/v1/profiles?id=eq.${userId}&select=*`, {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      
      if (profileResponse.ok) {
        const profiles = await profileResponse.json();
        if (profiles && profiles.length > 0) {
          profileData = profiles[0];
        }
      }
    }

    // Get LinkedIn data if available
    const linkedinResponse = await fetch(`${supabaseUrl}/rest/v1/linkedin_profiles?user_id=eq.${userId}&select=*`, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
    
    let linkedinData = null;
    if (linkedinResponse.ok) {
      const linkedinProfiles = await linkedinResponse.json();
      if (linkedinProfiles && linkedinProfiles.length > 0) {
        linkedinData = linkedinProfiles[0];
      }
    }

    // Fetch existing CV documents
    const documentsResponse = await fetch(`${supabaseUrl}/rest/v1/user_documents?user_id=eq.${userId}&document_type=eq.cv&select=*`, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
    
    let documents = [];
    if (documentsResponse.ok) {
      documents = await documentsResponse.json();
    }

    // Extract job title and company from the job description for naming the CV
    let jobTitle = "CV";
    let companyName = "";
    
    // Simple extraction of job title and company name from the job description
    // In a real implementation, we'd use AI to extract these more accurately
    try {
      const jobTitleMatch = jobDescription.match(/(?:job title|position|role|opening for)[:\s]+([^\n.]+)/i);
      if (jobTitleMatch && jobTitleMatch[1]) {
        jobTitle = jobTitleMatch[1].trim();
      }
      
      const companyMatch = jobDescription.match(/(?:company|organization|firm|employer)[:\s]+([^\n.]+)/i);
      if (companyMatch && companyMatch[1]) {
        companyName = companyMatch[1].trim();
      }
    } catch (extractError) {
      console.error("Error extracting job details for naming:", extractError);
    }
    
    // If we couldn't extract a meaningful title, use generic naming
    if (jobTitle === "CV" || jobTitle.length > 50) {
      jobTitle = "Tailored CV";
    }
    
    // Combine title and company if available
    const cvTitle = companyName ? `${jobTitle} - ${companyName}` : jobTitle;

    // Prepare the prompt with all available user data
    const prompt = generatePromptForCV(jobDescription, profileData, linkedinData, documents);
    
    // Call OpenAI API to generate tailored CV content
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    
    if (!openAIApiKey) {
      console.error("OpenAI API key not configured");
      return new Response(
        JSON.stringify({ error: 'OpenAI API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    try {
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
              content: 'You are an expert CV writer who helps tailor CVs based on job descriptions. Return a structured JSON response only. Use ONLY the user data provided - do not add fictional data or replace any real user data with placeholders.' 
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
        console.error("No response from OpenAI");
        return new Response(
          JSON.stringify({ error: 'No response generated from OpenAI' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      let generatedCV;
      try {
        generatedCV = JSON.parse(openAIData.choices[0].message.content);
        
        // Add title to the CV content based on job description
        generatedCV.title = cvTitle;
        
        // Ensure user's real name is used correctly
        if (profileData && profileData.full_name) {
          if (generatedCV.header && generatedCV.header.name) {
            generatedCV.header.name = profileData.full_name;
          } else if (generatedCV.name) {
            generatedCV.name = profileData.full_name;
          }
        }
        
        // Ensure user's real email is used
        if (profileData && profileData.email) {
          if (generatedCV.header && generatedCV.header.email) {
            generatedCV.header.email = profileData.email;
          } else if (generatedCV.contact && generatedCV.contact.email) {
            generatedCV.contact.email = profileData.email;
          } else if (generatedCV.email) {
            generatedCV.email = profileData.email;
          }
        }
        
        // Ensure user's real phone is used
        if (profileData && profileData.phone) {
          if (generatedCV.header && generatedCV.header.phone) {
            generatedCV.header.phone = profileData.phone;
          } else if (generatedCV.contact && generatedCV.contact.phone) {
            generatedCV.contact.phone = profileData.phone;
          } else if (generatedCV.phone) {
            generatedCV.phone = profileData.phone;
          }
        }
      } catch (parseError) {
        console.error('Error parsing OpenAI response as JSON:', parseError);
        return new Response(
          JSON.stringify({ 
            error: 'Failed to parse AI generated content as JSON',
            rawContent: openAIData.choices[0].message.content
          }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Store the generated CV - use a direct fetch request
      const now = new Date().toISOString();
      const newCV = {
        user_id: userId,
        analysis_id: analysisId,
        job_description: jobDescription,
        cv_content: generatedCV,
        template: 'modern',
        created_at: now,
        updated_at: now
      };
      
      const insertResponse = await fetch(`${supabaseUrl}/rest/v1/tailored_cvs`, {
        method: 'POST',
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify(newCV)
      });
      
      if (!insertResponse.ok) {
        const errorText = await insertResponse.text();
        console.error('Failed to save generated CV:', errorText);
        return new Response(
          JSON.stringify({ error: `Failed to save generated CV: ${errorText}` }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const savedCV = await insertResponse.json();
      console.log("Successfully saved CV with ID:", savedCV[0].id);

      return new Response(
        JSON.stringify(savedCV[0]),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } catch (openAIError) {
      console.error("OpenAI or data processing error:", openAIError);
      return new Response(
        JSON.stringify({ error: `Error processing request: ${openAIError.message}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  } catch (error) {
    console.error('Error in generate-tailored-cv function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

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

IMPORTANT: Use ONLY the real user data provided. Do not use placeholder names, emails, or made-up information. If user data is incomplete, leave those sections minimal rather than inventing details.
`;

  if (profileData) {
    prompt += `
User profile information:
- Name: ${profileData.full_name || 'Not provided'}
- Email: ${profileData.email || 'Not provided'}
- Phone: ${profileData.phone || 'Not provided'}
- Location: ${profileData.location || 'Not provided'}
${profileData.bio ? `- Bio: ${profileData.bio}` : ''}
${profileData.website ? `- Website: ${profileData.website}` : ''}
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

FINAL REMINDER: Use the user's actual name (${profileData?.full_name || 'As provided in their profile'}) and contact information. DO NOT use placeholder names like "John Smith" or fictional data.
`;

  return prompt;
}

