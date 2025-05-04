
import { toast } from '@/components/ui/sonner';
import { OPENAI_API_KEY, isApiKeyConfigured } from '@/config/constants';
import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
  dangerouslyAllowBrowser: true // Allow usage in browser
});

/**
 * Extract text from a PDF file using PDF.js library
 */
export const extractTextFromPdf = async (file: File): Promise<string> => {
  console.log('Extracting text from PDF file:', file.name);
  
  try {
    // Dynamically import PDF.js only when needed
    const pdfjsLib = await import('pdfjs-dist/webpack');
    
    // Initialize the PDF.js worker
    const pdfWorkerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
    pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerSrc;
    
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    console.log(`Loaded PDF with ${pdf.numPages} pages.`);
    
    let text = '';

    for (let i = 1; i <= pdf.numPages; i++) {
      console.log(`Reading page ${i}...`);
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const pageText = content.items.map((item: any) => item.str).join(' ');
      text += pageText + '\n';
    }

    console.log('Completed PDF text extraction.');
    return text;
  } catch (error) {
    console.error('Error extracting text from PDF:', error);
    toast.error('Failed to extract text from PDF');
    return '';
  }
};

/**
 * Extract text from a DOCX file
 */
export const extractTextFromDocx = async (file: File): Promise<string> => {
  console.log('Extracting text from DOCX file:', file.name);
  
  try {
    // Since mammoth is a bit complex to include directly, we'll use a simpler approach
    // In a production app, you'd use a proper DOCX parser library
    toast.error('DOCX extraction not implemented in this demo');
    return 'DOCX extraction not available in this demo version';
  } catch (error) {
    console.error('Error extracting text from DOCX:', error);
    toast.error('Failed to extract text from DOCX');
    return '';
  }
};

/**
 * Extract text from a file based on its extension
 */
export const extractText = async (file: File): Promise<string> => {
  if (file.type === 'application/pdf') {
    return extractTextFromPdf(file);
  }
  
  if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
    return extractTextFromDocx(file);
  }
  
  // Fallback to checking extension if MIME type doesn't work
  const extension = (file.name.split('.').pop() || '').toLowerCase();
  console.log('Detected file extension:', extension);
  
  if (extension === 'pdf') {
    return extractTextFromPdf(file);
  }
  
  if (extension === 'docx') {
    return extractTextFromDocx(file);
  }
  
  throw new Error('Unsupported file type');
};

/**
 * Extract text from a direct file URL (simplified approach)
 */
export const extractTextFromUrl = async (url: string): Promise<string> => {
  console.log('Fetching file from direct URL:', url);
  
  try {
    // Check if URL contains PDF or DOCX
    const isPdf = url.toLowerCase().includes('.pdf');
    
    if (!isPdf) {
      console.error('Only PDF files are currently supported for direct URL extraction');
      toast.error('Only PDF files are currently supported');
      return '';
    }
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch file: ${response.status} ${response.statusText}`);
    }
    
    const blob = await response.blob();
    // Force the file type to PDF
    const file = new File([blob], 'document.pdf', { type: 'application/pdf' });
    
    const extracted = await extractTextFromPdf(file);
    console.log('Extracted text from URL file (first 500 chars):', extracted.slice(0, 500), '...');
    return extracted;
  } catch (error) {
    console.error('Error extracting text from URL:', error);
    toast.error(`Failed to extract text from URL: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return '';
  }
};

/**
 * Clean messy JSON from AI responses
 */
const cleanJson = (raw: string): string => {
  const firstBrace = raw.indexOf('{');
  const lastBrace = raw.lastIndexOf('}');
  const firstBracket = raw.indexOf('[');
  const lastBracket = raw.lastIndexOf(']');

  // If it's an object-style response
  if (firstBrace !== -1 && lastBrace !== -1 && firstBrace < lastBrace) {
    return raw.substring(firstBrace, lastBrace + 1);
  }

  // If it's an array-style response
  if (firstBracket !== -1 && lastBracket !== -1 && firstBracket < lastBracket) {
    return raw.substring(firstBracket, lastBracket + 1);
  }

  throw new Error('Invalid JSON content');
};

/**
 * Analyze CV content using OpenAI API
 */
