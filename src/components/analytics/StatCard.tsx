
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string;
  change: string;
  isPositive: boolean;
  icon: React.ReactNode;
}

export function StatCard({ title, value, change, isPositive, icon }: StatCardProps) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">{title}</span>
          <div className={cn(
            "rounded-full p-2",
            isPositive ? "text-emerald-500 bg-emerald-50 dark:bg-emerald-950/20" : "text-red-500 bg-red-50 dark:bg-red-950/20"
          )}>
            {icon}
          </div>
        </div>
        
        <div className="mt-3">
          <h3 className="text-3xl font-bold">{value}</h3>
          <div className="flex items-center mt-1">
            <span className={cn(
              "text-xs font-medium",
              isPositive ? "text-emerald-500" : "text-red-500"
            )}>
              {change} vs last period
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
