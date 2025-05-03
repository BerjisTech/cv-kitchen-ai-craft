
/**
 * Extracts structured data from CV content using OpenAI
 */
export async function extractDataWithOpenAI(fileContentDescription: string) {
  const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
  
  if (!openAIApiKey) {
    return { error: 'OpenAI API key not configured' };
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
      return { error: `AI processing error: ${errorText.substring(0, 100)}` };
    }
    
    const openAIData = await openAIResponse.json();
    console.log("OpenAI response received");
    
    if (!openAIData.choices || openAIData.choices.length === 0) {
      console.error("No content generated from OpenAI");
      return { error: "Failed to extract data from CV" };
    }
    
    try {
      const extractedData = JSON.parse(openAIData.choices[0].message.content);
      
      // Check if the extraction returned an error
      if (extractedData.error) {
        console.log("OpenAI returned an error:", extractedData.error);
        return { error: extractedData.error };
      }
      
      // Check if the extraction was meaningful or just null/empty values
      const hasRealContent = 
        (extractedData.fullName && extractedData.fullName.length > 3) ||
        (extractedData.summary && extractedData.summary.length > 50 && !extractedData.summary.includes('placeholder')) ||
        (extractedData.skills && extractedData.skills.length > 2) ||
        (extractedData.experience && extractedData.experience.length > 0 && extractedData.experience[0].company);
      
      if (!hasRealContent) {
        console.log("Extraction resulted in minimal or no useful data");
        return { error: "Could not extract meaningful data from this document" };
      }
      
      console.log("Successfully extracted CV data");
      return extractedData;
      
    } catch (error) {
      console.error("Error parsing OpenAI response as JSON:", error);
      console.error("Response content:", openAIData.choices[0].message.content);
      return { error: "Failed to parse extracted data" };
    }
  } catch (openAIError) {
    console.error("OpenAI processing error:", openAIError);
    return { error: `Failed to process CV with AI: ${openAIError.message}` };
  }
}
