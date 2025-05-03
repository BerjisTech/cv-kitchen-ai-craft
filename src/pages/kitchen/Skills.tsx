
import React from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Award, Plus, ArrowLeft, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Skills = () => {
  const navigate = useNavigate();

  const skillCategories = [
    {
      name: 'Technical Skills',
      skills: [
        { name: 'React', level: 90 },
        { name: 'TypeScript', level: 85 },
        { name: 'Tailwind CSS', level: 80 },
        { name: 'Node.js', level: 75 },
        { name: 'GraphQL', level: 70 }
      ]
    },
    {
      name: 'Soft Skills',
      skills: [
        { name: 'Communication', level: 95 },
        { name: 'Teamwork', level: 90 },
        { name: 'Problem Solving', level: 85 },
        { name: 'Leadership', level: 80 }
      ]
    },
    {
      name: 'Languages',
      skills: [
        { name: 'English', level: 100 },
        { name: 'Spanish', level: 75 },
        { name: 'French', level: 50 }
      ]
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
            <h1 className="text-2xl font-bold">Skills</h1>
          </div>
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" /> Add Skill
          </Button>
        </div>
        
        <p className="text-muted-foreground">
          Manage your technical and soft skills to highlight your strengths and professional capabilities.
        </p>
        
        {skillCategories.map((category, catIndex) => (
          <div key={catIndex} className="space-y-3">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-medium">{category.name}</h2>
              <Button variant="outline" size="sm">Add {category.name.replace(/s$/, '')}</Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {category.skills.map((skill, skillIndex) => (
                <Card key={skillIndex} className="p-4">
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center">
                        <Award className="h-4 w-4 text-amber-500" />
                      </div>
                      <h3 className="font-medium">{skill.name}</h3>
                    </div>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="mt-2">
                    <div className="flex justify-between text-sm mb-1">
                      <span>Proficiency</span>
                      <span>{skill.level}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className="bg-amber-500 h-2 rounded-full" 
                        style={{ width: `${skill.level}%` }}
                      ></div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>
    </MainLayout>
  );
};

export default Skills;
