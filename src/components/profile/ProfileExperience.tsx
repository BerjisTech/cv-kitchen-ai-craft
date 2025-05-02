
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Briefcase, GraduationCap } from 'lucide-react';

export const ProfileExperience: React.FC = () => {
  const workExperience = [
    {
      title: 'Senior Frontend Developer',
      company: 'TechCorp Inc.',
      period: '2021 - Present',
      description: 'Led the frontend team in developing a modern React application with TypeScript and Tailwind CSS. Improved site performance by 40% and implemented CI/CD pipelines.'
    },
    {
      title: 'Frontend Developer',
      company: 'WebSolutions LLC',
      period: '2018 - 2021',
      description: 'Developed and maintained multiple web applications using React and related technologies. Collaborated with design team to implement responsive UI components.'
    },
    {
      title: 'Junior Web Developer',
      company: 'Digital Creatives',
      period: '2016 - 2018',
      description: 'Created website layouts using HTML, CSS, and JavaScript. Assisted in improving website accessibility and SEO performance.'
    }
  ];

  const education = [
    {
      degree: 'Master of Computer Science',
      institution: 'Tech University',
      period: '2014 - 2016',
      description: 'Specialized in Human-Computer Interaction and Web Technologies.'
    },
    {
      degree: 'Bachelor of Science in Computer Science',
      institution: 'State University',
      period: '2010 - 2014',
      description: 'Major in Software Engineering with minor in Digital Design.'
    }
  ];

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
            {workExperience.map((job, index) => (
              <div key={index} className="border-l-2 border-primary/20 pl-4 relative">
                <div className="absolute w-3 h-3 bg-primary rounded-full -left-[7px] top-1"></div>
                <h3 className="font-medium">{job.title}</h3>
                <div className="flex justify-between items-center">
                  <p className="text-sm text-muted-foreground">{job.company}</p>
                  <span className="text-xs text-muted-foreground">{job.period}</span>
                </div>
                <p className="text-sm mt-2">{job.description}</p>
              </div>
            ))}
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
            {education.map((edu, index) => (
              <div key={index} className="border-l-2 border-primary/20 pl-4 relative">
                <div className="absolute w-3 h-3 bg-primary rounded-full -left-[7px] top-1"></div>
                <h3 className="font-medium">{edu.degree}</h3>
                <div className="flex justify-between items-center">
                  <p className="text-sm text-muted-foreground">{edu.institution}</p>
                  <span className="text-xs text-muted-foreground">{edu.period}</span>
                </div>
                <p className="text-sm mt-2">{edu.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
