
import React, { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { CalendarIcon, Eye, Download, Users, Clock } from 'lucide-react';
import { StatCard } from '@/components/analytics/StatCard';
import { PerformanceChart } from '@/components/analytics/PerformanceChart';
import { PopularCVs } from '@/components/analytics/PopularCVs';
import { RecentActivity } from '@/components/analytics/RecentActivity';
import { ActivityCalendar } from '@/components/analytics/ActivityCalendar';

const Analytics = () => {
  const [timeRange, setTimeRange] = useState('30');

  return (
    <MainLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Analytics Overview</h1>
            <p className="text-muted-foreground mt-1">Track your CV and profile performance</p>
          </div>
          
          <Select defaultValue={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 Days</SelectItem>
              <SelectItem value="30">Last 30 Days</SelectItem>
              <SelectItem value="90">Last 3 Months</SelectItem>
              <SelectItem value="365">Last Year</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard 
            title="Total Views" 
            value="2,847" 
            change="+12.5%" 
            isPositive={true} 
            icon={<Eye className="h-5 w-5" />}
          />
          
          <StatCard 
            title="CV Downloads" 
            value="164" 
            change="+8.2%" 
            isPositive={true}
            icon={<Download className="h-5 w-5" />} 
          />
          
          <StatCard 
            title="Profile Visits" 
            value="1,293" 
            change="+15.3%" 
            isPositive={true}
            icon={<Users className="h-5 w-5" />} 
          />
          
          <StatCard 
            title="Avg. Time" 
            value="2m 34s" 
            change="-2.1%" 
            isPositive={false}
            icon={<Clock className="h-5 w-5" />} 
          />
        </div>

        {/* Performance Chart */}
        <Card>
          <CardContent className="pt-6">
            <PerformanceChart />
          </CardContent>
        </Card>

        {/* Popular CVs and Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <PopularCVs />
          <RecentActivity />
        </div>

        {/* Calendar View */}
        <ActivityCalendar />
      </div>
    </MainLayout>
  );
};

export default Analytics;
