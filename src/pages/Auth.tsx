
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Mail, User, Lock, LogIn } from 'lucide-react';

const Auth = () => {
  const [isSignUp, setIsSignUp] = useState<boolean>(false);
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [fullName, setFullName] = useState<string>('');
  
  const { signIn, signUp, signInWithGoogle, isLoading, user } = useAuth();
  const navigate = useNavigate();
  
  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSignUp) {
      await signUp(email, password, fullName);
    } else {
      await signIn(email, password);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background to-accent/30 p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-primary">SmartCV</h1>
          <p className="mt-2 text-muted-foreground">Your AI-powered CV assistant</p>
        </div>
        
        <Card className="overflow-hidden border-none shadow-lg">
          <Tabs defaultValue="signin" onValueChange={(value) => setIsSignUp(value === 'signup')}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            
            <CardContent className="p-6 pt-8">
              <form onSubmit={handleSubmit}>
                {isSignUp && (
                  <div className="mb-4">
                    <Label htmlFor="fullName">Full Name</Label>
                    <div className="mt-1 flex items-center rounded-md border border-input ring-offset-background focus-within:ring-1 focus-within:ring-ring">
                      <User className="ml-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="fullName"
                        type="text"
                        placeholder="Enter your full name"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        required={isSignUp}
                        className="flex-1 border-0 focus-visible:ring-0"
                      />
                    </div>
                  </div>
                )}
                
                <div className="mb-4">
                  <Label htmlFor="email">Email</Label>
                  <div className="mt-1 flex items-center rounded-md border border-input ring-offset-background focus-within:ring-1 focus-within:ring-ring">
                    <Mail className="ml-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="flex-1 border-0 focus-visible:ring-0"
                    />
                  </div>
                </div>
                
                <div className="mb-6">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                    {!isSignUp && (
                      <Link to="/auth/reset-password" className="text-xs text-primary hover:underline">
                        Forgot password?
                      </Link>
                    )}
                  </div>
                  <div className="mt-1 flex items-center rounded-md border border-input ring-offset-background focus-within:ring-1 focus-within:ring-ring">
                    <Lock className="ml-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      placeholder={isSignUp ? "Create a password" : "Enter your password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="flex-1 border-0 focus-visible:ring-0"
                    />
                  </div>
                </div>
                
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <span className="flex items-center justify-center">
                      <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent"></span>
                      {isSignUp ? "Creating Account..." : "Signing In..."}
                    </span>
                  ) : (
                    <span className="flex items-center justify-center">
                      <LogIn className="mr-2 h-4 w-4" />
                      {isSignUp ? "Create Account" : "Sign In"}
                    </span>
                  )}
                </Button>
                
                <div className="my-6 flex items-center justify-center">
                  <div className="h-px flex-1 bg-border"></div>
                  <span className="px-4 text-xs text-muted-foreground">OR</span>
                  <div className="h-px flex-1 bg-border"></div>
                </div>
                
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={signInWithGoogle} 
                  disabled={isLoading}
                  className="w-full"
                >
                  <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                    <path d="M1 1h22v22H1z" fill="none" />
                  </svg>
                  Continue with Google
                </Button>
              </form>
            </CardContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
};

export default Auth;
