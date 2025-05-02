
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ProfileData } from '@/services/profileService';

interface ProfileAboutProps {
  profile: ProfileData | null;
}

export const ProfileAbout: React.FC<ProfileAboutProps> = ({ profile }) => {
  if (!profile) return null;
  
  return (
    <div className="space-y-6">
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>About Me</CardTitle>
          <CardDescription>Professional summary</CardDescription>
        </CardHeader>
        <CardContent>
          {profile.bio ? (
            <p className="text-sm whitespace-pre-wrap">{profile.bio}</p>
          ) : (
            <>
              <p className="text-sm text-muted-foreground italic">
                No bio available. This user hasn't added a bio yet.
              </p>
              {profile.website && (
                <p className="text-sm mt-4">
                  <span className="font-medium">Website: </span>
                  <a 
                    href={profile.website.startsWith('http') ? profile.website : `https://${profile.website}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    {profile.website}
                  </a>
                </p>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
