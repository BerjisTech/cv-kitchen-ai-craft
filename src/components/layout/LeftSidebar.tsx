
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Utensils, BookOpen, LineChart, Settings, User, ChevronLeft, ChevronRight, ExternalLink, LogIn } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';

interface LeftSidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
}

export const LeftSidebar: React.FC<LeftSidebarProps> = ({ collapsed, onToggleCollapse }) => {
  const location = useLocation();
  const { user } = useAuth();
  
  const navigation = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Kitchen', href: '/kitchen', icon: Utensils },
    { name: 'Shelf', href: '/shelf', icon: BookOpen },
    { name: 'Analytics', href: '/analytics', icon: LineChart },
    { name: 'Profile', href: '/profile', icon: User },
    { name: 'Public Profile', href: '/public-profile', icon: ExternalLink },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  return (
    <div className="h-full glass border-r border-white/20 flex flex-col">
      <div className="p-4 flex items-center justify-between">
        {!collapsed ? (
          <h2 className="font-bold text-xl text-primary">SmartCV</h2>
        ) : (
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold">
            S
          </div>
        )}
        
        {/* Toggle button integrated in the sidebar header */}
        <button
          onClick={onToggleCollapse}
          className="bg-primary/10 hover:bg-primary/20 text-primary rounded-full p-1.5 transition-all duration-200"
        >
          {collapsed ? (
            <ChevronRight size={16} />
          ) : (
            <ChevronLeft size={16} />
          )}
        </button>
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
          user ? (
            <div className="p-3 rounded-lg bg-primary/5 backdrop-blur-sm border border-primary/10">
              <p className="text-xs text-muted-foreground">
                Free account
              </p>
              <Link 
                to="/settings?tab=billing" 
                className="text-xs font-medium mt-1 hover:text-primary transition-colors block"
              >
                Upgrade to Pro
              </Link>
            </div>
          ) : (
            <Link
              to="/auth"
              className="w-full flex items-center justify-center gap-2 p-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
            >
              <LogIn size={18} />
              <span className="font-medium">Sign In</span>
            </Link>
          )
        )}
      </div>
    </div>
  );
};
