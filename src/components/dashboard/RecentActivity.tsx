
import React, { useEffect, useState } from 'react';
import { FileText, Clock, Download, Search, User, FileEdit } from 'lucide-react';
import { getUserActivity, UserActivity } from '@/services/activityService';
import { formatDistanceToNow } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';

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
  const [activities, setActivities] = useState<UserActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchActivity = async () => {
      setIsLoading(true);
      try {
        const data = await getUserActivity();
        setActivities(data);
      } catch (error) {
        console.error("Error fetching activities:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchActivity();
  }, []);

  const getIconByType = (type: string, iconName: string) => {
    switch (iconName) {
      case 'fileText':
        return <FileText size={16} />;
      case 'search':
        return <Search size={16} />;
      case 'download':
        return <Download size={16} />;
      case 'clock':
        return <Clock size={16} />;
      case 'user':
        return <User size={16} />;
      case 'fileEdit':
        return <FileEdit size={16} />;
      default:
        return <Clock size={16} />;
    }
  };

  const formatTimeAgo = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch (error) {
      return "recently";
    }
  };

  return (
    <div className="glass-card p-6">
      <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
      <div className="space-y-1">
        {isLoading ? (
          Array(3).fill(0).map((_, index) => (
            <div key={index} className="flex items-center gap-4 py-3">
              <Skeleton className="w-8 h-8 rounded-full" />
              <div className="flex-1">
                <Skeleton className="h-4 w-3/4 mb-2" />
                <Skeleton className="h-3 w-1/3" />
              </div>
            </div>
          ))
        ) : activities.length > 0 ? (
          activities.map((activity) => (
            <ActivityItem 
              key={activity.id}
              icon={getIconByType(activity.type, activity.icon)}
              title={activity.title}
              time={formatTimeAgo(activity.time)}
            />
          ))
        ) : (
          <div className="py-3 text-center text-muted-foreground">
            <p>No recent activity</p>
          </div>
        )}
      </div>
    </div>
  );
};
