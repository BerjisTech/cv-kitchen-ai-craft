
import React, { useState, useEffect } from 'react';
import { FileText, BookOpen, Upload, LineChart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useNavigate } from 'react-router-dom';
import { getProfile, ProfileData } from '@/services/profileService';

interface QuickActionProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}

const QuickAction = ({ icon, label, onClick }: QuickActionProps) => (
  <Button 
    variant="outline" 
    className="flex items-center gap-2 justify-start bg-background/70 hover:bg-background border-border/40 w-full h-12"
    onClick={onClick}
  >
    {icon}
    <span>{label}</span>
  </Button>
);

export const WelcomeSection = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      setIsLoading(true);
      try {
        const data = await getProfile();
        setProfile(data);
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProfile();
  }, []);

  // Get initials for avatar fallback
  const getInitials = () => {
    if (!profile?.full_name) return "U";
    
    const nameParts = profile.full_name.split(" ");
    return nameParts.length > 1
      ? `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`
      : nameParts[0].substring(0, 2);
  };

  return (
    <div className="glass-card p-6">
      <div className="flex items-center gap-4 mb-6">
        <Avatar className="h-16 w-16 bg-blue-100">
          {isLoading ? (
            <div className="h-full w-full bg-muted animate-pulse"></div>
          ) : (
            <>
              <AvatarImage src={profile?.avatar_url || ''} alt={profile?.full_name || 'User'} />
              <AvatarFallback className="text-2xl text-blue-500">
                {getInitials()}
              </AvatarFallback>
            </>
          )}
        </Avatar>
        <div>
          {isLoading ? (
            <>
              <div className="h-6 bg-muted rounded animate-pulse w-32 mb-2"></div>
              <div className="h-4 bg-muted rounded animate-pulse w-24"></div>
            </>
          ) : (
            <>
              <h2 className="text-xl font-semibold">{profile?.full_name || 'Welcome'}</h2>
              <p className="text-muted-foreground">{profile?.role || 'User'}</p>
            </>
          )}
        </div>
      </div>
      
      <h3 className="font-medium mb-3">Quick Actions</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <QuickAction 
          icon={<FileText size={18} />} 
          label="Create New CV" 
          onClick={() => navigate('/kitchen')}
        />
        <QuickAction 
          icon={<BookOpen size={18} />} 
          label="Generate Cover Letter" 
          onClick={() => navigate('/shelf')}
        />
        <QuickAction 
          icon={<Upload size={18} />} 
          label="Upload Job Description" 
          onClick={() => navigate('/kitchen')}
        />
        <QuickAction 
          icon={<LineChart size={18} />} 
          label="View Analytics" 
          onClick={() => navigate('/analytics')}
        />
      </div>
    </div>
  );
};
