
import React from 'react';
import { FileText, UserSquare } from 'lucide-react';

interface RecommendationProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  variant: 'default' | 'success' | 'warning';
}

const RecommendationItem = ({ icon, title, description, variant }: RecommendationProps) => {
  const getBgColor = () => {
    switch (variant) {
      case 'success':
        return 'bg-blue-50';
      case 'warning':
        return 'bg-orange-50';
      default:
        return 'bg-primary/5';
    }
  };

  const getIconBgColor = () => {
    switch (variant) {
      case 'success':
        return 'bg-blue-100 text-blue-600';
      case 'warning':
        return 'bg-orange-100 text-orange-500';
      default:
        return 'bg-primary/10 text-primary';
    }
  };

  return (
    <div className={`p-4 rounded-lg mb-3 ${getBgColor()}`}>
      <div className="flex gap-3">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getIconBgColor()}`}>
          {icon}
        </div>
        <div>
          <h3 className="text-sm font-medium">{title}</h3>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      </div>
    </div>
  );
};

export const Recommendations = () => {
  return (
    <div className="glass-card p-6">
      <h2 className="text-lg font-semibold mb-4">Recommendations</h2>
      
      <RecommendationItem 
        icon={<FileText size={18} />}
        title="Update your skills"
        description="Add React 18 to showcase your latest expertise"
        variant="default"
      />
      
      <RecommendationItem 
        icon={<FileText size={18} />}
        title="Tailor for Google"
        description="Customize your CV for the Frontend role at Google"
        variant="success"
      />
      
      <RecommendationItem 
        icon={<UserSquare size={18} />}
        title="Complete your profile"
        description="Add a profile photo to increase visibility"
        variant="warning"
      />
    </div>
  );
};
