
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Mail, Share2, Download } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ProfileData } from '@/services/profileService';
import { format } from 'date-fns';

interface ProfileHeaderProps {
  profile: ProfileData | null;
  isPublic?: boolean;
}

export function ProfileHeader({ profile, isPublic = false }: ProfileHeaderProps) {
  if (!profile) return null;

  // Get initials for avatar fallback
  const getInitials = () => {
    if (!profile.full_name) return "U";
    
    const nameParts = profile.full_name.split(" ");
    return nameParts.length > 1
      ? `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`
      : nameParts[0].substring(0, 2);
  };

  // Format date for member since display
  const formatMemberSince = () => {
    if (!profile.created_at) return "New member";
    return `Member since ${format(new Date(profile.created_at), 'MMM yyyy')}`;
  };

  return (
    <Card className="glass-card relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-primary/20 to-secondary/20"></div>
      <CardContent className="pt-12 pb-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <Avatar className="w-24 h-24 border-4 border-background">
            <AvatarImage src={profile.avatar_url || ''} alt={profile.full_name || 'User'} />
            <AvatarFallback className="text-2xl bg-primary/20 text-primary">
              {getInitials()}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 text-center sm:text-left">
            <h1 className="text-2xl font-bold">{profile.full_name || 'Anonymous User'}</h1>
            <p className="text-muted-foreground">@{profile.username || 'no-username'}</p>
            
            <div className="flex flex-wrap gap-2 mt-3 justify-center sm:justify-start">
              <Badge variant="outline">{profile.role || 'Job Seeker'}</Badge>
              <Badge variant="outline">{formatMemberSince()}</Badge>
              {profile.location && (
                <Badge variant="outline">{profile.location}</Badge>
              )}
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2">
            {isPublic ? (
              <>
                <Button size="sm" variant="outline" className="gap-2">
                  <Mail size={16} />
                  Contact
                </Button>
                <Button size="sm" className="gap-2">
                  <Download size={16} />
                  Resume
                </Button>
              </>
            ) : (
              <Button variant="outline" size="sm" className="gap-2" asChild>
                <Link to="/settings?tab=account">
                  <Edit size={16} />
                  Edit Profile
                </Link>
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
