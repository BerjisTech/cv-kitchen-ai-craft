
import React from 'react';
import { FileText, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CVTemplateProps {
  title: string;
  description: string;
  timeAgo: string;
}

const CVTemplate = ({ title, description, timeAgo }: CVTemplateProps) => (
  <div className="bg-muted/30 rounded-lg overflow-hidden flex flex-col">
    <div className="aspect-[3/4] flex items-center justify-center p-4 bg-muted/20">
      <FileText className="h-16 w-16 text-muted-foreground/60" />
    </div>
    <div className="p-4">
      <h3 className="font-medium">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
      <div className="mt-2 flex justify-between items-center">
        <span className="text-xs text-muted-foreground">{timeAgo}</span>
        <Button variant="ghost" size="sm" className="p-1 h-auto">
          <FileText size={16} />
        </Button>
      </div>
    </div>
  </div>
);

export const RecentCVs = () => {
  const cvs = [
    {
      title: "Frontend Developer",
      description: "Modern template",
      timeAgo: "2 days ago"
    },
    {
      title: "UX Designer",
      description: "Creative template",
      timeAgo: "1 week ago"
    },
    {
      title: "Product Manager",
      description: "Professional template",
      timeAgo: "2 weeks ago"
    }
  ];

  return (
    <div className="mt-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Recent CVs</h2>
        <Button variant="link" size="sm" className="text-primary">View All</Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {cvs.map((cv, index) => (
          <CVTemplate 
            key={index}
            title={cv.title}
            description={cv.description}
            timeAgo={cv.timeAgo}
          />
        ))}
      </div>
    </div>
  );
};
