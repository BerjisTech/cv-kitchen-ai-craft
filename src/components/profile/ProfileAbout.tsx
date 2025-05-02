
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export const ProfileAbout: React.FC = () => {
  return (
    <div className="space-y-6">
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>About Me</CardTitle>
          <CardDescription>Professional summary</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm">
            I am a passionate and experienced frontend developer with over 5 years in the tech industry. 
            My journey began with a degree in Computer Science, which laid the foundation for my 
            technical knowledge and problem-solving abilities.
          </p>
          <p className="text-sm mt-4">
            Over the years, I've had the privilege of working with various organizations, from startups to 
            large enterprises, where I've honed my skills in creating responsive and user-friendly web 
            applications. I particularly enjoy the process of turning complex problems into simple, 
            intuitive interfaces.
          </p>
          <p className="text-sm mt-4">
            In my free time, I contribute to open-source projects and mentor aspiring developers. 
            I believe in continuous learning and regularly attend tech conferences and workshops 
            to stay updated with the latest industry trends.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
