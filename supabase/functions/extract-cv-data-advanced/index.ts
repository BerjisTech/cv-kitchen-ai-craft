
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { extract } from 'https://deno.land/x/pdf_extract@0.1.0/mod.ts';
import { readDocx } from 'https://deno.land/x/docx@v0.1.0/mod.ts';

// Initialize Supabase client
const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_ANON_KEY') ?? '',
  {
    global: {
      headers: { Authorization: `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}` },
    },
  }
);

interface CVFile {
  id: string;
  url: string;
  filename: string;
  type: string;
}

interface ExtractedCVData {
  name: string;
  email: string;
  phone?: string;
  location?: string;
  summary?: string;
  experience: Array<{
    company: string;
    position: string;
    start_date: string;
    end_date?: string;
    description?: string;
  }>;
  education: Array<{
    institution: string;
    degree: string;
    field_of_study?: string;
    start_date: string;
    end_date?: string;
  }>;
  skills: Array<{
    name: string;
    category?: string;
  }>;
  certifications?: Array<{
    name: string;
    issuer: string;
    date?: string;
  }>;
  languages?: Array<{
    name: string;
    proficiency?: string;
  }>;
}

serve(async (req) => {
  try {
    // Enable CORS
    if (req.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
          'Access-Control-Allow-Methods': 'POST',
        },
      });
    }

    const { files }: { files: CVFile[] } = await req.json();

    if (!files || !Array.isArray(files) || files.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No files provided' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Process each file
    const processedData = await Promise.all(
      files.map(async (file) => {
        try {
          // 1. Download the file from storage
          const filePath = file.url.split('/storage/v1/object/public/')[1];
          const { data: fileBytes, error: downloadError } = await supabase.storage
            .from('career-uploads') // Updated bucket name to match your project
            .download(filePath);

          if (downloadError || !fileBytes) {
            console.error('Download error:', downloadError);
            throw new Error('Failed to download file');
          }

          // 2. Extract text based on file type
          let textContent = '';
          if (file.type === 'application/pdf') {
            textContent = await extractTextFromPDF(await fileBytes.arrayBuffer());
          } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
            textContent = await extractTextFromDOCX(await fileBytes.arrayBuffer());
          } else {
            textContent = await fileBytes.text();
          }

          // 3. Process with OpenAI
          const structuredData = await processWithOpenAI(textContent);
          return structuredData;
        } catch (error) {
          console.error(`Error processing file ${file.filename}:`, error);
          return null;
        }
      })
    );

    // Filter out failed processing attempts
    const successfulResults = processedData.filter(Boolean) as ExtractedCVData[];

    // 4. Merge results from multiple CVs
    const mergedData = mergeCVResults(successfulResults);

    return new Response(
      JSON.stringify(mergedData),
      {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  } catch (error) {
    console.error('Error in function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  }
});

// Helper function to extract text from PDF
async function extractTextFromPDF(pdfBuffer: ArrayBuffer): Promise<string> {
  const tempFilePath = await Deno.makeTempFile({ suffix: '.pdf' });
  await Deno.writeFile(tempFilePath, new Uint8Array(pdfBuffer));

  const extractor = await extract(tempFilePath);
  const pages = await extractor.getText();
  await Deno.remove(tempFilePath);

  return pages.map(page => page.lines.join('\n')).join('\n\n');
}

// Helper function to extract text from DOCX
async function extractTextFromDOCX(docxBuffer: ArrayBuffer): Promise<string> {
  const tempFilePath = await Deno.makeTempFile({ suffix: '.docx' });
  await Deno.writeFile(tempFilePath, new Uint8Array(docxBuffer));

  const docxText = await readDocx(tempFilePath);
  await Deno.remove(tempFilePath);

  return docxText;
}

// Process text with OpenAI
async function processWithOpenAI(text: string): Promise<ExtractedCVData> {
  const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
  if (!openaiApiKey) {
    throw new Error('OpenAI API key not configured');
  }

  const prompt = `
  Analyze this CV text and extract the following information in JSON format:
  - name (string)
  - email (string)
  - phone (string, optional)
  - location (string, optional)
  - summary (string, optional)
  - experience (array of objects with company, position, start_date, end_date, description)
  - education (array of objects with institution, degree, field_of_study, start_date, end_date)
  - skills (array of objects with name, category)
  - certifications (array of objects with name, issuer, date, optional)
  - languages (array of objects with name, proficiency, optional)

  Return ONLY the JSON object, no additional text or explanation.

  CV Text:
  ${text}
  `;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${openaiApiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini', // Updated to use a currently available model
      messages: [
        {
          role: 'system',
          content: 'You are an expert at extracting structured data from CVs/resumes. Return only valid JSON.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.1,
      response_format: { type: "json_object" }
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`OpenAI API error: ${errorData.error?.message || 'Unknown error'}`);
  }

  const data = await response.json();
  const jsonString = data.choices[0]?.message?.content;
  
  if (!jsonString) {
    throw new Error('No content returned from OpenAI');
  }

  return JSON.parse(jsonString);
}

// Merge results from multiple CVs
function mergeCVResults(results: ExtractedCVData[]): ExtractedCVData {
  if (results.length === 0) {
    throw new Error('No valid CV data to merge');
  }

  // For simplicity, we'll take the first result as primary and supplement from others
  const primary = results[0];
  const merged: ExtractedCVData = {
    name: primary.name,
    email: primary.email,
    phone: primary.phone,
    location: primary.location,
    summary: primary.summary,
    experience: [...primary.experience],
    education: [...primary.education],
    skills: [...primary.skills],
    certifications: primary.certifications ? [...primary.certifications] : [],
    languages: primary.languages ? [...primary.languages] : [],
  };

  // Merge additional data from other CVs
  for (let i = 1; i < results.length; i++) {
    const current = results[i];
    
    // Merge experiences (avoid duplicates)
    current.experience.forEach(exp => {
      if (!merged.experience.some(e => 
        e.company === exp.company && 
        e.position === exp.position &&
        e.start_date === exp.start_date
      )) {
        merged.experience.push(exp);
      }
    });

    // Merge education
    current.education.forEach(edu => {
      if (!merged.education.some(e => 
        e.institution === edu.institution && 
        e.degree === edu.degree
      )) {
        merged.education.push(edu);
      }
    });

    // Merge skills
    current.skills.forEach(skill => {
      if (!merged.skills.some(s => s.name === skill.name)) {
        merged.skills.push(skill);
      }
    });

    // Merge certifications
    if (current.certifications) {
      current.certifications.forEach(cert => {
        if (!merged.certifications?.some(c => 
          c.name === cert.name && 
          c.issuer === cert.issuer
        )) {
          merged.certifications?.push(cert);
        }
      });
    }

    // Merge languages
    if (current.languages) {
      current.languages.forEach(lang => {
        if (!merged.languages?.some(l => l.name === lang.name)) {
          merged.languages?.push(lang);
        }
      });
    }

    // Fill in missing fields
    if (!merged.phone && current.phone) merged.phone = current.phone;
    if (!merged.location && current.location) merged.location = current.location;
    if (!merged.summary && current.summary) merged.summary = current.summary;
  }

  return merged;
}
