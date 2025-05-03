
import { corsHeaders } from "../utils/cors.ts";

/**
 * Retrieves a document from the database
 */
export async function getDocument(supabaseUrl: string, supabaseKey: string, documentId: string) {
  try {
    console.log(`Retrieving document with ID: ${documentId}`);
    
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
      console.error(`Failed to retrieve document (HTTP ${documentResponse.status}):`, errorText);
      return null;
    }
    
    const documents = await documentResponse.json();
    
    if (!documents || documents.length === 0) {
      console.error(`Document not found with ID: ${documentId}`);
      return null;
    }
    
    console.log(`Retrieved document successfully:`, documents[0]);
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
  try {
    console.log(`Generating signed URL for file: ${filepath}`);
    
    // Check if the file actually exists first
    const fileExistsResponse = await fetch(
      `${supabaseUrl}/storage/v1/object/info/career-uploads/${filepath}`,
      {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`
        }
      }
    );
    
    if (!fileExistsResponse.ok) {
      console.error(`File does not exist in storage: ${filepath} (HTTP ${fileExistsResponse.status})`);
      return null;
    }
    
    const signedURLRequest = `${supabaseUrl}/storage/v1/object/sign/career-uploads/${filepath}`;
    console.log("Requesting signed URL from:", signedURLRequest);
    
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
      console.error(`Failed to get document download URL (HTTP ${storageResponse.status}):`, errorText);
      return null;
    }
    
    const { signedURL } = await storageResponse.json();
    console.log("Got signed URL for document:", signedURL);
    
    // Make sure URL is absolute
    const fullSignedUrl = signedURL.startsWith('http') 
      ? signedURL 
      : `${supabaseUrl}${signedURL.startsWith('/') ? '' : '/'}${signedURL}`;
    
    return fullSignedUrl;
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
    
    const fileResponse = await fetch(fullSignedUrl, {
      // Adding proper headers for PDF content
      headers: {
        'Accept': 'application/pdf, application/octet-stream, text/plain, */*'
      }
    });
    
    if (!fileResponse.ok) {
      console.error("Failed to download document content, status:", fileResponse.status, fileResponse.statusText);
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
        
        // Check if we actually got content
        if (fileContent.size === 0) {
          console.error("PDF file appears to be empty");
          return {
            error: `The PDF file appears to be empty or corrupted`,
            fileContent: null,
            fileContentDescription: null
          };
        }
        
        console.log(`Successfully downloaded PDF of size: ${fileContent.size} bytes`);
        
        // Since we can't process PDF content directly in edge function
        // Just pass a description to OpenAI
        fileContentDescription = `This is a PDF document named "${document.filename}" that contains a CV/resume. The file size is ${document.file_size} bytes.`;
        
        // Just for debugging, also pass sample metadata
        const metadata = {
          filename: document.filename,
          filetype: document.file_type,
          filesize: document.file_size,
          uploadDate: document.created_at
        };
        
        fileContentDescription += `\n\nMetadata: ${JSON.stringify(metadata)}`;
        
        // This is just a placeholder as we can't really extract PDF content in this environment
        fileContentDescription += `\n\nPlease extract the CV information from this document based on the filename and context.`;
        
        return { fileContent, fileContentDescription, error: null };
      } catch (pdfError) {
        console.error("Error processing PDF:", pdfError);
        return {
          error: `Failed to process PDF document: ${pdfError.message}`,
          fileContent: null,
          fileContentDescription: null
        };
      }
    } else if (document.file_type?.includes('word') || document.file_type?.includes('docx')) {
      // Handle Word documents
      fileContent = await fileResponse.arrayBuffer();
      // For Word documents, we just inform OpenAI this is a Word document
      fileContentDescription = `This is a Word document named "${document.filename}" that contains a CV/resume.`;
      return { fileContent, fileContentDescription, error: null };
    } else {
      // For other text documents
      try {
        fileContent = await fileResponse.text();
        
        if (!fileContent || fileContent.length < 50) {
          console.error("Document contains too little text to process");
          return {
            error: `The document appears to be empty or contains too little text to process`,
            fileContent: null,
            fileContentDescription: null
          };
        }
        
        console.log(`Successfully downloaded text content of length: ${fileContent.length}`);
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
