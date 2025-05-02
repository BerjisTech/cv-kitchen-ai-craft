
import React from 'react';
import { Upload, LifeBuoy, Bell, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RightSidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
}

export const RightSidebar: React.FC<RightSidebarProps> = ({ collapsed, onToggleCollapse }) => {
  const actions = [
    { name: 'Upload CV', icon: Upload },
    { name: 'Help', icon: LifeBuoy },
    { name: 'Notifications', icon: Bell, badge: 2 },
  ];

  return (
    <div className="h-full glass border-l border-white/20 flex flex-col">
      <div className="p-4 flex items-center justify-between">
        {/* Toggle button integrated in the sidebar header */}
        <button
          onClick={onToggleCollapse}
          className="bg-primary/10 hover:bg-primary/20 text-primary rounded-full p-1.5 transition-all duration-200"
        >
          {collapsed ? (
            <ChevronLeft size={16} />
          ) : (
            <ChevronRight size={16} />
          )}
        </button>
        
        {!collapsed && (
          <h2 className="font-medium text-sm text-primary">Actions</h2>
        )}
      </div>
      
      <div className="flex-1 p-4">
        <div className="flex flex-col items-center gap-6 mt-4">
          {actions.map((action) => (
            <div key={action.name} className="relative group w-full">
              <button 
                className={cn(
                  "rounded-lg backdrop-blur-sm border border-white/20 shadow-sm flex items-center hover:bg-primary/10 transition-colors",
                  collapsed 
                    ? "w-10 h-10 justify-center rounded-full bg-white/10" 
                    : "w-full p-3 justify-start gap-3 bg-white/5"
                )}
              >
                <action.icon 
                  size={20} 
                  className="text-muted-foreground group-hover:text-primary"
                />
                
                {!collapsed && (
                  <span className="text-sm font-medium">{action.name}</span>
                )}
              </button>
              
              {action.badge && (
                <span className="absolute -top-1 -right-1 flex items-center justify-center w-5 h-5 bg-primary text-white text-xs font-medium rounded-full">
                  {action.badge}
                </span>
              )}
              
              {collapsed && (
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
          <div className="glass-card p-4 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl">
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
