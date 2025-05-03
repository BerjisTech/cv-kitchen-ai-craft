
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
    console.log(`Checking for existing extracted data for document ${documentId}`);
    
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
        
        if (extractedData.summary && 
            typeof extractedData.summary === 'string' && 
            (extractedData.summary.includes('placeholder') || 
            extractedData.summary.includes('could not be processed'))) {
          
          // If it's been more than a day, we can try re-extracting
          const createDate = new Date(existingData[0].created_at);
          const oneDayAgo = new Date();
          oneDayAgo.setDate(oneDayAgo.getDate() - 1);
          
          if (createDate < oneDayAgo) {
            console.log("Found placeholder data older than 24h for document:", documentId, "- allowing re-extraction attempt");
            
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
          } else {
            console.log("Found recent placeholder data for document:", documentId, "- using it");
            return existingData[0].extracted_data;
          }
        } else if (!extractedData.summary?.includes('placeholder')) {
          console.log("Using existing extracted data for document:", documentId);
          return existingData[0].extracted_data;
        }
      }
    } else {
      console.error("Error checking for existing data:", await existingDataResponse.text());
    }
    return null;
  } catch (err) {
    console.error("Error checking for existing data:", err);
    // Continue with extraction if error checking cache
    return null;
  }
}
