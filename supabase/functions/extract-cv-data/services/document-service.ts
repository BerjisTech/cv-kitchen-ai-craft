
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
 * Generates a URL for accessing a file from public storage
 */
export async function getSignedURL(supabaseUrl: string, supabaseKey: string, filepath: string) {
  try {
    console.log(`Generating access URL for file: ${filepath}`);
    
    // Use the public URL directly since the 'career-uploads' bucket is public
    const publicUrl = `${supabaseUrl}/storage/v1/object/public/career-uploads/${filepath}`;
    console.log("Using public URL for document:", publicUrl);
    
    // Check if the file exists with a HEAD request
    const fileExistsResponse = await fetch(publicUrl, {
      method: 'HEAD'
    });
    
    if (!fileExistsResponse.ok) {
      console.error(`File does not exist or is not publicly accessible: ${filepath} (HTTP ${fileExistsResponse.status})`);
      
      // Fall back to signed URL approach if public access fails
      console.log("Falling back to signed URL approach...");
      const signedURLRequest = `${supabaseUrl}/storage/v1/object/sign/career-uploads/${filepath}`;
      
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
    }
    
    console.log("File exists at public URL - using it directly");
    return publicUrl;
  } catch (urlError) {
    console.error("Network error generating file access URL:", urlError);
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
    
    // Extract text based on file type
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
        
        // Since we can't directly extract PDF content, provide context about the file
        // and later we'll use the filename and other metadata to inform the AI model
        const pdfData = `PDF Document: ${document.filename}
        
File Size: ${Math.round(document.file_size / 1024)} KB
File Type: ${document.file_type}
Uploaded: ${new Date(document.created_at).toLocaleDateString()}

This document likely contains:
- Personal information (name, contact details)
- Professional summary
- Work experience
- Education history
- Skills
- Certifications or achievements
- Languages
- References`;

        fileContentDescription = pdfData;
        
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
      
      // Similar approach for Word documents - provide context
      const docxData = `Word Document: ${document.filename}
      
File Size: ${Math.round(document.file_size / 1024)} KB
File Type: ${document.file_type}
Uploaded: ${new Date(document.created_at).toLocaleDateString()}

This document likely contains:
- Personal information (name, contact details)
- Professional summary
- Work experience
- Education history
- Skills
- Certifications or achievements
- Languages
- References`;

      fileContentDescription = docxData;
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
        fileContentDescription = fileContent;
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

/**
 * Extracts text from different file types more effectively
 */
export async function extractDocumentText(fileContent: Blob | ArrayBuffer | string, fileType: string) {
  try {
    // For PDFs - use a PDF parsing service if available
    if (fileType.includes('pdf')) {
      // In a real implementation, you'd use a PDF parsing API here
      return "PDF content extracted - this would be replaced with actual PDF text extraction";
    }

    // For Word documents
    if (fileType.includes('word') || fileType.includes('docx')) {
      // In a real implementation, use a DOCX parser
      return "Word document content extracted - replace with actual DOCX parsing";
    }

    // For plain text
    if (typeof fileContent === 'string') {
      return fileContent;
    }

    // For binary data we can't process
    return null;
  } catch (error) {
    console.error("Error extracting document text:", error);
    return null;
  }
}
