
/**
 * Checks if there is existing extracted data for a document
 */
export async function checkExistingExtractedData(
  supabaseUrl: string, 
  supabaseKey: string, 
  documentId: string, 
  userId: string
) {
  try {
    const existingDataResponse = await fetch(
      `${supabaseUrl}/rest/v1/cv_extracted_data?document_id=eq.${documentId}&user_id=eq.${userId}`,
      {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    if (existingDataResponse.ok) {
      const existingData = await existingDataResponse.json();
      if (existingData && existingData.length > 0 && existingData[0].extracted_data) {
        // Check if the extracted data contains placeholder content
        const extractedData = existingData[0].extracted_data;
        if (extractedData.summary && (
            typeof extractedData.summary === 'string' && 
            (extractedData.summary.includes('placeholder') || 
            extractedData.summary.includes('could not be processed')))) {
          
          console.log("Found placeholder data for document:", documentId, "- deleting it to force re-extraction");
          
          await fetch(
            `${supabaseUrl}/rest/v1/cv_extracted_data?id=eq.${existingData[0].id}`,
            {
              method: 'DELETE',
              headers: {
                'apikey': supabaseKey,
                'Authorization': `Bearer ${supabaseKey}`,
                'Content-Type': 'application/json'
              }
            }
          );
          return null;
        } else if (!extractedData.summary?.includes('placeholder')) {
          console.log("Using existing extracted data for document:", documentId);
          return existingData[0].extracted_data;
        }
      }
    }
    return null;
  } catch (err) {
    console.error("Error checking for existing data:", err);
    // Continue with extraction if error checking cache
    return null;
  }
}
