
import React from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { LineChart, BarChart, PieChart } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const Analytics = () => {
  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Analytics Dashboard</h1>
          <div className="flex space-x-2">
            <button className="glass-card p-2">
              <LineChart size={18} />
            </button>
            <button className="glass-card p-2">
              <BarChart size={18} />
            </button>
            <button className="glass-card p-2">
              <PieChart size={18} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="glass-card">
            <CardHeader className="pb-2">
              <CardTitle>CV Views</CardTitle>
              <CardDescription>Last 30 days</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-36 flex flex-col items-center justify-center">
                <span className="text-4xl font-bold">247</span>
                <span className="text-xs text-emerald-500 font-medium mt-1">↑ 12% from previous period</span>
              </div>
            </CardContent>
          </Card>
          
          <Card className="glass-card">
            <CardHeader className="pb-2">
              <CardTitle>Downloads</CardTitle>
              <CardDescription>Last 30 days</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-36 flex flex-col items-center justify-center">
                <span className="text-4xl font-bold">36</span>
                <span className="text-xs text-emerald-500 font-medium mt-1">↑ 8% from previous period</span>
              </div>
            </CardContent>
          </Card>
          
          <Card className="glass-card">
            <CardHeader className="pb-2">
              <CardTitle>Profile Completion</CardTitle>
              <CardDescription>Your progress</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-36 flex flex-col items-center justify-center">
                <span className="text-4xl font-bold">85%</span>
                <span className="text-xs text-primary font-medium mt-1">Add a portfolio to reach 100%</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Monthly Performance</CardTitle>
            <CardDescription>CV views and downloads over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80 flex items-center justify-center">
              <p className="text-muted-foreground">Chart visualization would be displayed here</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default Analytics;
