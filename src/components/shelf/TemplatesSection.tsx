
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface Template {
  name: string;
  description: string;
  isPremium: boolean;
  template: string;
  image: string;
}

interface TemplatesSectionProps {
  templates: Template[];
  handleUseTemplate: (template: string) => void;
}

export const TemplatesSection: React.FC<TemplatesSectionProps> = ({
  templates,
  handleUseTemplate
}) => {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Templates</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {templates.map((template, index) => (
          <Card key={index} className="overflow-hidden glass-card border-0">
            <div className="aspect-video relative overflow-hidden">
              <img 
                src={template.image} 
                alt={template.name} 
                className="w-full h-full object-cover"
              />
              {template.isPremium && (
                <Badge className="absolute top-3 right-3 bg-orange-500 hover:bg-orange-600">
                  Premium
                </Badge>
              )}
            </div>
            <CardContent className="p-4">
              <h3 className="font-semibold mb-1">{template.name}</h3>
              <p className="text-sm text-muted-foreground mb-4">{template.description}</p>
              <Button 
                className="w-full bg-blue-500 hover:bg-blue-600"
                onClick={() => handleUseTemplate(template.template)}
              >
                Use Template
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
