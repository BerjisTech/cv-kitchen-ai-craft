
import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

const LandingPage = () => {
  const { user } = useAuth();
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-background to-accent/30 p-6">
      <div className="max-w-4xl w-full text-center space-y-8">
        <h1 className="text-5xl font-bold tracking-tight">Smart CV Builder</h1>
        <p className="text-xl text-muted-foreground">
          Create tailored CVs for each job application using AI assistance
        </p>
        
        <div className="flex flex-wrap justify-center gap-4 mt-8">
          {user ? (
            <Link to="/kitchen">
              <Button size="lg" className="text-lg px-8">
                Go to Kitchen
              </Button>
            </Link>
          ) : (
            <>
              <Link to="/auth">
                <Button size="lg" className="text-lg px-8">
                  Get Started
                </Button>
              </Link>
              <Link to="/auth">
                <Button size="lg" variant="outline" className="text-lg px-8">
                  Sign In
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
