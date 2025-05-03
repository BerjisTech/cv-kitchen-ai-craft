
import React from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { GraduationCap, Plus, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Education = () => {
  const navigate = useNavigate();

  const educationItems = [
    {
      degree: 'Master of Computer Science',
      institution: 'Tech University',
      location: 'San Francisco, CA',
      startDate: 'Sep 2014',
      endDate: 'Jun 2016',
      description: 'Specialized in Human-Computer Interaction and Web Technologies.'
    },
    {
      degree: 'Bachelor of Science in Computer Science',
      institution: 'State University',
      location: 'Boston, MA',
      startDate: 'Sep 2010',
      endDate: 'May 2014',
      description: 'Major in Software Engineering with minor in Digital Design.'
    }
  ];

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => navigate('/kitchen')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-bold">Education</h1>
          </div>
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" /> Add Education
          </Button>
        </div>
        
        <p className="text-muted-foreground">
          Add your educational background to showcase your academic achievements and qualifications to potential employers.
        </p>
        
        <div className="space-y-4">
          {educationItems.map((edu, index) => (
            <Card key={index} className="overflow-hidden">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex gap-4">
                    <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                      <GraduationCap className="h-6 w-6 text-green-500" />
                    </div>
                    <div>
                      <h3 className="font-medium text-lg">{edu.degree}</h3>
                      <p className="text-muted-foreground">{edu.institution} • {edu.location}</p>
                      <p className="text-sm text-muted-foreground">{edu.startDate} - {edu.endDate}</p>
                      <p className="mt-2">{edu.description}</p>
                    </div>
                  </div>
                  <div className="space-x-2">
                    <Button variant="ghost" size="sm">Edit</Button>
                    <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700">Delete</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </MainLayout>
  );
};

export default Education;
