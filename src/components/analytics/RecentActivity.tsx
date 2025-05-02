
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye, Download, Users, Share2 } from 'lucide-react';

interface ActivityItemProps {
  icon: React.ReactNode;
  title: string;
  time: string;
}

const ActivityItem = ({ icon, title, time }: ActivityItemProps) => {
  return (
    <div className="flex items-center gap-4 py-4 border-b last:border-0">
      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
        {icon}
      </div>
      <div className="flex-1">
        <p className="font-medium">{title}</p>
        <p className="text-sm text-muted-foreground">{time}</p>
      </div>
    </div>
  );
};

export function RecentActivity() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <ActivityItem 
          icon={<Eye className="h-4 w-4 text-primary" />}
          title="CV viewed by recruiter at Google"
          time="2 hours ago"
        />
        <ActivityItem 
          icon={<Download className="h-4 w-4 text-primary" />}
          title="Frontend Developer CV downloaded"
          time="1 day ago"
        />
        <ActivityItem 
          icon={<Users className="h-4 w-4 text-primary" />}
          title="Profile viewed by 12 people"
          time="2 days ago"
        />
        <ActivityItem 
          icon={<Share2 className="h-4 w-4 text-primary" />}
          title="UX Designer CV shared"
          time="3 days ago"
        />
      </CardContent>
    </Card>
  );
}
