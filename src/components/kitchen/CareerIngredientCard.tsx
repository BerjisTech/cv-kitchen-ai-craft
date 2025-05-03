
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface CareerIngredientCardProps {
  title: string;
  count: number;
  description: string;
  accentColor?: 'blue' | 'green' | 'amber';
  routePath?: string;
}

export const CareerIngredientCard: React.FC<CareerIngredientCardProps> = ({ 
  title, 
  count, 
  description,
  accentColor = 'blue',
  routePath = '/kitchen'
}) => {
  const navigate = useNavigate();

  const getBadgeColor = () => {
    switch(accentColor) {
      case 'green': return 'bg-green-100 text-green-600';
      case 'amber': return 'bg-amber-100 text-amber-600';
      default: return 'bg-blue-100 text-blue-600';
    }
  };
  
  const handleManage = () => {
    navigate(routePath);
  };
  
  return (
    <Card className="p-5 space-y-3">
      <div className="flex justify-between items-center">
        <h3 className="font-medium">{title}</h3>
        <span className={`px-2 py-0.5 text-xs rounded-full ${getBadgeColor()}`}>
          {count} items
        </span>
      </div>
      
      <p className="text-sm text-muted-foreground">{description}</p>
      
      <Button variant="outline" className="w-full" onClick={handleManage}>
        Manage
      </Button>
    </Card>
  );
};
