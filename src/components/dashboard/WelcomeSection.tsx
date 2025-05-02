
import React from 'react';
import { FileText, BookOpen, Upload, LineChart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface QuickActionProps {
  icon: React.ReactNode;
  label: string;
}

const QuickAction = ({ icon, label }: QuickActionProps) => (
  <Button 
    variant="outline" 
    className="flex items-center gap-2 justify-start bg-background/70 hover:bg-background border-border/40 w-full h-12"
  >
    {icon}
    <span>{label}</span>
  </Button>
);

export const WelcomeSection = () => {
  return (
    <div className="glass-card p-6">
      <div className="flex items-center gap-4 mb-6">
        <Avatar className="h-16 w-16 bg-blue-100">
          <AvatarFallback className="text-2xl text-blue-500">S</AvatarFallback>
        </Avatar>
        <div>
          <h2 className="text-xl font-semibold">Welcome, User</h2>
          <p className="text-muted-foreground">Frontend Developer</p>
        </div>
      </div>
      
      <h3 className="font-medium mb-3">Quick Actions</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <QuickAction icon={<FileText size={18} />} label="Create New CV" />
        <QuickAction icon={<BookOpen size={18} />} label="Generate Cover Letter" />
        <QuickAction icon={<Upload size={18} />} label="Upload Job Description" />
        <QuickAction icon={<LineChart size={18} />} label="View Analytics" />
      </div>
    </div>
  );
};
