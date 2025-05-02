
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

export const WelcomeCard: React.FC = () => {
  return (
    <div className="glass-card p-6 mb-6">
      <h2 className="text-2xl font-semibold mb-2">Welcome to SmartCV</h2>
      <p className="text-muted-foreground mb-4">
        Let AI craft the perfect CV & cover letter for your next job application
      </p>
      
      <div className="flex flex-wrap gap-3">
        <Button className="bg-primary hover:bg-primary/90">
          Create New CV
        </Button>
        <Button variant="outline" className="gap-1">
          Take a Tour 
          <ArrowRight size={16} />
        </Button>
      </div>
    </div>
  );
};
