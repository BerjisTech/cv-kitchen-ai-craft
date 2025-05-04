
serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Set a default abort controller with a reasonable timeout
  const abortController = new AbortController();
  const timeoutId = setTimeout(() => abortController.abort(), 55000); // 55 seconds timeout

  try {
    console.log("Extract CV data function invoked");
    
    // Parse request body
    let requestData;
    try {
      requestData = await req.json();
      const documentId = requestData.documentId;
      const userId = requestData.userId;
      const forceReExtract = requestData.forceReExtract === true;
      
      if (!userId && !requestData.updateProfile && !requestData.enhanceProfile) {
        console.error("Missing required parameter: userId");
        clearTimeout(timeoutId);
        return new Response(
          JSON.stringify({ error: 'Missing required parameter: userId' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      if (forceReExtract) {
        console.log("Force re-extraction flag set to true - will ignore cached data");
      }
      
      // If profile update with CV data is requested
      if (requestData.updateProfile && requestData.cvData && requestData.userId) {
        console.log(`Processing profile update with CV data for userId: ${requestData.userId}`);
        console.log("CV data received:", JSON.stringify(requestData.cvData).substring(0, 200) + "...");
        
        // Update user profile with the provided CV data
        const updateResult = await updateUserProfile(
          Deno.env.get('SUPABASE_URL') || '', 
          Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '', 
          requestData.userId, 
          requestData.cvData
        );
        
        clearTimeout(timeoutId);
        if (updateResult.error) {
          return new Response(
            JSON.stringify({ error: updateResult.error }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        return new Response(
          JSON.stringify({ success: true }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      // If specific document processing is requested
      if (documentId && userId) {
        console.log(`Processing request for documentId: ${documentId}, userId: ${userId}`);
        return await processDocument(documentId, userId, abortController.signal);
      }
      
      // If bulk profile enhancement is requested
      if (userId && requestData.enhanceProfile) {
        console.log(`Processing profile enhancement request for userId: ${userId}`);
        return await enhanceUserProfile(userId, abortController.signal);
      }
      
      // Invalid request
      console.error("Missing required parameters or invalid request format");
      clearTimeout(timeoutId);
      return new Response(
        JSON.stringify({ error: 'Missing required parameters or invalid request format' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } catch (parseError) {
      console.error("Error parsing request JSON:", parseError);
      clearTimeout(timeoutId);
      return new Response(
        JSON.stringify({ error: 'Invalid request format' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  } catch (error) {
    clearTimeout(timeoutId);
    
    // Special handling for AbortError
    if (error.name === 'AbortError') {
      console.error('Function timed out after 55 seconds');
      return new Response(
        JSON.stringify({ 
          error: 'The extraction process timed out. The file may be too large or complex.',
          details: 'Server timeout after 55 seconds'
        }),
        { status: 408, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    console.error('Error in extract-cv-data function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'An unexpected error occurred',
        details: error.stack || 'No stack trace available'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
