
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExternalLink, Github } from 'lucide-react';

export const ProfilePortfolio: React.FC = () => {
  const projects = [
    {
      title: 'E-commerce Dashboard',
      description: 'A responsive dashboard for managing online store inventory, sales, and customer data.',
      tags: ['React', 'TypeScript', 'Tailwind CSS'],
      image: 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?auto=format&fit=crop&w=800&q=80',
      liveLink: '#',
      repoLink: '#',
    },
    {
      title: 'Task Management App',
      description: 'A productivity tool for organizing tasks, setting deadlines, and tracking progress.',
      tags: ['React', 'Redux', 'Firebase'],
      image: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?auto=format&fit=crop&w=800&q=80',
      liveLink: '#',
      repoLink: '#',
    },
    {
      title: 'Portfolio Website',
      description: 'A personal portfolio site showcasing projects and professional experience.',
      tags: ['Next.js', 'Framer Motion', 'GSAP'],
      image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=800&q=80',
      liveLink: '#',
      repoLink: '#',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project, index) => (
          <Card key={index} className="glass-card overflow-hidden flex flex-col">
            <div className="aspect-video w-full overflow-hidden">
              <img 
                src={project.image} 
                alt={project.title}
                className="w-full h-full object-cover transition-transform hover:scale-105 duration-300"
              />
            </div>
            <CardHeader>
              <CardTitle>{project.title}</CardTitle>
              <CardDescription>{project.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {project.tags.map((tag, tagIndex) => (
                  <span 
                    key={tagIndex}
                    className="px-3 py-1 bg-primary/10 text-primary text-xs rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </CardContent>
            <CardFooter className="flex justify-between mt-auto">
              <Button variant="outline" size="sm" asChild>
                <a href={project.repoLink} className="gap-2 flex items-center">
                  <Github size={16} />
                  Code
                </a>
              </Button>
              <Button size="sm" asChild>
                <a href={project.liveLink} className="gap-2 flex items-center">
                  <ExternalLink size={16} />
                  Live Demo
                </a>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
};
