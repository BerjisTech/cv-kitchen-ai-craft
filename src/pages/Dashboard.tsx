
import React from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { WelcomeCard } from '@/components/dashboard/WelcomeCard';
import { StatCard } from '@/components/dashboard/StatCard';
import { CVCard } from '@/components/cv/CVCard';
import { BookOpen, FileText, LineChart } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Dashboard = () => {
  const stats = [
    { 
      title: 'Total CVs', 
      value: 3, 
      icon: FileText,
      description: 'CVs in your collection'
    },
    { 
      title: 'Total Cover Letters', 
      value: 2, 
      icon: BookOpen,
      description: 'Ready for use'
    },
    { 
      title: 'Profile Views', 
      value: 24, 
      icon: LineChart,
      trend: 'up' as const,
      trendValue: '+8 this week',
    },
  ];
  
  const recentCVs = [
    {
      title: 'Software Engineer CV',
      company: 'Tech Companies',
      lastUpdated: '2 days ago'
    },
    {
      title: 'Product Manager CV',
      company: 'Product-Led Companies',
      lastUpdated: '1 week ago'
    },
    {
      title: 'Marketing Specialist CV',
      company: 'Marketing Agencies',
      lastUpdated: '3 weeks ago'
    }
  ];
  
  return (
    <MainLayout>
      <WelcomeCard />
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {stats.map((stat) => (
          <StatCard 
            key={stat.title}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
            description={stat.description}
            trend={stat.trend}
            trendValue={stat.trendValue}
          />
        ))}
      </div>
      
      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-xl font-semibold">Recent CVs</h2>
        <Button variant="outline" size="sm">View All</Button>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {recentCVs.map((cv) => (
          <CVCard
            key={cv.title}
            title={cv.title}
            company={cv.company}
            lastUpdated={cv.lastUpdated}
          />
        ))}
      </div>
    </MainLayout>
  );
};

export default Dashboard;
