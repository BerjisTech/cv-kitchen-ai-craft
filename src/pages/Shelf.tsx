
import React from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { CVCard } from '@/components/cv/CVCard';
import { Button } from '@/components/ui/button';
import { Plus, Filter } from 'lucide-react';

const Shelf = () => {
  // Mock data for CVs and cover letters
  const items = [
    {
      type: 'cv',
      title: 'Software Engineer CV',
      company: 'Tech Companies',
      position: 'Software Engineer',
      lastUpdated: '2 days ago'
    },
    {
      type: 'cv',
      title: 'Product Manager CV',
      company: 'Product-Led Companies',
      position: 'Product Manager',
      lastUpdated: '1 week ago'
    },
    {
      type: 'cv',
      title: 'Marketing Specialist CV',
      company: 'Marketing Agencies',
      position: 'Marketing Specialist',
      lastUpdated: '3 weeks ago'
    },
    {
      type: 'cover',
      title: 'Software Engineer Cover Letter',
      company: 'Tech Companies',
      position: 'Software Engineer',
      lastUpdated: '2 days ago'
    },
    {
      type: 'cover',
      title: 'Product Manager Cover Letter',
      company: 'Product-Led Companies',
      position: 'Product Manager',
      lastUpdated: '1 week ago'
    },
  ];
  
  return (
    <MainLayout>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-1">Your Shelf</h1>
          <p className="text-muted-foreground">
            All your CVs and cover letters in one place
          </p>
        </div>
        
        <div className="flex gap-3">
          <Button variant="outline" size="sm" className="gap-1">
            <Filter size={14} />
            Filter
          </Button>
          
          <Button size="sm" className="gap-1">
            <Plus size={14} />
            New CV
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {items.map((item) => (
          <CVCard
            key={item.title}
            title={item.title}
            company={item.company}
            position={item.position}
            lastUpdated={item.lastUpdated}
          />
        ))}
      </div>
    </MainLayout>
  );
};

export default Shelf;
