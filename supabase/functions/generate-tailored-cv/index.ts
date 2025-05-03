
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

    // Get extracted CV data
    const extractedDataResponse = await fetch(`${supabaseUrl}/rest/v1/cv_extracted_data?user_id=eq.${userId}&select=*`, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
    
    let extractedCVData = [];
    if (extractedDataResponse.ok) {
      extractedCVData = await extractedDataResponse.json();
    }

    // Get user skills data
    const skillsResponse = await fetch(`${supabaseUrl}/rest/v1/user_skills?user_id=eq.${userId}&select=*`, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
    
    let userSkills = [];
    if (skillsResponse.ok) {
      userSkills = await skillsResponse.json();
    }

    // Get user experience data
    const experienceResponse = await fetch(`${supabaseUrl}/rest/v1/user_experience?user_id=eq.${userId}&select=*&order=start_date.desc`, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
    
    let userExperience = [];
    if (experienceResponse.ok) {
      userExperience = await experienceResponse.json();
    }

    // Get user education data
    const educationResponse = await fetch(`${supabaseUrl}/rest/v1/user_education?user_id=eq.${userId}&select=*&order=start_year.desc`, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
    
    let userEducation = [];
    if (educationResponse.ok) {
      userEducation = await educationResponse.json();
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
    const prompt = generatePromptForCV(
      jobDescription, 
      profileData, 
      linkedinData, 
      extractedCVData, 
      userSkills, 
      userExperience, 
      userEducation,
      documents
    );
    
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
      console.log("Calling OpenAI to generate tailored CV...");
      
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
              content: 'You are an expert CV writer who helps tailor CVs based on job descriptions. Return a structured JSON response only. Use ONLY the user data provided - do not add fictional data or replace any real user data with placeholders. If the data provided seems insufficient, focus on quality over quantity - be concise but effective with what is available.' 
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
      console.log("OpenAI response received");
      
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
        
        // Check if the generated CV has sufficient information
        const hasSufficientInfo = evaluateCVCompleteness(generatedCV);
        
        if (!hasSufficientInfo) {
          console.warn("Generated CV may be insufficient. Adding recommendations.");
          generatedCV.recommendations = [
            "Your profile contains limited information. Consider uploading more detailed CVs or completing your profile for better results.",
            "Add more work experiences with detailed responsibilities and achievements.",
            "Include specific skills relevant to your industry.",
            "Complete your educational background information."
          ];
        }
        
        console.log("Successfully generated CV content");
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

function evaluateCVCompleteness(cv: any): boolean {
  let score = 0;
  const maxScore = 5;
  
  // Check work experience
  if (cv.workExperience && Array.isArray(cv.workExperience) && cv.workExperience.length > 0) {
    // Check if experiences have substantial content
    const hasDetailedExperiences = cv.workExperience.some((exp: any) => 
      exp.bullets && Array.isArray(exp.bullets) && exp.bullets.length >= 2
    );
    
    score += cv.workExperience.length >= 2 ? 1 : 0.5;
    score += hasDetailedExperiences ? 1 : 0;
  }
  
  // Check skills
  if (cv.skills && Array.isArray(cv.skills) && cv.skills.length >= 5) {
    score += 1;
  } else if (cv.skills && Array.isArray(cv.skills) && cv.skills.length >= 3) {
    score += 0.5;
  }
  
  // Check education
  if (cv.education && Array.isArray(cv.education) && cv.education.length > 0) {
    score += 1;
  }
  
  // Check summary
  if (cv.summary && typeof cv.summary === 'string' && cv.summary.length >= 100) {
    score += 1;
  } else if (cv.summary && typeof cv.summary === 'string' && cv.summary.length >= 50) {
    score += 0.5;
  }
  
  // Calculate final score as percentage
  const percentageScore = (score / maxScore) * 100;
  
  // Consider CV sufficient if it reaches at least 60% of max score
  return percentageScore >= 60;
}

function generatePromptForCV(
  jobDescription: string,
  profileData: any,
  linkedinData: any,
  extractedCVData: any[],
  userSkills: any[],
  userExperience: any[],
  userEducation: any[],
  existingCVs: any[]
) {
  let prompt = `
I need you to create a tailored CV for a job description.
Here's the job description:

${jobDescription}

IMPORTANT: Use ONLY the real user data provided. Do not use placeholder names, emails, or made-up information. If user data is incomplete, leave those sections minimal rather than inventing details.
`;

  // Add profile information
  if (profileData) {
    prompt += `
User profile information:
- Name: ${profileData.full_name || 'Not provided'}
- Email: ${profileData.email || 'Not provided'}
- Phone: ${profileData.phone || 'Not provided'}
- Location: ${profileData.location || 'Not provided'}
${profileData.bio ? `- Bio: ${profileData.bio}` : ''}
${profileData.website ? `- Website: ${profileData.website}` : ''}
${profileData.role ? `- Current Role: ${profileData.role}` : ''}
`;
  }

  // Add skills from user_skills table
  if (userSkills && userSkills.length > 0) {
    prompt += `\nUser Skills:\n`;
    userSkills.forEach((skill: any) => {
      prompt += `- ${skill.name}\n`;
    });
  }

  // Add experience from user_experience table
  if (userExperience && userExperience.length > 0) {
    prompt += `\nUser Work Experience:\n`;
    userExperience.forEach((exp: any, idx: number) => {
      prompt += `
${idx + 1}. ${exp.role || 'Unknown position'} at ${exp.company || 'Unknown company'}
   Duration: ${exp.start_date || 'Unknown'} to ${exp.end_date || 'Present'}
   Description: ${exp.description || 'No description provided'}
`;
    });
  }

  // Add education from user_education table
  if (userEducation && userEducation.length > 0) {
    prompt += `\nUser Education:\n`;
    userEducation.forEach((edu: any, idx: number) => {
      prompt += `
${idx + 1}. ${edu.institution || 'Unknown institution'} - ${edu.degree || 'Unknown degree'}
   Duration: ${edu.start_year || 'Unknown'} to ${edu.end_year || 'Present'}
   ${edu.description ? `Description: ${edu.description}` : ''}
`;
    });
  }

  // Add LinkedIn data
  if (linkedinData) {
    prompt += `\nLinkedIn data:\n`;
    
    if (linkedinData.profile_data) {
      const profile = linkedinData.profile_data;
      prompt += `
Profile Summary: ${profile.summary || 'Not provided'}
`;
    }
    
    if (linkedinData.positions_data && Array.isArray(linkedinData.positions_data)) {
      prompt += `\nLinkedIn Work Experience:\n`;
      linkedinData.positions_data.forEach((position: any, idx: number) => {
        prompt += `
${idx + 1}. ${position.title || 'Unknown position'} at ${position.companyName || 'Unknown company'}
   Duration: ${position.startDate ? `${position.startDate.month}/${position.startDate.year}` : 'Unknown'} to ${position.endDate ? `${position.endDate.month}/${position.endDate.year}` : 'Present'}
   Description: ${position.description || 'No description provided'}
`;
      });
    }
    
    if (linkedinData.education_data && Array.isArray(linkedinData.education_data)) {
      prompt += `\nLinkedIn Education:\n`;
      linkedinData.education_data.forEach((education: any, idx: number) => {
        prompt += `
${idx + 1}. ${education.schoolName || 'Unknown institution'} - ${education.degreeName || 'Unknown degree'} ${education.fieldOfStudy ? `in ${education.fieldOfStudy}` : ''}
   Duration: ${education.startDate ? `${education.startDate.year}` : 'Unknown'} to ${education.endDate ? `${education.endDate.year}` : 'Present'}
`;
      });
    }
    
    if (linkedinData.skills_data && Array.isArray(linkedinData.skills_data)) {
      prompt += `\nLinkedIn Skills:\n`;
      linkedinData.skills_data.forEach((skill: any) => {
        prompt += `- ${skill.name || skill}\n`;
      });
    }
  }

  // Add extracted CV data
  if (extractedCVData && extractedCVData.length > 0) {
    prompt += `\nData extracted from user's CVs:\n`;
    
    extractedCVData.forEach((cvData: any, cvIdx: number) => {
      if (!cvData.extracted_data) return;
      
      const data = cvData.extracted_data;
      prompt += `\nCV #${cvIdx + 1}:\n`;
      
      if (data.title) {
        prompt += `Professional Title: ${data.title}\n`;
      }
      
      if (data.summary) {
        prompt += `Summary: ${data.summary}\n`;
      }
      
      if (data.skills && Array.isArray(data.skills) && data.skills.length > 0) {
        prompt += `Skills from this CV:\n`;
        data.skills.forEach((skill: string) => {
          prompt += `- ${skill}\n`;
        });
      }
      
      if (data.experience && Array.isArray(data.experience) && data.experience.length > 0) {
        prompt += `Experience entries from this CV:\n`;
        data.experience.forEach((exp: any, idx: number) => {
          prompt += `
${idx + 1}. ${exp.role || 'Unknown role'} at ${exp.company || 'Unknown company'}
   Duration: ${exp.start || 'Unknown'} to ${exp.end || 'Present'}
   Description: ${exp.description || 'No description provided'}
`;
        });
      }
      
      if (data.education && Array.isArray(data.education) && data.education.length > 0) {
        prompt += `Education entries from this CV:\n`;
        data.education.forEach((edu: any, idx: number) => {
          prompt += `
${idx + 1}. ${edu.school || 'Unknown institution'} - ${edu.degree || 'Unknown degree'}
   Duration: ${edu.start || 'Unknown'} to ${edu.end || 'Present'}
   ${edu.description ? `Description: ${edu.description}` : ''}
`;
        });
      }
    });
  }

  // Add information about existing CVs
  if (existingCVs && existingCVs.length > 0) {
    prompt += `\nThe user has ${existingCVs.length} existing CV document(s).\n`;
  }

  prompt += `
Based on all the information provided, create a detailed, professional CV tailored for this job. Structure it as a JSON object with the following sections:
1. header (including name, contact info, etc.)
2. summary (tailored to job, highlighting relevant experience and skills)
3. workExperience (array of the most relevant experiences, with focus on achievements and responsibilities that match the job)
4. education (array of educational background)
5. skills (array of relevant skills for this job, prioritized by relevance)
6. certifications (array of relevant certifications if any)

Each work experience should include: title, company, dates, and bullets (array of accomplishments, with quantifiable achievements when possible).
Each education item should include: degree, institution, and year.

MAKE THIS CV STAND OUT:
- Ensure the summary is concise but compelling, highlighting why the candidate is perfect for this role
- Use strong action verbs in work experience bullets
- Highlight achievements with metrics/numbers when possible
- Focus on quality over quantity - better to have fewer but more impactful bullet points 
- Tailor the skills specifically to the job requirements, not just listing all skills

Return ONLY a valid JSON object without any explanation or additional text.

FINAL REMINDER: Use the user's actual data as provided. DO NOT use placeholder names like "John Smith" or fictional data. If information is missing, keep it minimal rather than inventing details.
`;

  return prompt;
}
