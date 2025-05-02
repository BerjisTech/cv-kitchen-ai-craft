
import React from 'react';
import { FileText, Clock, Download } from 'lucide-react';

interface ActivityItemProps {
  icon: React.ReactNode;
  title: string;
  time: string;
}

const ActivityItem = ({ icon, title, time }: ActivityItemProps) => (
  <div className="flex items-center gap-4 py-3">
    <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-primary/10 text-primary">
      {icon}
    </div>
    <div className="flex-1">
      <p className="text-sm font-medium">{title}</p>
      <p className="text-xs text-muted-foreground">{time}</p>
    </div>
  </div>
);

export const RecentActivity = () => {
  const activities = [
    {
      icon: <Clock size={16} />,
      title: "Updated Frontend Developer CV",
      time: "2 hours ago"
    },
    {
      icon: <FileText size={16} />,
      title: "Generated cover letter for Google",
      time: "1 day ago"
    },
    {
      icon: <Download size={16} />,
      title: "Downloaded CV as PDF",
      time: "3 days ago"
    }
  ];

  return (
    <div className="glass-card p-6">
      <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
      <div className="space-y-1">
        {activities.map((activity, index) => (
          <ActivityItem 
            key={index}
            icon={activity.icon}
            title={activity.title}
            time={activity.time}
          />
        ))}
      </div>
    </div>
  );
};
