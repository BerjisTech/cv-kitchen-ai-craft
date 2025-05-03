
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { ProfileData, getProfileByUsername } from '@/services/profileService';
import { ProfileHeader } from '@/components/profile/ProfileHeader';
import { ProfileAbout } from '@/components/profile/ProfileAbout';
import { ProfileContact } from '@/components/profile/ProfileContact';
import { ProfilePortfolio } from '@/components/profile/ProfilePortfolio';
import { ProfileExperience } from '@/components/profile/ProfileExperience';
import { ProfileSkills } from '@/components/profile/ProfileSkills';
import { Skeleton } from '@/components/ui/skeleton';

const PublicProfile = () => {
  const { username } = useParams<{ username: string }>();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!username) {
        setError("Username not provided");
        setLoading(false);
        return;
      }

      try {
        const profileData = await getProfileByUsername(username);
        if (profileData) {
          setProfile(profileData);
        } else {
          setError("User not found");
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
        setError("Error loading profile");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [username]);

  if (loading) {
    return (
      <MainLayout>
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Skeleton className="w-24 h-24 rounded-full" />
            <div>
              <Skeleton className="h-8 w-48 mb-2" />
              <Skeleton className="h-4 w-36" />
            </div>
          </div>
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </MainLayout>
    );
  }

  if (error || !profile) {
    return (
      <MainLayout>
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold mb-4">{error || "User not found"}</h1>
          <p className="text-muted-foreground">
            The profile you're looking for doesn't seem to exist.
          </p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-8">
        <ProfileHeader profile={profile} isPublic={true} />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <ProfileAbout profile={profile} />
            <div className="mt-6">
              <ProfileExperience />
            </div>
          </div>
          
          <div className="space-y-6">
            <ProfileContact profile={profile} />
            <ProfileSkills />
          </div>
        </div>
        
        <ProfilePortfolio profile={profile} />
      </div>
    </MainLayout>
  );
};

export default PublicProfile;