export const analyzeCvContent = async (cvText: string): Promise<any> => {
  console.log('Analyzing extracted CV text. Sample (first 500 chars):', cvText.slice(0, 500));
  
  try {
    if (!isApiKeyConfigured()) {
      console.error('OpenAI API key is not configured or invalid');
      toast.error('OpenAI API key is not properly configured');
      return null;
    }
    
    const prompt = `
Analyze the following CV content and return a JSON object with the following keys:
- profile: { full_name, bio (short professional paragraph), location }
- user_education: [{ institution, degree, start_year, end_year, description }]
- user_experience: [{ company, role, start_date, end_date, description }]
- user_certifications: [{ name, issuer, date }]
- user_skills: [{ name, level (1-5) }]
- user_languages: [{ language, level (Beginner, Intermediate, Fluent, Native) }]

CV Content:
${cvText}
    `.trim();

    console.log('Sending prompt to OpenAI...');
    
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: 'You are a CV parsing and enrichment expert.' },
        { role: 'user', content: prompt }
      ],
      max_tokens: 2000,
      temperature: 0.7
    });

    console.log('Received OpenAI response:', response);

    const message = response.choices[0].message?.content;
    console.log('Raw OpenAI message content:', message);
    
    if (!message) {
      throw new Error('Empty response from OpenAI');
    }
    
    const cleaned = cleanJson(message);
    const parsed = JSON.parse(cleaned);
    console.log('Parsed AI output:', parsed);
    return parsed;
  } catch (error) {
    console.error('Error analyzing CV content:', error);
    toast.error(`Failed to analyze CV: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return null;
  }
};

/**
 * Extract and analyze CV data from a direct URL
 */
export const extractAndAnalyzeCv = async (url: string): Promise<any> => {
  try {
    console.log('Starting full CV parsing workflow for:', url);
    toast.info('Extracting text from CV file...');
    
    const extractedText = await extractTextFromUrl(url);
    
    if (!extractedText) {
      toast.error('Failed to extract text from CV file');
      return null;
    }
    
    console.log('Text extracted from file. Proceeding to AI analysis...');
    toast.info('Analyzing CV content with AI...');
    
    const analysis = await analyzeCvContent(extractedText);
    
    if (!analysis) {
      toast.error('Failed to analyze CV content');
      return null;
    }
    
    console.log('Final analyzed data:', analysis);
    toast.success('CV analysis complete');
    
    return analysis;
  } catch (error) {
    console.error('Error during CV parsing:', error);
    toast.error(`CV parsing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return null;
  }
};

/**
 * Extract and analyze multiple CVs from direct URLs
 */
export const extractAndAnalyzeMultipleCvs = async (urls: string[]): Promise<any> => {
  try {
    console.log('Starting batch CV parsing workflow for', urls.length, 'CVs');
    console.log('URLs to process:', urls);
    toast.info(`Processing ${urls.length} CVs...`);
    
    // Step 1: Extract text from all CVs in parallel
    const extractionPromises = urls.map(async (url) => {
      try {
        return await extractTextFromUrl(url);
      } catch (e) {
        console.error(`Failed to extract text from ${url}:`, e);
        return '';
      }
    });
    
    const extractedTexts = await Promise.all(extractionPromises);
    
    // Filter out any failed extractions
    const validTexts = extractedTexts.filter(text => text.length > 0);
    
    if (validTexts.length === 0) {
      toast.error('Failed to extract text from any CVs');
      return null;
    }
    
    // Step 2: Combine all CVs into one large string
    const combinedText = validTexts.join('\n\n--- End of CV ---\n\n');
    console.log('Combined CV text (first 1000 chars):', combinedText.slice(0, 1000));
    
    // Step 3: Send combined CVs to AI for unified analysis
    toast.info('Analyzing combined CV content with AI...');
    const unifiedData = await analyzeCvContent(combinedText);
    
    if (!unifiedData) {
      toast.error('Failed to analyze combined CV content');
      return null;
    }
    
    console.log('Unified AI-parsed data from all CVs:', unifiedData);
    toast.success('CV analysis complete');
    
    return unifiedData;
  } catch (error) {
    console.error('Error during batch CV parsing:', error);
    toast.error(`Batch CV parsing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return null;
  }
};

/**
 * Update user profile with CV data
 */
export const updateProfileWithFrontendParsedData = async (cvData: any): Promise<boolean> => {
  try {
    // Import the existing updater service
    const { updateProfileWithCVData } = await import('./profileUpdaterService');
    
    // Convert the frontend-parsed data to the format expected by the updateProfileWithCVData function
    const formattedData = {
      personal_info: {
        full_name: cvData.profile?.full_name,
        location: cvData.profile?.location,
      },
      summary: cvData.profile?.bio,
      education: cvData.user_education?.map((edu: any) => ({
        institution: edu.institution,
        degree: edu.degree,
        start_year: edu.start_year,
        end_year: edu.end_year,
        description: edu.description
      })),
      work_experience: cvData.user_experience?.map((exp: any) => ({
        company: exp.company,
        role: exp.role,
        start_date: exp.start_date,
        end_date: exp.end_date,
        description: exp.description
      })),
      skills: cvData.user_skills?.map((skill: any) => ({
        name: skill.name,
        level: skill.level ? parseInt(skill.level) * 20 : 70 // Convert 1-5 scale to percentage
      })),
      certifications: cvData.user_certifications?.map((cert: any) => ({
        name: cert.name,
        issuer: cert.issuer,
        date: cert.date
      })),
      languages: cvData.user_languages?.map((lang: any) => ({
        language: lang.language,
        level: lang.level
      }))
    };
    
    // Update profile with the formatted data
    return await updateProfileWithCVData(formattedData);
  } catch (error) {
    console.error('Error updating profile with frontend-parsed CV data:', error);
    toast.error(`Failed to update profile: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return false;
  }
};
