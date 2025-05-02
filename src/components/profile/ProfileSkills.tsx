
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export const ProfileSkills: React.FC = () => {
  const technicalSkills = [
    { name: 'React', level: 95 },
    { name: 'TypeScript', level: 90 },
    { name: 'HTML/CSS', level: 95 },
    { name: 'Node.js', level: 80 },
    { name: 'GraphQL', level: 85 },
    { name: 'Next.js', level: 85 },
    { name: 'Tailwind CSS', level: 90 },
    { name: 'Jest', level: 75 },
    { name: 'CI/CD', level: 70 },
  ];

  const softSkills = [
    'Team Leadership',
    'Project Management',
    'Problem Solving',
    'Communication',
    'User Experience Design',
    'Mentoring',
    'Agile Methodologies',
    'Cross-functional Collaboration',
  ];

  return (
    <div className="space-y-6">
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Technical Skills</CardTitle>
          <CardDescription>Programming languages and technologies</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {technicalSkills.map((skill, index) => (
              <div key={index}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium">{skill.name}</span>
                  <span className="text-xs text-muted-foreground">{skill.level}%</span>
                </div>
                <div className="w-full h-2 bg-primary/10 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${skill.level}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Soft Skills</CardTitle>
          <CardDescription>Professional attributes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {softSkills.map((skill, index) => (
              <span 
                key={index}
                className="px-4 py-2 bg-primary/10 text-primary text-sm rounded-lg"
              >
                {skill}
              </span>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
