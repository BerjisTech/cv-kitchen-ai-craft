
import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { getProfile, ProfileData } from '@/services/profileService';

export type UserRole = 'job_seeker' | 'recruiter' | 'staff' | 'superadmin';

interface AuthContextProps {
  user: User | null;
  session: Session | null;
  profile: ProfileData | null;
  activeRole: UserRole;
  userRole: UserRole | null;
  isAdmin: boolean;
  isLoading: boolean;
  setActiveRole: (role: UserRole) => void;
  switchRole: (role: UserRole) => void;
  loading: boolean;
  signOut: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, metadata?: object) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextProps>({
  user: null,
  session: null,
  profile: null,
  activeRole: 'job_seeker',
  userRole: null,
  isAdmin: false,
  isLoading: true,
  setActiveRole: () => {},
  switchRole: () => {},
  loading: true,
  signOut: async () => {},
  signIn: async () => {},
  signUp: async () => {},
  signInWithGoogle: async () => {},
  refreshProfile: async () => {},
});

export const useAuth = () => useContext(AuthContext);

interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null); 
  const [activeRole, setActiveRole] = useState<UserRole>('job_seeker');
  const [loading, setLoading] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Check if user is admin
  const isAdmin = userRole === 'staff' || userRole === 'superadmin';

  // Function to fetch user profile
  const fetchProfile = async (userId: string) => {
    try {
      setIsLoading(true);
      const profileData = await getProfile();
      
      if (profileData) {
        setProfile(profileData);
        
        // Set user role based on profile data
        if (profileData.role) {
          setUserRole(profileData.role as UserRole);
          setActiveRole(profileData.role as UserRole);
        }
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id);
    }
  };

  // Function to switch between roles
  const switchRole = (role: UserRole) => {
    if (role) {
      setActiveRole(role);
    }
  };

  // Authentication functions
  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const signUp = async (email: string, password: string, metadata?: object) => {
    const { error } = await supabase.auth.signUp({ 
      email, 
      password,
      options: {
        data: metadata
      }
    });
    if (error) throw error;
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

  useEffect(() => {
    // This effect sets up the auth state listener and initializes the session
    setLoading(true);
    setIsLoading(true);

    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, newSession) => {
        console.log("Auth state changed:", event, newSession?.user?.id);
        setSession(newSession);
        setUser(newSession?.user ?? null);
        
        // Don't fetch the profile directly here, use the effect below
      }
    );

    // THEN check for existing session
    const initializeAuth = async () => {
      try {
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        console.log("Initial session:", currentSession?.user?.id);
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
      } catch (error) {
        console.error("Error getting session:", error);
      } finally {
        setLoading(false);
        setIsLoading(false);
      }
    };
    
    initializeAuth();
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Separate effect to fetch profile when user changes
  useEffect(() => {
    if (user) {
      fetchProfile(user.id);
    } else {
      setProfile(null);
      setUserRole(null);
    }
  }, [user]);

  // Sign out function
  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const contextValue: AuthContextProps = {
    user,
    session,
    profile,
    userRole,
    activeRole,
    isAdmin,
    isLoading,
    setActiveRole,
    switchRole,
    loading,
    signOut,
    signIn,
    signUp,
    signInWithGoogle,
    refreshProfile,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};
