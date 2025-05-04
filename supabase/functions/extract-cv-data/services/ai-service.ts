
import { corsHeaders } from "../utils/cors.ts";
import type { ExtractedCVData } from "../types.ts";

/**
 * Extracts structured data from CV content using OpenAI
 */
export async function extractDataWithOpenAI(content: string | null, signal?: AbortSignal): Promise<ExtractedCVData | {error: string}> {
  try {
    console.log("Starting AI extraction process");
    
    if (!content) {
      console.error("No content provided for extraction");
      return {
        error: "No content provided for extraction"
      };
    }

    // Log the full content being sent to OpenAI for comprehensive debugging
    console.log("-----BEGINNING OF CONTENT SENT TO OPENAI-----");
    console.log(content);
    console.log("-----END OF CONTENT SENT TO OPENAI-----");
    console.log(`Content length: ${content.length} characters`);
    
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    if (!OPENAI_API_KEY) {
      console.error("OpenAI API key not found in environment variables");
      return {
        error: "Server configuration error: AI service unavailable"
      };
    }

    // Prepare a system prompt that matches our ProfileData structure
    const systemPrompt = `Extract all possible information from this CV/resume and return it in a structured JSON format that matches this specific schema:

    {
      "personal_info": {
        "full_name": "string",
        "location": "string",
        "linkedin_url": "string",
        "website": "string",
        "github_url": "string"
      },
      "summary": "string",
      "work_experience": [{
        "company": "string",
        "role": "string",
        "start_date": "string (YYYY-MM-DD or YYYY-MM)",
        "end_date": "string (YYYY-MM-DD or YYYY-MM or null if current)",
        "description": "string"
      }],
      "education": [{
        "institution": "string",
        "degree": "string",
        "start_year": "string (YYYY)",
        "end_year": "string (YYYY or null if current)",
        "description": "string"
      }],
      "skills": [{
        "name": "string",
        "level": "number (1-5)"
      }],
      "certifications": [{
        "name": "string",
        "issuer": "string",
        "date": "string (YYYY-MM)"
      }],
      "languages": [{
        "language": "string",
        "level": "string (basic, intermediate, fluent, native)"
      }]
    }

    Rules:
    1. Only extract information that is clearly present in the text
    2. Never invent or guess missing information
    3. For dates, use the specified formats
    4. For skills levels, estimate based on context (default to 3 if unsure)
    5. Return empty arrays for missing sections
    6. Be thorough and comprehensive - extract ALL skills, experience, education, and other information present in the CV
    7. Even if the document quality is low, try to extract whatever information you can find
    8. For work experience and education, make sure to include as much detail as possible from the text
    9. Extract at least the name and any other information that can be found
    10. IMPORTANT: Make sure to extract ALL skills mentioned in the CV, even if they're embedded in work descriptions`;

    console.log("-----SYSTEM PROMPT SENT TO OPENAI-----");
    console.log(systemPrompt);
    console.log("-----END OF SYSTEM PROMPT-----");
    
    const payload = {
      model: "gpt-4o-mini", 
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: content
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.1,
      max_tokens: 4000
    };

    console.log("-----FULL PAYLOAD SENT TO OPENAI-----");
    console.log(JSON.stringify(payload, null, 2));
    console.log("-----END OF PAYLOAD-----");
    
    console.log("Sending request to OpenAI API");
    const apiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      signal // Pass the AbortSignal to enable timeout cancellation
    });

    if (!apiResponse.ok) {
      const errorData = await apiResponse.json().catch(() => ({ error: { message: "Unknown API error" }}));
      console.error("OpenAI API error:", errorData);
      return {
        error: `AI service error: ${errorData.error?.message || apiResponse.statusText}`
      };
    }

    const result = await apiResponse.json();
    console.log("-----COMPLETE RAW RESPONSE FROM OPENAI-----");
    console.log(JSON.stringify(result, null, 2));
    console.log("-----END OF RAW RESPONSE-----");
    
    const generatedContent = result.choices[0].message.content;
    console.log("-----EXTRACTED CONTENT FROM OPENAI RESPONSE-----");
    console.log(generatedContent);
    console.log("-----END OF EXTRACTED CONTENT-----");

    try {
      // Parse the JSON response
      const extractedData = JSON.parse(generatedContent);
      console.log("Successfully parsed AI response as JSON");
      console.log("-----PARSED JSON DATA-----");
      console.log(JSON.stringify(extractedData, null, 2));
      console.log("-----END OF PARSED JSON DATA-----");
      
      console.log("Extracted data sections:", Object.keys(extractedData));
      
      // Log details of each section to diagnose what's empty and what's populated
      console.log("Personal info:", JSON.stringify(extractedData.personal_info || {}));
      console.log("Summary:", extractedData.summary || "");
      console.log("Work experience count:", Array.isArray(extractedData.work_experience) ? extractedData.work_experience.length : 0);
      if (Array.isArray(extractedData.work_experience) && extractedData.work_experience.length > 0) {
        console.log("First work experience item:", JSON.stringify(extractedData.work_experience[0]));
      }
      console.log("Education count:", Array.isArray(extractedData.education) ? extractedData.education.length : 0);
      console.log("Skills count:", Array.isArray(extractedData.skills) ? extractedData.skills.length : 0);
      if (Array.isArray(extractedData.skills) && extractedData.skills.length > 0) {
        console.log("First 5 skills (or fewer if less available):", 
          JSON.stringify(extractedData.skills.slice(0, 5)));
      }
      
      // Check if we got all the expected data sections
      if (!extractedData.skills || !extractedData.work_experience || !extractedData.education) {
        console.warn("Some expected data sections are missing from the AI response");
      }
      
      // Ensure the parsed data has the required structure
      const validatedData: ExtractedCVData = {
        personal_info: extractedData.personal_info || { 
          full_name: "", 
          location: "", 
          linkedin_url: "", 
          website: "", 
          github_url: "" 
        },
        summary: extractedData.summary || "",
        work_experience: Array.isArray(extractedData.work_experience) ? extractedData.work_experience : [],
        education: Array.isArray(extractedData.education) ? extractedData.education : [],
        skills: Array.isArray(extractedData.skills) ? extractedData.skills : [],
        certifications: Array.isArray(extractedData.certifications) ? extractedData.certifications : [],
        languages: Array.isArray(extractedData.languages) ? extractedData.languages : []
      };
      
      console.log("-----FINAL VALIDATED DATA TO BE RETURNED-----");
      console.log(JSON.stringify(validatedData, null, 2));
      console.log("-----END OF FINAL VALIDATED DATA-----");
      return validatedData;
    } catch (parseError) {
      console.error("Error parsing AI response:", parseError);
      console.error("Failed to parse response content:", generatedContent);
      return {
        error: "Failed to parse extracted data: Invalid format"
      };
    }
  } catch (error) {
    // Special handling for AbortError from the AbortController
    if (error.name === 'AbortError') {
      console.error('OpenAI request timed out');
      return {
        error: "The extraction process timed out. The file may be too large or complex."
      };
    }
    
    console.error("Error extracting data with OpenAI:", error);
    return {
      error: `AI extraction error: ${error.message}`
    };
  }
}
