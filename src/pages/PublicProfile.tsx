
import React from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProfileHeader } from '@/components/profile/ProfileHeader';
import { ProfileAbout } from '@/components/profile/ProfileAbout';
import { ProfilePortfolio } from '@/components/profile/ProfilePortfolio';
import { ProfileExperience } from '@/components/profile/ProfileExperience';
import { ProfileSkills } from '@/components/profile/ProfileSkills';
import { ProfileContact } from '@/components/profile/ProfileContact';

const PublicProfile = () => {
  return (
    <MainLayout>
      <div className="space-y-6">
        <ProfileHeader />
        
        <Tabs defaultValue="about" className="w-full">
          <TabsList className="glass mb-6">
            <TabsTrigger value="about">About</TabsTrigger>
            <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
            <TabsTrigger value="experience">Experience</TabsTrigger>
            <TabsTrigger value="skills">Skills</TabsTrigger>
            <TabsTrigger value="contact">Contact</TabsTrigger>
          </TabsList>
          
          <TabsContent value="about">
            <ProfileAbout />
          </TabsContent>
          
          <TabsContent value="portfolio">
            <ProfilePortfolio />
          </TabsContent>
          
          <TabsContent value="experience">
            <ProfileExperience />
          </TabsContent>
          
          <TabsContent value="skills">
            <ProfileSkills />
          </TabsContent>
          
          <TabsContent value="contact">
            <ProfileContact />
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default PublicProfile;
