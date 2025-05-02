
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';

// Generate calendar data grid
const generateCalendarData = () => {
  // Create a 4x7 grid to represent weeks and days
  const rows = 4;
  const cols = 7;
  const grid = [];
  
  for (let i = 0; i < rows; i++) {
    const row = [];
    for (let j = 0; j < cols; j++) {
      // Random activity level between 0 and 4
      const activityLevel = Math.floor(Math.random() * 5);
      row.push(activityLevel);
    }
    grid.push(row);
  }
  
  return grid;
};

export function ActivityCalendar() {
  const [calendarData] = useState(generateCalendarData());
  
  // Function to get appropriate background color based on activity level
  const getActivityColor = (level: number) => {
    const colors = [
      "bg-blue-50 dark:bg-blue-950/20", // Lowest activity 
      "bg-blue-100 dark:bg-blue-900/30",
      "bg-blue-200 dark:bg-blue-800/40",
      "bg-blue-300 dark:bg-blue-700/50",
      "bg-blue-400 dark:bg-blue-600/60"  // Highest activity
    ];
    
    return colors[level];
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Calendar View</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">Activity distribution over time</p>
        </div>
        <Button variant="outline" size="sm" className="gap-1">
          <CalendarIcon className="h-4 w-4" />
          <span>View Calendar</span>
        </Button>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-2">
          {calendarData.flat().map((level, index) => (
            <div 
              key={index}
              className={`
                aspect-square rounded-sm ${getActivityColor(level)}
                transition-colors duration-200 hover:opacity-80 cursor-pointer
              `}
              title={`${level * 5} activities`}
            />
          ))}
        </div>
        
        <div className="flex justify-between items-center mt-4">
          <span className="text-xs text-muted-foreground">Less</span>
          <div className="flex gap-1">
            {[0, 1, 2, 3, 4].map(level => (
              <div 
                key={level}
                className={`w-4 h-4 rounded-sm ${getActivityColor(level)}`}
              />
            ))}
          </div>
          <span className="text-xs text-muted-foreground">More</span>
        </div>
      </CardContent>
    </Card>
  );
}
