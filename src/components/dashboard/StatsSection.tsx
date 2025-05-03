
import React from 'react';
import { FileText, BookOpen, Briefcase, LineChart } from 'lucide-react';

interface StatCardProps {
  icon: React.ReactNode;
  value: string | number;
  label: string;
  iconBgColor: string;
  iconColor: string;
}

interface StatsSectionProps {
  isLoading?: boolean;
  stats?: Array<{
    title: string;
    value: string;
    icon: string;
  }>;
}

const StatCard = ({ icon, value, label, iconBgColor, iconColor }: StatCardProps) => (
  <div className="flex items-center gap-4">
    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${iconBgColor}`}>
      <div className={`${iconColor}`}>{icon}</div>
    </div>
    <div>
      <p className="text-2xl font-semibold">{value}</p>
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  </div>
);

export const StatsSection = ({ isLoading, stats }: StatsSectionProps) => {
  const defaultStats = [
    {
      icon: <FileText size={20} />,
      value: 5,
      label: "CVs Created",
      iconBgColor: "bg-blue-100",
      iconColor: "text-blue-600"
    },
    {
      icon: <BookOpen size={20} />,
      value: 3,
      label: "Cover Letters",
      iconBgColor: "bg-emerald-100",
      iconColor: "text-emerald-600"
    },
    {
      icon: <Briefcase size={20} />,
      value: 8,
      label: "Job Applications",
      iconBgColor: "bg-orange-100",
      iconColor: "text-orange-500"
    },
    {
      icon: <LineChart size={20} />,
      value: 27,
      label: "Profile Views",
      iconBgColor: "bg-emerald-100",
      iconColor: "text-emerald-600"
    }
  ];

  return (
    <div className="glass-card p-6">
      <h2 className="text-lg font-semibold mb-4">Stats</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {isLoading ? (
          // Loading skeleton
          Array(4).fill(0).map((_, i) => (
            <div key={i} className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-muted animate-pulse"></div>
              <div>
                <div className="h-6 w-20 bg-muted animate-pulse rounded mb-1"></div>
                <div className="h-4 w-16 bg-muted animate-pulse rounded"></div>
              </div>
            </div>
          ))
        ) : stats ? (
          stats.map((stat, i) => {
            const icon = (() => {
              switch(stat.icon) {
                case 'document': return <FileText size={20} />;
                case 'mail': return <BookOpen size={20} />;
                case 'chart': return <LineChart size={20} />;
                default: return <FileText size={20} />;
              }
            })();
            
            return (
              <StatCard 
                key={i}
                icon={icon}
                value={stat.value}
                label={stat.title}
                iconBgColor="bg-blue-100"
                iconColor="text-blue-600"
              />
            );
          })
        ) : (
          defaultStats.map((stat, i) => (
            <StatCard
              key={i}
              icon={stat.icon}
              value={stat.value}
              label={stat.label}
              iconBgColor={stat.iconBgColor}
              iconColor={stat.iconColor}
            />
          ))
        )}
      </div>
    </div>
  );
};
