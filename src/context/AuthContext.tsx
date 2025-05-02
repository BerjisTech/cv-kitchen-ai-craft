
import React, { createContext, useContext, useEffect, useState } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "@/components/ui/sonner";

export type UserRole = 'job_seeker' | 'recruiter' | 'staff' | 'superadmin';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  userRole: UserRole | null;
  activeRole: UserRole | null;
  isAdmin: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
  signOut: () => Promise<void>;
  switchRole: (role: UserRole) => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [activeRole, setActiveRole] = useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  
  // Fetch user role from profiles table
  const fetchUserRole = async (userId: string) => {
    try {
      console.log('Fetching user role for ID:', userId);
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single();
      
      if (error) {
        console.error("Error fetching user role:", error);
        setIsLoading(false);
        return null;
      }
      
      console.log('User role data from DB:', data);
      
      // Use type assertion since we know the structure is correct
      const profileData = data as unknown as { role: UserRole };
      
      setUserRole(profileData.role);
      // Set activeRole to the user's main role initially
      if (!activeRole) {
        setActiveRole(profileData.role);
      }
      
      console.log('Set user role to:', profileData.role);
      setIsLoading(false);
      return profileData.role;
      
    } catch (error: any) {
      console.error("Error fetching user role:", error);
      setIsLoading(false);
      return null;
    }
  };

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state changed:', event);
        setSession(session);
        setUser(session?.user ?? null);
        
        // Show toast notifications for auth events
        if (event === 'SIGNED_IN') {
          toast.success("Successfully signed in");
          
          // Fetch user role when signed in
          if (session?.user) {
            fetchUserRole(session.user.id);
          } else {
            setIsLoading(false);
          }
        } else if (event === 'SIGNED_OUT') {
          toast.info("Signed out");
          setUserRole(null);
          setActiveRole(null);
          setIsLoading(false);
        }
      }
    );

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Initial session check:', session ? 'Logged in' : 'Not logged in');
      setSession(session);
      setUser(session?.user ?? null);
      
      // Fetch user role for initial session
      if (session?.user) {
        fetchUserRole(session.user.id);
      } else {
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      navigate("/dashboard");
    } catch (error: any) {
      toast.error(error.message || "Error signing in");
      console.error("Error signing in:", error);
      setIsLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      
      if (error) throw error;
    } catch (error: any) {
      toast.error(error.message || "Error signing in with Google");
      console.error("Error signing in with Google:", error);
      setIsLoading(false);
    }
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });
      
      if (error) throw error;
      
      toast.success("Registration successful! Please check your email for verification.");
    } catch (error: any) {
      toast.error(error.message || "Error creating account");
      console.error("Error signing up:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      navigate("/auth");
    } catch (error: any) {
      toast.error(error.message || "Error signing out");
      console.error("Error signing out:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Function to switch between roles
  const switchRole = async (role: UserRole) => {
    try {
      if (!user) return;
      
      console.log('Switching to role:', role);
      console.log('Current userRole:', userRole);
      
      // Only allow switching between job_seeker and recruiter unless admin
      if (
        (role === 'job_seeker' || role === 'recruiter') || 
        (userRole === 'staff' || userRole === 'superadmin')
      ) {
        setActiveRole(role);
        toast.success(`Switched to ${role.replace('_', ' ')} view`);
        
        // Navigate to appropriate page based on role
        if (role === 'job_seeker') {
          navigate('/dashboard');
        } else if (role === 'recruiter') {
          navigate('/recruiter/dashboard');
        } else if (role === 'staff' || role === 'superadmin') {
          navigate('/admin/dashboard');
        }
      }
    } catch (error: any) {
      toast.error(error.message || "Error switching roles");
      console.error("Error switching roles:", error);
    }
  };
  
  // Calculate if user is an admin (staff or superadmin)
  const isAdmin = userRole === 'staff' || userRole === 'superadmin';

  const value = {
    session,
    user,
    userRole,
    activeRole,
    isAdmin,
    signIn,
    signInWithGoogle,
    signUp,
    signOut,
    switchRole,
    isLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
