
import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';

const AuthCallback = () => {
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  
  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        setIsProcessing(true);
        
        // Handle the OAuth callback
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          setError(error.message);
          toast.error("Authentication failed");
          return;
        }
        
        if (!data.session) {
          setError("No session found");
          toast.error("Authentication session not found");
          return;
        }
        
        // Check if this is a social connection rather than a login
        const params = new URLSearchParams(location.search);
        const provider = params.get('provider');
        
        if (provider) {
          // This is a social connection, store the connection info
          const userId = data.session.user.id;
          const providerData = data.session.user.app_metadata.provider;
          const identities = data.session.user.identities || [];
          
          // Extract the right identity for this provider
          const identity = identities.find((id: any) => 
            (id.provider === provider) || 
            (provider === 'linkedin' && id.provider === 'linkedin_oidc')
          );
          
          if (identity) {
            const { error: connectionError } = await supabase
              .from('user_connections')
              .upsert({
                user_id: userId,
                provider: provider,
                provider_id: identity.id,
                display_name: data.session.user.user_metadata.full_name || data.session.user.user_metadata.name,
                profile_url: data.session.user.user_metadata.avatar_url,
                created_at: new Date().toISOString()
              }, { onConflict: 'user_id, provider' });
              
            if (connectionError) {
              console.error("Error storing connection:", connectionError);
              toast.error("Failed to store connection information");
            } else {
              toast.success(`Successfully connected with ${provider}`);
            }
          }
        } else {
          toast.success("Authentication successful");
        }
        
        // Redirect back to the dashboard or kitchen
        navigate('/kitchen');
        
      } catch (error: any) {
        console.error("Error in auth callback:", error);
        setError(error.message || "An error occurred during authentication");
        toast.error("Authentication process failed");
      } finally {
        setIsProcessing(false);
      }
    };
    
    handleAuthCallback();
  }, [navigate, location]);
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/40">
      <div className="text-center p-8">
        {isProcessing ? (
          <>
            <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin mx-auto mb-4"></div>
            <h1 className="text-xl font-semibold mb-2">Processing your authentication...</h1>
            <p className="text-muted-foreground">Please wait while we complete the process.</p>
          </>
        ) : error ? (
          <>
            <div className="text-red-500 text-5xl mb-4">✗</div>
            <h1 className="text-xl font-semibold mb-2">Authentication Failed</h1>
            <p className="text-muted-foreground mb-4">{error}</p>
            <button 
              onClick={() => navigate('/auth')}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md"
            >
              Return to Login
            </button>
          </>
        ) : (
          <>
            <div className="text-green-500 text-5xl mb-4">✓</div>
            <h1 className="text-xl font-semibold mb-2">Authentication Successful!</h1>
            <p className="text-muted-foreground mb-4">Redirecting you...</p>
          </>
        )}
      </div>
    </div>
  );
};

export default AuthCallback;
