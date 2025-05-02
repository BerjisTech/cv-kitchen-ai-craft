
import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const data = [
  { month: 'Jan', views: 400, downloads: 30 },
  { month: 'Feb', views: 300, downloads: 25 },
  { month: 'Mar', views: 500, downloads: 35 },
  { month: 'Apr', views: 270, downloads: 20 },
  { month: 'May', views: 600, downloads: 45 },
  { month: 'Jun', views: 700, downloads: 55 },
  { month: 'Jul', views: 650, downloads: 50 },
  { month: 'Aug', views: 800, downloads: 65 },
  { month: 'Sep', views: 750, downloads: 60 },
  { month: 'Oct', views: 900, downloads: 75 },
  { month: 'Nov', views: 950, downloads: 80 },
  { month: 'Dec', views: 1000, downloads: 85 },
];

export function PerformanceChart() {
  return (
    <div>
      <div className="mb-6">
        <h3 className="text-lg font-semibold">Monthly Performance</h3>
        <p className="text-sm text-muted-foreground">CV views and interactions over time</p>
      </div>
      
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0EA5E9" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#0EA5E9" stopOpacity={0.1} />
              </linearGradient>
              <linearGradient id="colorDownloads" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10B981" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#10B981" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Area 
              type="monotone" 
              dataKey="views" 
              name="Views"
              stroke="#0EA5E9" 
              fillOpacity={1} 
              fill="url(#colorViews)" 
            />
            <Area 
              type="monotone" 
              dataKey="downloads" 
              name="Downloads"
              stroke="#10B981" 
              fillOpacity={1} 
              fill="url(#colorDownloads)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
