
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Extract hash fragment after OAuth redirect
    const handleAuthCallback = async () => {
      try {
        // Process the OAuth callback
        const { data, error } = await supabase.auth.getSession();
        
        if (error) throw error;
        
        if (data.session) {
          navigate('/dashboard');
        } else {
          navigate('/auth');
        }
      } catch (error) {
        console.error('Error handling auth callback:', error);
        navigate('/auth', { replace: true });
      }
    };

    handleAuthCallback();
  }, [navigate]);

  return (
    <div className="flex h-screen w-full items-center justify-center">
      <div className="h-16 w-16 animate-spin rounded-full border-b-2 border-t-2 border-primary"></div>
      <h1 className="ml-4 text-lg">Finalizing authentication...</h1>
    </div>
  );
};

export default AuthCallback;
