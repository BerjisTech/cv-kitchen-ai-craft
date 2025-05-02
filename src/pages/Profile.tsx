
import React from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { User, Mail, Phone, MapPin, Calendar, Edit, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

const Profile = () => {
  return (
    <MainLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">My Profile</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="glass-card lg:col-span-1">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className="w-24 h-24 rounded-full overflow-hidden bg-primary/20 border border-white/30 flex items-center justify-center">
                  <User size={40} className="text-primary/60" />
                </div>
              </div>
              <CardTitle>John Doe</CardTitle>
              <CardDescription>Software Engineer</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3 text-sm">
                <Mail size={16} className="text-muted-foreground" />
                <span>john.doe@example.com</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Phone size={16} className="text-muted-foreground" />
                <span>+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <MapPin size={16} className="text-muted-foreground" />
                <span>San Francisco, CA</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Calendar size={16} className="text-muted-foreground" />
                <span>Member since Jan 2023</span>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-2">
              <Button variant="outline" className="w-full gap-2">
                <Edit size={16} />
                Edit Profile
              </Button>
              <Button className="w-full gap-2" asChild>
                <Link to="/public-profile">
                  <ExternalLink size={16} />
                  View Public Profile
                </Link>
              </Button>
            </CardFooter>
          </Card>
          
          <Card className="glass-card lg:col-span-2">
            <CardHeader>
              <CardTitle>About Me</CardTitle>
              <CardDescription>Professional summary and skills</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm">
                Experienced software engineer with a passion for building intuitive user interfaces and scalable applications. 
                Specializing in frontend development with React and TypeScript, with 5+ years of experience in the tech industry.
              </p>
              
              <div>
                <h4 className="text-sm font-medium mb-2">Skills</h4>
                <div className="flex flex-wrap gap-2">
                  {['React', 'TypeScript', 'Node.js', 'UI/UX', 'REST APIs', 'GraphQL', 'AWS', 'CI/CD'].map((skill) => (
                    <span key={skill} className="px-3 py-1 bg-primary/10 text-primary text-xs rounded-full">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full gap-2">
                <Edit size={16} />
                Edit Details
              </Button>
            </CardFooter>
          </Card>
          
          <Card className="glass-card lg:col-span-3">
            <CardHeader>
              <CardTitle>Experience</CardTitle>
              <CardDescription>Work history and education</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h4 className="text-sm font-medium">Work History</h4>
                
                <div className="border-l-2 border-primary/20 pl-4 space-y-6">
                  <div>
                    <div className="flex justify-between">
                      <h5 className="font-medium">Senior Frontend Developer</h5>
                      <span className="text-xs text-muted-foreground">2021 - Present</span>
                    </div>
                    <p className="text-sm text-muted-foreground">TechCorp Inc.</p>
                    <p className="text-sm mt-2">Led the frontend team in developing a modern React application with TypeScript and Tailwind CSS.</p>
                  </div>
                  
                  <div>
                    <div className="flex justify-between">
                      <h5 className="font-medium">Frontend Developer</h5>
                      <span className="text-xs text-muted-foreground">2018 - 2021</span>
                    </div>
                    <p className="text-sm text-muted-foreground">WebSolutions LLC</p>
                    <p className="text-sm mt-2">Developed and maintained multiple web applications using React and related technologies.</p>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full gap-2">
                <Edit size={16} />
                Edit Experience
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default Profile;
