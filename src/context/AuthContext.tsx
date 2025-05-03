
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../integrations/supabase/client';
import { Session, User } from '@supabase/supabase-js';

export type UserRole = 'job_seeker' | 'recruiter' | 'staff' | 'superadmin';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  userRole: string | null;
  isAdmin: boolean;
  activeRole: UserRole;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, meta?: any) => Promise<void>;
  signOut: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  switchRole: (role: UserRole) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  isLoading: true,
  userRole: null,
  isAdmin: false,
  activeRole: 'job_seeker',
  signIn: async () => {},
  signUp: async () => {},
  signOut: async () => {},
  signInWithGoogle: async () => {},
  switchRole: () => {},
});

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [activeRole, setActiveRole] = useState<UserRole>('job_seeker');

  // Check if user is an admin (staff or superadmin)
  const isAdmin = userRole === 'staff' || userRole === 'superadmin';

  useEffect(() => {
    // Get the current session and user
    const getUser = async () => {
      setIsLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setUser(session?.user ?? null);
      
      // Fetch user role from profiles table if user exists
      if (session?.user) {
        const { data } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single();
          
        setUserRole(data?.role || 'job_seeker');
        setActiveRole((data?.role || 'job_seeker') as UserRole);
      }
      
      setIsLoading(false);
    };

    getUser();

    // Listen for authentication changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      // Fetch user role from profiles table if user exists
      if (session?.user) {
        const { data } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single();
          
        setUserRole(data?.role || 'job_seeker');
        setActiveRole((data?.role || 'job_seeker') as UserRole);
      } else {
        setUserRole(null);
        setActiveRole('job_seeker');
      }
      
      setIsLoading(false);
    });

    // Cleanup function
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const signUp = async (email: string, password: string, meta?: any) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: meta,
      },
    });
    if (error) throw error;
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };
  
  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    });
    if (error) throw error;
  };
  
  const switchRole = (role: UserRole) => {
    setActiveRole(role);
  };

  const value = {
    user,
    session,
    isLoading,
    userRole,
    isAdmin,
    activeRole,
    signIn,
    signUp,
    signOut,
    signInWithGoogle,
    switchRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within a UserProvider');
  }
  return context;
};
