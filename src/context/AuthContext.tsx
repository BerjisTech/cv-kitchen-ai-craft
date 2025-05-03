
import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { getProfile, ProfileData } from '@/services/profileService';

type Role = 'job_seeker' | 'recruiter' | 'admin';

interface AuthContextProps {
  user: User | null;
  session: Session | null;
  profile: ProfileData | null;
  activeRole: Role;
  setActiveRole: (role: Role) => void;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextProps>({
  user: null,
  session: null,
  profile: null,
  activeRole: 'job_seeker',
  setActiveRole: () => {},
  loading: true,
  signOut: async () => {},
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
  const [activeRole, setActiveRole] = useState<Role>('job_seeker');
  const [loading, setLoading] = useState<boolean>(true);

  // Function to fetch user profile
  const fetchProfile = async (userId: string) => {
    try {
      const profileData = await getProfile();
      
      if (profileData) {
        setProfile(profileData);
        
        // Set active role based on profile data
        if (profileData.role) {
          setActiveRole(profileData.role as Role);
        }
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id);
    }
  };

  useEffect(() => {
    // This effect sets up the auth state listener and initializes the session
    setLoading(true);

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
    activeRole,
    setActiveRole,
    loading,
    signOut,
    refreshProfile,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};
