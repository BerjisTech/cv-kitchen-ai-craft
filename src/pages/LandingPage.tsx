
import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { ArrowRight, FileText, Search, PenTool, Rocket } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const LandingPage = () => {
  const { user } = useAuth();
  
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background to-accent/20">
      {/* Hero Section */}
      <section className="py-20 px-6 md:py-32 flex flex-col items-center text-center">
        <div className="max-w-4xl mx-auto space-y-6">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent animate-fade-in">
            AI-Powered CV Kitchen
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto animate-fade-in">
            Cook up the perfect CV for every job application using our AI tools and career ingredients
          </p>
          
          <div className="flex flex-wrap justify-center gap-4 mt-8 animate-fade-in">
            {user ? (
              <Link to="/kitchen">
                <Button size="lg" className="text-lg px-8 gap-2">
                  Enter Your Kitchen <ArrowRight className="h-4 w-4" />
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
      </section>

      {/* Features Section */}
      <section className="py-20 px-6 bg-muted/50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">How Our CV Kitchen Works</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="border-none shadow-md hover:shadow-lg transition-shadow">
              <CardContent className="pt-6 flex flex-col items-center text-center p-6">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-medium mb-2">Upload Your Ingredients</h3>
                <p className="text-muted-foreground">
                  Upload your existing CV, portfolio, and certificates. Our AI will extract the key information.
                </p>
              </CardContent>
            </Card>
            
            <Card className="border-none shadow-md hover:shadow-lg transition-shadow">
              <CardContent className="pt-6 flex flex-col items-center text-center p-6">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Search className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-medium mb-2">Analyze Job Descriptions</h3>
                <p className="text-muted-foreground">
                  Our AI analyzes job descriptions to identify key skills and requirements for your application.
                </p>
              </CardContent>
            </Card>
            
            <Card className="border-none shadow-md hover:shadow-lg transition-shadow">
              <CardContent className="pt-6 flex flex-col items-center text-center p-6">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <PenTool className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-medium mb-2">Craft Perfect CVs</h3>
                <p className="text-muted-foreground">
                  Generate tailored CVs that highlight your most relevant skills and experience for each job.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 px-6 bg-gradient-to-r from-primary/10 to-secondary/10 text-center">
        <div className="max-w-3xl mx-auto space-y-6">
          <h2 className="text-3xl font-bold">Ready to cook up your perfect CV?</h2>
          <p className="text-xl text-muted-foreground mb-8">
            Join thousands of job seekers who are landing interviews with tailored CVs
          </p>
          
          {!user && (
            <Link to="/auth">
              <Button size="lg" className="text-lg px-10 gap-2">
                Start Now <Rocket className="h-4 w-4" />
              </Button>
            </Link>
          )}
        </div>
      </section>

      {/* Simple Footer */}
      <footer className="py-8 px-6 text-center text-muted-foreground border-t">
        <p>© {new Date().getFullYear()} CV Kitchen. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default LandingPage;
