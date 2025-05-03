
import React from 'react';
import { Button } from '@/components/ui/button';
import { Upload, FileText } from 'lucide-react';
import { CareerIngredientCard } from '@/components/kitchen/CareerIngredientCard';
import { useNavigate } from 'react-router-dom';

export const CareerIngredientsSection: React.FC = () => {
  const navigate = useNavigate();
  
  const handleEditAll = () => {
    navigate('/kitchen/experience');
  };
  
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-orange-100 flex items-center justify-center">
            <Upload className="h-3 w-3 text-orange-500" />
          </div>
          <h3 className="font-medium text-lg">Career Ingredients</h3>
        </div>
        <Button variant="link" className="text-blue-500 p-0" onClick={handleEditAll}>Edit All</Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <CareerIngredientCard 
          title="Experience"
          count={3}
          description="Your work history and professional roles"
          routePath="/kitchen/experience"
        />
        
        <CareerIngredientCard 
          title="Education"
          count={2}
          description="Your degrees, certifications and courses"
          routePath="/kitchen/education"
        />
        
        <CareerIngredientCard 
          title="Skills"
          count={12}
          description="Technical and soft skills accumulated"
          accentColor="amber"
          routePath="/kitchen/skills"
        />
        
        <CareerIngredientCard 
          title="Generated CVs"
          count={0} // This would be dynamic in a real implementation
          description="Your tailored CVs for job applications"
          routePath="/shelf"
          icon={<FileText className="h-4 w-4" />}
        />
      </div>
    </div>
  );
};
