
import React from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Briefcase, Plus, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Experience = () => {
  const navigate = useNavigate();

  const experiences = [
    {
      title: 'Senior Frontend Developer',
      company: 'TechCorp Inc.',
      location: 'San Francisco, CA',
      startDate: 'Jan 2021',
      endDate: 'Present',
      description: 'Led the frontend team in developing a modern React application with TypeScript and Tailwind CSS. Improved site performance by 40% and implemented CI/CD pipelines.'
    },
    {
      title: 'Frontend Developer',
      company: 'WebSolutions LLC',
      location: 'Boston, MA',
      startDate: 'Mar 2018',
      endDate: 'Dec 2020',
      description: 'Developed and maintained multiple web applications using React and related technologies. Collaborated with design team to implement responsive UI components.'
    },
    {
      title: 'Junior Web Developer',
      company: 'Digital Creatives',
      location: 'Chicago, IL',
      startDate: 'Jun 2016',
      endDate: 'Feb 2018',
      description: 'Created website layouts using HTML, CSS, and JavaScript. Assisted in improving website accessibility and SEO performance.'
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
            <h1 className="text-2xl font-bold">Work Experience</h1>
          </div>
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" /> Add Experience
          </Button>
        </div>
        
        <p className="text-muted-foreground">
          Add your work history to highlight your professional journey and showcase relevant experience to potential employers.
        </p>
        
        <div className="space-y-4">
          {experiences.map((exp, index) => (
            <Card key={index} className="overflow-hidden">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex gap-4">
                    <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                      <Briefcase className="h-6 w-6 text-blue-500" />
                    </div>
                    <div>
                      <h3 className="font-medium text-lg">{exp.title}</h3>
                      <p className="text-muted-foreground">{exp.company} • {exp.location}</p>
                      <p className="text-sm text-muted-foreground">{exp.startDate} - {exp.endDate}</p>
                      <p className="mt-2">{exp.description}</p>
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

export default Experience;
