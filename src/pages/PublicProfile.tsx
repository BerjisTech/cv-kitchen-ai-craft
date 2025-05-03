
import React, { useEffect, useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { ProfileHeader } from '@/components/profile/ProfileHeader';
import { ProfileAbout } from '@/components/profile/ProfileAbout';
import { ProfileExperience } from '@/components/profile/ProfileExperience';
import { ProfileSkills } from '@/components/profile/ProfileSkills';
import { ProfileContact } from '@/components/profile/ProfileContact';
import { ProfilePortfolio } from '@/components/profile/ProfilePortfolio';
import { getProfileByUsername, ProfileData } from '@/services/profileService';
import { useParams, useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';

const PublicProfile = () => {
  const { username } = useParams<{ username: string }>();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  
  useEffect(() => {
    const fetchProfile = async () => {
      if (!username) return;
      
      setIsLoading(true);
      try {
        const profileData = await getProfileByUsername(username);
        
        if (!profileData) {
          // Profile not found
          navigate('/not-found');
          return;
        }
        
        setProfile(profileData);
      } catch (error) {
        console.error("Error fetching profile:", error);
        navigate('/not-found');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProfile();
  }, [username, navigate]);
  
  if (isLoading) {
    return (
      <MainLayout>
        <div className="space-y-6">
          <Skeleton className="h-48 w-full rounded-lg" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <Skeleton className="h-64 w-full rounded-lg" />
            </div>
            <div>
              <Skeleton className="h-64 w-full rounded-lg" />
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }
  
  return (
    <MainLayout>
      <div className="space-y-6">
        <ProfileHeader profile={profile} isPublic={true} />
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <ProfileAbout profile={profile} isPublic={true} />
            
            <Tabs defaultValue="experience" className="glass-card">
              <TabsList className="w-full bg-transparent border-b rounded-none px-6 h-14">
                <TabsTrigger value="experience" className="data-[state=active]:bg-transparent">Experience</TabsTrigger>
                <TabsTrigger value="education" className="data-[state=active]:bg-transparent">Education</TabsTrigger>
                <TabsTrigger value="skills" className="data-[state=active]:bg-transparent">Skills</TabsTrigger>
              </TabsList>
              
              <TabsContent value="experience" className="p-6">
                <ProfileExperience profile={profile} />
              </TabsContent>
              
              <TabsContent value="education" className="p-6">
                <p className="text-muted-foreground">Education details</p>
              </TabsContent>
              
              <TabsContent value="skills" className="p-6">
                <ProfileSkills profile={profile} />
              </TabsContent>
            </Tabs>
            
            <ProfilePortfolio profile={profile} />
          </div>
          
          <div>
            <ProfileContact profile={profile} isPublic={true} />
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default PublicProfile;
