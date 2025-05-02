
import React from 'react';
import { FileText, BookOpen, Briefcase, LineChart } from 'lucide-react';

interface StatCardProps {
  icon: React.ReactNode;
  value: string | number;
  label: string;
  iconBgColor: string;
  iconColor: string;
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

export const StatsSection = () => {
  return (
    <div className="glass-card p-6">
      <h2 className="text-lg font-semibold mb-4">Stats</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <StatCard 
          icon={<FileText size={20} />}
          value={5}
          label="CVs Created"
          iconBgColor="bg-blue-100"
          iconColor="text-blue-600"
        />
        <StatCard 
          icon={<BookOpen size={20} />}
          value={3}
          label="Cover Letters"
          iconBgColor="bg-emerald-100"
          iconColor="text-emerald-600"
        />
        <StatCard 
          icon={<Briefcase size={20} />}
          value={8}
          label="Job Applications"
          iconBgColor="bg-orange-100"
          iconColor="text-orange-500"
        />
        <StatCard 
          icon={<LineChart size={20} />}
          value={27}
          label="Profile Views"
          iconBgColor="bg-emerald-100"
          iconColor="text-emerald-600"
        />
      </div>
    </div>
  );
};
