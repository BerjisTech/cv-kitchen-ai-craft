
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Share2, Download, User } from 'lucide-react';
import { ProfileData } from '@/services/profileService';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface ProfileHeaderProps {
  profile: ProfileData | null;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({ profile }) => {
  if (!profile) return null;

  // Get initials for avatar fallback
  const getInitials = () => {
    if (profile.full_name) {
      const nameParts = profile.full_name.split(" ");
      return nameParts.length > 1
        ? `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`
        : nameParts[0].substring(0, 2);
    }
    
    if (profile.username) {
      return profile.username.substring(0, 2).toUpperCase();
    }
    
    return "U";
  };

  const handleShareProfile = () => {
    if (navigator.share) {
      navigator.share({
        title: `${profile.full_name || profile.username}'s Profile`,
        url: window.location.href,
      })
      .catch(error => console.log('Error sharing', error));
    } else {
      // Fallback for browsers that don't support Web Share API
      navigator.clipboard.writeText(window.location.href)
        .then(() => alert('Profile URL copied to clipboard!'))
        .catch(err => console.error('Could not copy text: ', err));
    }
  };

  return (
    <Card className="glass-card">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
          <div className="relative">
            <Avatar className="w-28 h-28">
              <AvatarImage src={profile.avatar_url || ''} alt={profile.full_name || 'User'} />
              <AvatarFallback className="bg-primary/20 text-primary text-3xl">
                {getInitials()}
              </AvatarFallback>
            </Avatar>
            <div className="absolute -bottom-1 -right-1 bg-green-500 w-5 h-5 rounded-full border-2 border-white" />
          </div>
          
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-2xl font-bold">{profile.full_name || profile.username}</h1>
            <p className="text-muted-foreground">{profile.role === 'job_seeker' ? 'Job Seeker' : profile.role}</p>
            <p className="mt-1 text-sm max-w-md">{profile.bio || 'No bio available'}</p>
            
            {profile.website && (
              <a 
                href={profile.website.startsWith('http') ? profile.website : `https://${profile.website}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm text-primary hover:underline mt-1 inline-block"
              >
                {profile.website}
              </a>
            )}
          </div>
          
          <div className="flex gap-2 self-center">
            <Button variant="outline" size="sm" className="gap-2" onClick={handleShareProfile}>
              <Share2 size={16} />
              Share
            </Button>
            <Button size="sm" className="gap-2">
              <Download size={16} />
              Download CV
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
