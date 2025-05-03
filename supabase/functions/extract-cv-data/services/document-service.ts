
import { corsHeaders } from "../utils/cors.ts";

/**
 * Retrieves a document from the database
 */
export async function getDocument(supabaseUrl: string, supabaseKey: string, documentId: string) {
  try {
    const documentResponse = await fetch(
      `${supabaseUrl}/rest/v1/user_documents?id=eq.${documentId}&select=*`,
      {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    if (!documentResponse.ok) {
      const errorText = await documentResponse.text();
      console.error("Failed to retrieve document:", errorText);
      return null;
    }
    
    const documents = await documentResponse.json();
    
    if (!documents || documents.length === 0) {
      console.error("Document not found with ID:", documentId);
      return null;
    }
    
    return documents[0];
  } catch (fetchError) {
    console.error("Network error fetching document:", fetchError);
    return null;
  }
}

/**
 * Generates a signed URL for downloading a file
 */
export async function getSignedURL(supabaseUrl: string, supabaseKey: string, filepath: string) {
  const signedURLRequest = `${supabaseUrl}/storage/v1/object/sign/career-uploads/${filepath}`;
  console.log("Generating signed URL from:", signedURLRequest);
  
  try {
    const storageResponse = await fetch(
      signedURLRequest,
      {
        method: 'POST',
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ expiresIn: 300 })
      }
    );
    
    if (!storageResponse.ok) {
      const errorText = await storageResponse.text();
      console.error("Failed to get document download URL:", errorText);
      return null;
    }
    
    const { signedURL } = await storageResponse.json();
    console.log("Got signed URL for document:", signedURL);
    
    // Make sure URL is absolute
    return signedURL.startsWith('http') 
      ? signedURL 
      : `${supabaseUrl}${signedURL.startsWith('/') ? '' : '/'}${signedURL}`;
      
  } catch (signError) {
    console.error("Network error generating signed URL:", signError);
    return null;
  }
}

/**
 * Downloads and processes document content based on file type
 */
export async function downloadDocumentContent(fullSignedUrl: string, document: any) {
  try {
    console.log("Attempting to download from URL:", fullSignedUrl);
    const fileResponse = await fetch(fullSignedUrl);
    
    if (!fileResponse.ok) {
      console.error("Failed to download document content, status:", fileResponse.status);
      return {
        error: `Failed to access document: the file may have been deleted or permissions changed (HTTP ${fileResponse.status})`,
        fileContent: null,
        fileContentDescription: null
      };
    }
    
    let fileContent;
    let fileContentDescription;
    
    console.log("Document file type:", document.file_type);
    
    // Handle different file types
    if (document.file_type?.includes('pdf')) {
      try {
        // For PDFs, we just get a blob and inform the OpenAI API this is a PDF
        fileContent = await fileResponse.blob();
        if (fileContent.size === 0) {
          return {
            error: `The PDF file appears to be empty or corrupted`,
            fileContent: null,
            fileContentDescription: null
          };
        }
        fileContentDescription = `This is a PDF document named "${document.filename}" that contains a CV/resume.`;
        return { fileContent, fileContentDescription, error: null };
      } catch (pdfError) {
        console.error("Error processing PDF:", pdfError);
        return {
          error: `Failed to process PDF document: ${pdfError.message}`,
          fileContent: null,
          fileContentDescription: null
        };
      }
    } else {
      try {
        // For text documents, extract the content
        fileContent = await fileResponse.text();
        if (!fileContent || fileContent.length < 50) {
          return {
            error: `The document appears to be empty or contains too little text to process`,
            fileContent: null,
            fileContentDescription: null
          };
        }
        fileContentDescription = `${fileContent.substring(0, 15000)}${fileContent.length > 15000 ? '... [truncated]' : ''}`;
        return { fileContent, fileContentDescription, error: null };
      } catch (textError) {
        console.error("Error processing text document:", textError);
        return {
          error: `Failed to process text document: ${textError.message}`,
          fileContent: null,
          fileContentDescription: null
        };
      }
    }
  } catch (fileError) {
    console.error("Error accessing document content:", fileError);
    return {
      error: `Failed to access document: ${fileError.message}`,
      fileContent: null,
      fileContentDescription: null
    };
  }
}
