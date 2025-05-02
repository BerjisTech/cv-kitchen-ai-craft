
import React from 'react';
import { Upload, LifeBuoy, Bell } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RightSidebarProps {
  collapsed: boolean;
}

export const RightSidebar: React.FC<RightSidebarProps> = ({ collapsed }) => {
  const actions = [
    { name: 'Upload CV', icon: Upload },
    { name: 'Help', icon: LifeBuoy },
    { name: 'Notifications', icon: Bell, badge: 2 },
  ];

  return (
    <div className="h-full glass border-l border-slate-200 flex flex-col">
      <div className="flex-1 p-4">
        <div className="flex flex-col items-center gap-6 mt-4">
          {actions.map((action) => (
            <div key={action.name} className="relative group">
              <button 
                className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center hover:bg-primary/10 transition-colors"
              >
                <action.icon 
                  size={20} 
                  className="text-muted-foreground group-hover:text-primary"
                />
              </button>
              
              {action.badge && (
                <span className="absolute -top-1 -right-1 flex items-center justify-center w-5 h-5 bg-primary text-white text-xs font-medium rounded-full">
                  {action.badge}
                </span>
              )}
              
              {!collapsed && (
                <span className="absolute left-14 top-2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap text-sm">
                  {action.name}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
      
      {!collapsed && (
        <div className="p-4">
          <div className="glass-card p-4">
            <h4 className="font-semibold text-sm">AI Assistant</h4>
            <p className="text-xs text-muted-foreground mt-1">
              Need help with your CV? Ask me anything!
            </p>
            <button className="w-full mt-3 bg-primary/10 text-primary text-sm py-2 rounded-lg hover:bg-primary/20 transition-colors">
              Start Chat
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
