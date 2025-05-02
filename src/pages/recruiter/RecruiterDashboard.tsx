
import React from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, FileText, Users } from 'lucide-react';

const RecruiterDashboard = () => {
  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Recruiter Dashboard</h1>
          <Button className="flex items-center gap-2">
            <PlusCircle className="h-4 w-4" />
            Post New Job
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Active Job Postings</CardTitle>
              <CardDescription>Your current job listings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  <span className="text-2xl font-bold">0</span>
                </div>
                <Button variant="outline" size="sm">View All</Button>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Applications</CardTitle>
              <CardDescription>Candidates who applied</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  <span className="text-2xl font-bold">0</span>
                </div>
                <Button variant="outline" size="sm">Review</Button>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Welcome to Recruiter Mode</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              You've switched to recruiter mode where you can post jobs and manage applications. 
              Switch back to job seeker mode anytime using the toggle in the top bar.
            </p>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default RecruiterDashboard;
