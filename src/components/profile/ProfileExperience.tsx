
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Briefcase, GraduationCap } from 'lucide-react';
import { ProfileData } from '@/services/profileService';
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from '@/components/ui/skeleton';

interface ProfileExperienceProps {
  profile: ProfileData | null;
}

interface UserExperience {
  id: string;
  user_id: string;
  company: string;
  role: string;
  start_date: string;
  end_date: string | null;
  description: string;
  source?: string;
}

interface UserEducation {
  id: string;
  user_id: string;
  institution: string;
  degree: string;
  start_year: string;
  end_year: string | null;
  description: string;
  source?: string;
}

export const ProfileExperience: React.FC<ProfileExperienceProps> = ({ profile }) => {
  const [workExperience, setWorkExperience] = useState<UserExperience[]>([]);
  const [education, setEducation] = useState<UserEducation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!profile) return;
      
      setIsLoading(true);
      try {
        // Fetch experience
        const { data: experienceData } = await supabase
          .from('user_experience')
          .select('*')
          .eq('user_id', profile.id)
          .order('start_date', { ascending: false });
          
        if (experienceData && experienceData.length > 0) {
          setWorkExperience(experienceData);
        } else {
          // Default sample experience if none is found
          setWorkExperience([
            {
              id: '1',
              user_id: profile.id as string,
              company: 'Example Company',
              role: 'Professional Role',
              start_date: '2021-01',
              end_date: null,
              description: 'Upload your CV and extract data to update your work history.',
              source: 'default'
            }
          ]);
        }
        
        // Fetch education
        const { data: educationData } = await supabase
          .from('user_education')
          .select('*')
          .eq('user_id', profile.id)
          .order('start_year', { ascending: false });
          
        if (educationData && educationData.length > 0) {
          setEducation(educationData);
        } else {
          // Default sample education if none is found
          setEducation([
            {
              id: '1',
              user_id: profile.id as string,
              institution: 'Example University',
              degree: 'Degree Program',
              start_year: '2014',
              end_year: '2018',
              description: 'Upload your CV and extract data to update your education history.',
              source: 'default'
            }
          ]);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUserData();
  }, [profile]);

  const formatPeriod = (start: string, end: string | null) => {
    // For experience with YYYY-MM format
    if (start?.includes('-')) {
      const startDate = start?.split('-')[0] || '';
      const endDate = end ? end.split('-')[0] : 'Present';
      return `${startDate} - ${endDate}`;
    } 
    // For education with just year
    return `${start || ''} - ${end || 'Present'}`;
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card className="glass-card">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Briefcase className="text-primary" />
              <div>
                <Skeleton className="h-5 w-40 mb-1" />
                <Skeleton className="h-4 w-48" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="border-l-2 border-primary/20 pl-4 relative">
                  <Skeleton className="h-4 w-3/4 mb-2" />
                  <div className="flex justify-between items-center">
                    <Skeleton className="h-3 w-1/2 mb-1" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                  <Skeleton className="h-3 w-full mt-1" />
                  <Skeleton className="h-3 w-full mt-1" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="glass-card">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Briefcase className="text-primary" />
            <div>
              <CardTitle>Work Experience</CardTitle>
              <CardDescription>Professional career path</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {workExperience.map((job) => (
              <div key={job.id} className="border-l-2 border-primary/20 pl-4 relative">
                <div className="absolute w-3 h-3 bg-primary rounded-full -left-[7px] top-1"></div>
                <h3 className="font-medium">{job.role}</h3>
                <div className="flex justify-between items-center">
                  <p className="text-sm text-muted-foreground">{job.company}</p>
                  <span className="text-xs text-muted-foreground">
                    {formatPeriod(job.start_date, job.end_date)}
                  </span>
                </div>
                <p className="text-sm mt-2">{job.description}</p>
                {job.source === 'default' && (
                  <p className="text-xs text-muted-foreground mt-1 italic">
                    This is example data. Upload your CV to see your real experience.
                  </p>
                )}
              </div>
            ))}
            {workExperience.length === 0 && (
              <div className="text-center text-muted-foreground py-4">
                <p>No work experience found</p>
                <p className="text-sm">Upload a CV and extract data to add your work history</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      <Card className="glass-card">
        <CardHeader>
          <div className="flex items-center gap-3">
            <GraduationCap className="text-primary" />
            <div>
              <CardTitle>Education</CardTitle>
              <CardDescription>Academic background</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {education.map((edu) => (
              <div key={edu.id} className="border-l-2 border-primary/20 pl-4 relative">
                <div className="absolute w-3 h-3 bg-primary rounded-full -left-[7px] top-1"></div>
                <h3 className="font-medium">{edu.degree}</h3>
                <div className="flex justify-between items-center">
                  <p className="text-sm text-muted-foreground">{edu.institution}</p>
                  <span className="text-xs text-muted-foreground">
                    {formatPeriod(edu.start_year, edu.end_year)}
                  </span>
                </div>
                {edu.description && <p className="text-sm mt-2">{edu.description}</p>}
                {edu.source === 'default' && (
                  <p className="text-xs text-muted-foreground mt-1 italic">
                    This is example data. Upload your CV to see your real education.
                  </p>
                )}
              </div>
            ))}
            {education.length === 0 && (
              <div className="text-center text-muted-foreground py-4">
                <p>No education history found</p>
                <p className="text-sm">Upload a CV and extract data to add your education</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
