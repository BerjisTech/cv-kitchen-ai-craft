
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ProfileData } from '@/services/profileService';

interface ProfileSkillsProps {
  profile: ProfileData | null;
}

export const ProfileSkills: React.FC<ProfileSkillsProps> = ({ profile }) => {
  const skills = [
    { name: 'React', level: 90 },
    { name: 'TypeScript', level: 85 },
    { name: 'Tailwind CSS', level: 80 },
    { name: 'Node.js', level: 75 },
    { name: 'GraphQL', level: 70 },
    { name: 'UI/UX Design', level: 65 },
  ];

  const languages = [
    { name: 'English', level: 'Native' },
    { name: 'Spanish', level: 'Fluent' },
    { name: 'French', level: 'Intermediate' },
    { name: 'German', level: 'Basic' },
  ];

  const certifications = [
    { name: 'AWS Certified Solutions Architect', issuer: 'Amazon Web Services', year: '2023' },
    { name: 'Professional Scrum Master I', issuer: 'Scrum.org', year: '2022' },
    { name: 'Google Analytics Certification', issuer: 'Google', year: '2021' },
  ];

  return (
    <div className="space-y-6">
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Technical Skills</CardTitle>
          <CardDescription>Areas of expertise</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {skills.map((skill, index) => (
              <div key={index}>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">{skill.name}</span>
                  <span className="text-sm text-muted-foreground">{skill.level}%</span>
                </div>
                <div className="w-full bg-primary/10 rounded-full h-2.5">
                  <div 
                    className="bg-primary h-2.5 rounded-full" 
                    style={{ width: `${skill.level}%` }}
                  ></div>
                </div>
              </div>
            ))}
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
                <li key={index} className="flex justify-between items-center">
                  <span>{language.name}</span>
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
                <li key={index} className="border-l-2 border-primary/20 pl-3">
                  <div className="font-medium">{cert.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {cert.issuer} · {cert.year}
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
