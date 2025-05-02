
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Utensils, BookOpen, LineChart, Settings, User } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LeftSidebarProps {
  collapsed: boolean;
}

export const LeftSidebar: React.FC<LeftSidebarProps> = ({ collapsed }) => {
  const location = useLocation();
  
  const navigation = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Kitchen', href: '/kitchen', icon: Utensils },
    { name: 'Shelf', href: '/shelf', icon: BookOpen },
    { name: 'Analytics', href: '/analytics', icon: LineChart },
    { name: 'Profile', href: '/profile', icon: User },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  return (
    <div className="h-full glass border-r border-slate-200 flex flex-col">
      <div className="p-4 flex items-center justify-center">
        {!collapsed ? (
          <h2 className="font-bold text-xl text-primary">SmartCV</h2>
        ) : (
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold">
            S
          </div>
        )}
      </div>
      
      <nav className="flex-1 px-2 py-4 space-y-1">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href;
          
          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                "sidebar-item",
                isActive && "sidebar-item-active",
                "group"
              )}
            >
              <item.icon 
                className={cn(
                  "shrink-0",
                  isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                )}
                size={20}
              />
              {!collapsed && (
                <span className={cn(
                  "truncate",
                  isActive ? "font-medium" : ""
                )}>
                  {item.name}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
      
      <div className="p-4">
        {!collapsed && (
          <div className="p-3 rounded-lg bg-muted/50">
            <p className="text-xs text-muted-foreground">
              Free account
            </p>
            <p className="text-xs font-medium mt-1">
              Upgrade to Pro
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
