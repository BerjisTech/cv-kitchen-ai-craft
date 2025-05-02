
import React from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { WelcomeSection } from '@/components/dashboard/WelcomeSection';
import { StatsSection } from '@/components/dashboard/StatsSection';
import { RecentActivity } from '@/components/dashboard/RecentActivity';
import { Recommendations } from '@/components/dashboard/Recommendations';
import { RecentCVs } from '@/components/dashboard/RecentCVs';

const Dashboard = () => {
  return (
    <MainLayout>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <WelcomeSection />
        <StatsSection />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <RecentActivity />
        <Recommendations />
      </div>
      
      <RecentCVs />
    </MainLayout>
  );
};

export default Dashboard;
