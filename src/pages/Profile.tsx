import React, { useEffect, useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { User, Mail, Phone, MapPin, Calendar, Edit, ExternalLink, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getProfile, ProfileData } from '@/services/profileService';
import { format } from 'date-fns';
import { useAuth } from '@/context/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';
import { enhanceUserProfile } from '@/services/cvDataExtractorService';

interface UserSkill {
  id: string;
  name: string;
  level?: number;
}

const Profile = () => {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [enhancing, setEnhancing] = useState(false);
  const [skills, setSkills] = useState<UserSkill[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    const fetchProfile = async () => {
      const data = await getProfile();
      setProfile(data);
      if (data?.id) {
        await fetchSkills(data.id);
      }
      setLoading(false);
    };
    
    const fetchSkills = async (userId: string) => {
      try {
        const { data: skillsData, error: skillsError } = await supabase
          .from('user_skills')
          .select('*')
          .eq('user_id', userId);
          
        if (skillsError) {
          console.error("Error fetching skills:", skillsError);
          return;
        }
          
        if (skillsData && skillsData.length > 0) {
          setSkills(skillsData as UserSkill[]);
        }
      } catch (error) {
        console.error("Error fetching skills:", error);
      }
    };
    
    fetchProfile();
  }, []);

  // Format date for member since display
  const formatMemberSince = () => {
    if (!user?.created_at) return "New member";
    return `Member since ${format(new Date(user.created_at), 'MMM yyyy')}`;
  };

  // Get initials for avatar fallback
  const getInitials = () => {
    if (!profile?.full_name) return "U";
    
    const nameParts = profile.full_name.split(" ");
    return nameParts.length > 1
      ? `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`
      : nameParts[0].substring(0, 2);
  };
  
  const handleEnhanceProfile = async () => {
    setEnhancing(true);
    toast.info('Enhancing your profile with all available data...');
    
    try {
      const success = await enhanceUserProfile();
      
      if (success) {
        toast.success('Profile enhanced successfully!');
        
        // Reload the page to show the updated profile data
        toast.info('Reloading page to show your enhanced profile...');
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        toast.error('Failed to enhance profile');
      }
    } catch (error) {
      console.error('Error enhancing profile:', error);
      toast.error('Failed to enhance profile');
    } finally {
      setEnhancing(false);
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="space-y-6">
          <h1 className="text-2xl font-bold">My Profile</h1>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="glass-card lg:col-span-1">
              <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                  <Skeleton className="w-24 h-24 rounded-full" />
                </div>
                <Skeleton className="h-6 w-32 mx-auto mb-2" />
                <Skeleton className="h-4 w-24 mx-auto" />
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
              </CardContent>
            </Card>
            <Card className="glass-card lg:col-span-2">
              <CardHeader>
                <Skeleton className="h-6 w-32 mb-2" />
                <Skeleton className="h-4 w-48" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-20 w-full mb-4" />
                <Skeleton className="h-4 w-24 mb-2" />
                <div className="flex flex-wrap gap-2">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Skeleton key={i} className="h-6 w-16 rounded-full" />
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">My Profile</h1>
          <Button 
            size="sm"
            variant="default"
            className="gap-2"
            onClick={handleEnhanceProfile}
            disabled={enhancing}
          >
            <Sparkles size={16} className={enhancing ? 'animate-pulse' : ''} />
            Enhance Profile
          </Button>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="glass-card lg:col-span-1">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <Avatar className="w-24 h-24">
                  <AvatarImage src={profile?.avatar_url || ''} alt={profile?.full_name || 'User'} />
                  <AvatarFallback className="text-2xl bg-primary/20 text-primary">
                    {getInitials()}
                  </AvatarFallback>
                </Avatar>
              </div>
              <CardTitle>{profile?.full_name || 'User'}</CardTitle>
              <CardDescription>{profile?.username || 'No username set'}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3 text-sm">
                <Mail size={16} className="text-muted-foreground" />
                <span>{profile?.email || 'No email available'}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Phone size={16} className="text-muted-foreground" />
                <span>{profile?.phone || 'No phone number'}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <MapPin size={16} className="text-muted-foreground" />
                <span>{profile?.location || 'No location set'}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Calendar size={16} className="text-muted-foreground" />
                <span>{formatMemberSince()}</span>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-2">
              <Button variant="outline" className="w-full gap-2" asChild>
                <Link to="/settings?tab=account">
                  <Edit size={16} />
                  Edit Profile
                </Link>
              </Button>
              {profile?.username && (
                <Button className="w-full gap-2" asChild>
                  <Link to={`/u/${profile.username}`}>
                    <ExternalLink size={16} />
                    View Public Profile
                  </Link>
                </Button>
              )}
            </CardFooter>
          </Card>
          
          <Card className="glass-card lg:col-span-2">
            <CardHeader>
              <CardTitle>About Me</CardTitle>
              <CardDescription>Professional summary and skills</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm whitespace-pre-wrap">
                {profile?.bio || 'No bio available. Enhance your profile or add your professional summary in the settings page.'}
              </p>
              
              <div>
                <h4 className="text-sm font-medium mb-2">Skills</h4>
                <div className="flex flex-wrap gap-2">
                  {skills.length > 0 ? (
                    skills.map((skill) => (
                      <span key={skill.id} className="px-3 py-1 bg-primary/10 text-primary text-xs rounded-full">
                        {skill.name}
                      </span>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">No skills added yet. Click "Enhance Profile" to extract skills from your CV.</p>
                  )}
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full gap-2" asChild>
                <Link to="/settings?tab=account">
                  <Edit size={16} />
                  Edit Details
                </Link>
              </Button>
            </CardFooter>
          </Card>
          
          <Card className="glass-card lg:col-span-3">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Experience</CardTitle>
                <CardDescription>Work history and education</CardDescription>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link to="/settings">
                  <Edit size={16} className="mr-2" />
                  Manage
                </Link>
              </Button>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h4 className="text-sm font-medium">Work History</h4>
                
                <div id="work-history-container" className="border-l-2 border-primary/20 pl-4 space-y-6">
                  {/* This will be populated dynamically after profile enhancement */}
                  <p className="text-sm text-muted-foreground">
                    No work history found. Click "Enhance Profile" to extract experience from your CV.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default Profile;
