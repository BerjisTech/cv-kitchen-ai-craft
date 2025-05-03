
// Get a reference to the original file to see its structure
import { corsHeaders } from "../utils/cors.ts";

/**
 * Extracts structured data from CV content using OpenAI
 */
export async function extractDataWithOpenAI(content: string | null, signal?: AbortSignal) {
  try {
    if (!content) {
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

    const payload = {
      model: "gpt-4o-mini", // Using gpt-4o-mini for better performance and cost balance
      messages: [
        {
          role: "system",
          content: `Extract structured data from this CV/resume content. Include the following fields when available:
          - fullName: The candidate's full name
          - title: Professional title/role
          - contact: Object containing email, phone, location, website, LinkedIn URL, GitHub URL
          - summary: A concise professional summary
          - skills: Array of skills mentioned
          - experience: Array of work experiences with company, role, start date, end date, and description
          - education: Array of educational experiences with school, degree, dates, and description
          - certifications: Array of certifications with name, issuer, and date
          - languages: Array of languages with language name and proficiency level
          
          Format the data as a clean, structured JSON object. If certain sections are not found in the CV, either omit them or include them with minimal placeholder values.`
        },
        {
          role: "user",
          content: content
        }
      ],
      temperature: 0.2, // Lower temperature for more consistent, factual extraction
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
      const errorData = await apiResponse.json();
      console.error("OpenAI API error:", errorData);
      return {
        error: `AI service error: ${errorData.error?.message || apiResponse.statusText}`
      };
    }

    const result = await apiResponse.json();
    const generatedContent = result.choices[0].message.content;

    try {
      // Try to parse the response as JSON
      const jsonStart = generatedContent.indexOf('{');
      const jsonEnd = generatedContent.lastIndexOf('}');
      
      if (jsonStart >= 0 && jsonEnd > jsonStart) {
        const jsonContent = generatedContent.substring(jsonStart, jsonEnd + 1);
        const extractedData = JSON.parse(jsonContent);
        return extractedData;
      } else {
        console.error("Failed to parse AI response as JSON");
        return {
          error: "Failed to parse extracted data: AI response was not valid JSON"
        };
      }
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
