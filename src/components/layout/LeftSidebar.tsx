import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Utensils, 
  BookOpen, 
  LineChart, 
  Settings, 
  User, 
  ChevronLeft, 
  ChevronRight, 
  ExternalLink, 
  LogIn, 
  Shield, 
  ChevronDown 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { 
  Collapsible, 
  CollapsibleContent, 
  CollapsibleTrigger 
} from "@/components/ui/collapsible";

interface LeftSidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
}

export const LeftSidebar: React.FC<LeftSidebarProps> = ({ collapsed, onToggleCollapse }) => {
  const location = useLocation();
  const { user, isAdmin, userRole, activeRole } = useAuth();
  const [adminExpanded, setAdminExpanded] = useState(location.pathname.startsWith('/admin'));
  
  // Get username for public profile link
  const username = user?.user_metadata?.username || '';
  
  // Debugging - log roles to console
  React.useEffect(() => {
    if (user) {
      console.log('LeftSidebar - User role:', userRole);
      console.log('LeftSidebar - Active role:', activeRole);
      console.log('LeftSidebar - Is admin:', isAdmin);
      console.log('LeftSidebar - User metadata:', user.user_metadata);
    }
  }, [user, userRole, activeRole, isAdmin]);
  
  const navigation = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Kitchen', href: '/kitchen', icon: Utensils },
    { name: 'Shelf', href: '/shelf', icon: BookOpen },
    { name: 'Analytics', href: '/analytics', icon: LineChart },
    { name: 'Profile', href: '/profile', icon: User },
    { 
      name: 'Public Profile', 
      href: username ? `/u/${username}` : '/u/public-profile', 
      icon: ExternalLink 
    },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  // Admin section links
  const adminLinks = [
    { name: 'Admin Dashboard', href: '/admin/dashboard' },
    { name: 'Analytics', href: '/admin/analytics' },
    { name: 'Users', href: '/admin/users' },
    { name: 'Jobs', href: '/admin/jobs' },
    { name: 'Billing', href: '/admin/billing' },
    { name: 'AI Management', href: '/admin/ai' },
    { name: 'Content', href: '/admin/content' },
    { name: 'Roles', href: '/admin/roles' },
    { name: 'Communications', href: '/admin/communications' },
    { name: 'System', href: '/admin/system' }
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
      
      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
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
        
        {/* Admin section with collapsible menu */}
        {isAdmin && (
          <Collapsible
            open={adminExpanded}
            onOpenChange={setAdminExpanded}
            className={cn(
              "mt-4 pt-4 border-t border-white/10",
              collapsed && "items-center"
            )}
          >
            <CollapsibleTrigger className={cn(
              "sidebar-item w-full justify-between",
              location.pathname.startsWith('/admin') && "sidebar-item-active",
              "group"
            )}>
              <div className="flex items-center">
                <Shield 
                  className={cn(
                    "shrink-0",
                    location.pathname.startsWith('/admin') ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                  )}
                  size={20}
                />
                {!collapsed && (
                  <span className={cn(
                    "truncate ml-2",
                    location.pathname.startsWith('/admin') ? "font-medium" : ""
                  )}>
                    Admin
                  </span>
                )}
              </div>
              {!collapsed && (
                <ChevronDown 
                  className={cn(
                    "h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200",
                    adminExpanded && "rotate-180"
                  )}
                />
              )}
            </CollapsibleTrigger>
            
            {/* Admin submenu */}
            <CollapsibleContent className={cn(
              "pl-8 space-y-1 mt-1",
              collapsed && "hidden"
            )}>
              {adminLinks.map((item) => {
                const isActive = location.pathname === item.href;
                
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={cn(
                      "flex items-center text-sm py-1.5 px-3 rounded-md",
                      isActive ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                    )}
                  >
                    <span className="truncate">{item.name}</span>
                  </Link>
                );
              })}
            </CollapsibleContent>
          </Collapsible>
        )}
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
