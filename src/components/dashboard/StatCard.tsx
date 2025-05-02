
import React from 'react';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon: Icon,
  description,
  trend,
  trendValue,
  className,
}) => {
  return (
    <div className={cn("glass-card p-5", className)}>
      <div className="flex justify-between">
        <div>
          <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
          <div className="mt-1 flex items-baseline">
            <p className="text-2xl font-semibold">{value}</p>
            {trendValue && (
              <p 
                className={cn(
                  "ml-2 text-xs",
                  trend === 'up' && "text-green-600",
                  trend === 'down' && "text-red-600",
                  trend === 'neutral' && "text-muted-foreground"
                )}
              >
                {trendValue}
              </p>
            )}
          </div>
          {description && (
            <p className="mt-1 text-xs text-muted-foreground">{description}</p>
          )}
        </div>
        <div className="rounded-full bg-primary/10 p-3">
          <Icon className="h-5 w-5 text-primary" aria-hidden="true" />
        </div>
      </div>
    </div>
  );
};
