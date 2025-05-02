
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface CVItemProps {
  title: string;
  views: number;
  downloads: number;
  change: string;
}

const CVItem = ({ title, views, downloads, change }: CVItemProps) => {
  return (
    <div className="flex items-center justify-between py-4 border-b last:border-0">
      <div className="flex items-center gap-4">
        <div className="w-8 h-8 flex items-center justify-center">
          <div className="w-1 h-12 bg-gray-200 rounded-full"></div>
        </div>
        <div>
          <p className="font-medium">{title}</p>
          <p className="text-sm text-muted-foreground">{views} views • {downloads} downloads</p>
        </div>
      </div>
      <div className="text-emerald-500 text-sm font-medium">
        {change}
      </div>
    </div>
  );
};

export function PopularCVs() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Popular CVs</CardTitle>
      </CardHeader>
      <CardContent>
        <CVItem 
          title="Frontend Developer"
          views={847}
          downloads={42}
          change="+16%"
        />
        <CVItem 
          title="UX Designer"
          views={623}
          downloads={31}
          change="+5%"
        />
        <CVItem 
          title="Product Manager"
          views={456}
          downloads={28}
          change="+11%"
        />
      </CardContent>
    </Card>
  );
}
