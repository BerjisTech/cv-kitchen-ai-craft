
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ProfileData } from '@/services/profileService';
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from '@/components/ui/skeleton';

interface ProfileSkillsProps {
  profile: ProfileData | null;
}

interface UserSkill {
  id: string;
  name: string;
  level?: number;
  source?: string;
  user_id: string;
}

interface UserCertification {
  id: string;
  name: string;
  issuer: string;
  date: string;
  user_id: string;
}

interface UserLanguage {
  id: string;
  language: string;
  level: string;
  user_id: string;
}

export const ProfileSkills: React.FC<ProfileSkillsProps> = ({ profile }) => {
  const [skills, setSkills] = useState<UserSkill[]>([]);
  const [languages, setLanguages] = useState<UserLanguage[]>([]);
  const [certifications, setCertifications] = useState<UserCertification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!profile) return;
      
      setIsLoading(true);
      try {
        // Fetch skills
        const { data: skillsData, error: skillsError } = await supabase
          .from('user_skills')
          .select('*')
          .eq('user_id', profile.id);
          
        if (skillsError) {
          console.error("Error fetching skills:", skillsError);
        }
          
        if (skillsData && skillsData.length > 0) {
          console.log("Fetched skills:", skillsData);
          setSkills(skillsData as UserSkill[]);
        } else {
          console.log("No skills found");
          setSkills([]);
        }
        
        // Fetch languages
        const { data: languagesData, error: languagesError } = await supabase
          .from('user_languages')
          .select('*')
          .eq('user_id', profile.id);
          
        if (languagesError) {
          console.error("Error fetching languages:", languagesError);
        }
          
        if (languagesData && languagesData.length > 0) {
          console.log("Fetched languages:", languagesData);
          // Use type assertion with any as an intermediate step
          setLanguages(languagesData as UserLanguage[]);
        } else {
          console.log("No languages found, using defaults");
          // Default sample languages if none are found
          setLanguages([
            { id: '1', user_id: profile.id as string, language: 'English', level: 'Native' },
            { id: '2', user_id: profile.id as string, language: 'Spanish', level: 'Intermediate' }
          ]);
        }
        
        // Fetch certifications
        const { data: certificationsData, error: certificationsError } = await supabase
          .from('user_certifications')
          .select('*')
          .eq('user_id', profile.id);
          
        if (certificationsError) {
          console.error("Error fetching certifications:", certificationsError);
        }
          
        if (certificationsData && certificationsData.length > 0) {
          console.log("Fetched certifications:", certificationsData);
          // Use type assertion with any as an intermediate step
          setCertifications(certificationsData as UserCertification[]);
        } else {
          console.log("No certifications found, using defaults");
          // Default sample certifications if none are found
          setCertifications([
            { 
              id: '1', 
              user_id: profile.id as string, 
              name: 'Professional Certification Example', 
              issuer: 'Certification Authority',
              date: '2023'
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

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card className="glass-card">
          <CardHeader>
            <Skeleton className="h-5 w-1/3 mb-1" />
            <Skeleton className="h-4 w-1/2" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i}>
                  <div className="flex justify-between mb-1">
                    <Skeleton className="h-4 w-1/4" />
                    <Skeleton className="h-4 w-10" />
                  </div>
                  <Skeleton className="h-2 w-full rounded-full" />
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
          <CardTitle>Technical Skills</CardTitle>
          <CardDescription>Areas of expertise</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {skills.length > 0 ? skills.map((skill, index) => {
              // Generate a skill level if it doesn't exist
              const level = skill.level || Math.floor(Math.random() * 31) + 70; // Random between 70-100
              
              return (
                <div key={skill.id || index}>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">{skill.name}</span>
                    <span className="text-sm text-muted-foreground">{level}%</span>
                  </div>
                  <div className="w-full bg-primary/10 rounded-full h-2.5">
                    <div 
                      className="bg-primary h-2.5 rounded-full" 
                      style={{ width: `${level}%` }}
                    ></div>
                  </div>
                </div>
              );
            }) : (
              <div className="text-center text-muted-foreground py-4">
                <p>No skills added yet</p>
                <p className="text-sm">Upload a CV and extract data to add skills</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Languages</CardTitle>
            <CardDescription>Communication skills</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {languages.map((language, index) => (
                <li key={language.id || index} className="flex justify-between items-center">
                  <span>{language.language}</span>
                  <span className="text-sm bg-primary/10 text-primary px-3 py-1 rounded-full">
                    {language.level}
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
        
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Certifications</CardTitle>
            <CardDescription>Professional achievements</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {certifications.map((cert, index) => (
                <li key={cert.id || index} className="border-l-2 border-primary/20 pl-3">
                  <div className="font-medium">{cert.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {cert.issuer} · {cert.date}
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
