
import React, { useEffect, useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { WelcomeSection } from '@/components/dashboard/WelcomeSection';
import { StatsSection } from '@/components/dashboard/StatsSection';
import { RecentActivity } from '@/components/dashboard/RecentActivity';
import { Recommendations } from '@/components/dashboard/Recommendations';
import { RecentCVs } from '@/components/dashboard/RecentCVs';
import { getProfile } from '@/services/profileService';
import { getTailoredCV } from '@/services/tailoredCVService';
import { getUserDocuments } from '@/services/documentService';
import { getUserCoverLetters } from '@/services/coverLetterService';

const Dashboard = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    cvCount: 0,
    coverLetterCount: 0,
    analysisCount: 0
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        // Load user documents to count CVs
        const documents = await getUserDocuments();
        const cvCount = documents.filter(doc => doc.document_type === 'cv').length;
        
        // Load cover letters
        const coverLetters = await getUserCoverLetters();
        const coverLetterCount = coverLetters.length;
        
        setStats({
          cvCount,
          coverLetterCount,
          analysisCount: 5 // Placeholder for now
        });
      } catch (error) {
        console.error("Error loading dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);

  return (
    <MainLayout>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <WelcomeSection />
        <StatsSection 
          isLoading={isLoading}
          stats={[
            { title: "CVs Created", value: stats.cvCount.toString(), icon: "document" },
            { title: "Cover Letters", value: stats.coverLetterCount.toString(), icon: "mail" },
            { title: "Job Analyses", value: stats.analysisCount.toString(), icon: "chart" }
          ]} 
        />
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
