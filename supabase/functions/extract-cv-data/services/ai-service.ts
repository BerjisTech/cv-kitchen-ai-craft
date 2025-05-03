
import { corsHeaders } from "../utils/cors.ts";

/**
 * Extracts structured data from CV content using OpenAI
 */
export async function extractDataWithOpenAI(content: string | null, signal?: AbortSignal) {
  try {
    console.log("Starting AI extraction process");
    
    if (!content) {
      console.error("No content provided for extraction");
      return {
        error: "No content provided for extraction"
      };
    }

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
    5. Return empty arrays for missing sections`;

    console.log("Calling OpenAI API");
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
    const generatedContent = result.choices[0].message.content;
    console.log("Received response from OpenAI");

    try {
      // Parse the JSON response
      const extractedData = JSON.parse(generatedContent);
      console.log("Successfully parsed AI response as JSON");
      return extractedData;
    } catch (parseError) {
      console.error("Error parsing AI response:", parseError);
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
