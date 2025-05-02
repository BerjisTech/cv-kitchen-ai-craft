
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProfileHeader } from '@/components/profile/ProfileHeader';
import { ProfileAbout } from '@/components/profile/ProfileAbout';
import { ProfilePortfolio } from '@/components/profile/ProfilePortfolio';
import { ProfileExperience } from '@/components/profile/ProfileExperience';
import { ProfileSkills } from '@/components/profile/ProfileSkills';
import { ProfileContact } from '@/components/profile/ProfileContact';
import { getProfileByUsername, ProfileData } from '@/services/profileService';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/context/AuthContext';

const PublicProfile = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      
      // If no username is provided, redirect to 404 or handle differently
      if (!username) {
        // Check if this is from the legacy /public-profile route
        // In that case, redirect to the current user's profile
        if (user) {
          const userData = await getProfileByUsername(user.user_metadata?.username || '');
          if (userData?.username) {
            navigate(`/u/${userData.username}`, { replace: true });
            return;
          }
        }
        
        navigate('/404', { replace: true });
        return;
      }
      
      // Fetch profile data by username
      const profileData = await getProfileByUsername(username);
      
      if (!profileData) {
        // Profile not found, redirect to 404
        navigate('/404', { replace: true });
        return;
      }
      
      setProfile(profileData);
      setLoading(false);
    };
    
    fetchProfile();
  }, [username, user, navigate]);

  if (loading) {
    return (
      <MainLayout>
        <div className="space-y-6">
          <Skeleton className="h-36 w-full" />
          <div className="flex gap-4">
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-8 w-16" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-36 w-full" />
            <Skeleton className="h-36 w-full" />
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <ProfileHeader profile={profile} />
        
        <Tabs defaultValue="about" className="w-full">
          <TabsList className="glass mb-6">
            <TabsTrigger value="about">About</TabsTrigger>
            <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
            <TabsTrigger value="experience">Experience</TabsTrigger>
            <TabsTrigger value="skills">Skills</TabsTrigger>
            <TabsTrigger value="contact">Contact</TabsTrigger>
          </TabsList>
          
          <TabsContent value="about">
            <ProfileAbout profile={profile} />
          </TabsContent>
          
          <TabsContent value="portfolio">
            <ProfilePortfolio profile={profile} />
          </TabsContent>
          
          <TabsContent value="experience">
            <ProfileExperience profile={profile} />
          </TabsContent>
          
          <TabsContent value="skills">
            <ProfileSkills profile={profile} />
          </TabsContent>
          
          <TabsContent value="contact">
            <ProfileContact profile={profile} />
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default PublicProfile;
