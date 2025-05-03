
import React from 'react';
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { UserCog, Briefcase, User as UserIcon } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';
import type { UserRole } from '@/context/AuthContext';

export const RoleSwitcher: React.FC = () => {
  const { userRole, activeRole, switchRole, isAdmin } = useAuth();
  
  if (!userRole) return null;
  
  return (
    <div className="mb-4">
      <ToggleGroup type="single" value={activeRole || undefined} onValueChange={(value) => switchRole(value as UserRole)}>
        <ToggleGroupItem 
          value="job_seeker" 
          aria-label="Job Seeker View"
          className={cn(
            "flex items-center gap-2",
            activeRole === 'job_seeker' && "bg-primary text-primary-foreground"
          )}
        >
          <UserIcon className="h-4 w-4" />
          <span className="hidden sm:inline">Job Seeker</span>
        </ToggleGroupItem>
        
        <ToggleGroupItem 
          value="recruiter" 
          aria-label="Recruiter View"
          className={cn(
            "flex items-center gap-2",
            activeRole === 'recruiter' && "bg-primary text-primary-foreground"
          )}
        >
          <Briefcase className="h-4 w-4" />
          <span className="hidden sm:inline">Recruiter</span>
        </ToggleGroupItem>
        
        {isAdmin && (
          <ToggleGroupItem 
            value={userRole as UserRole} 
            aria-label="Admin View"
            className={cn(
              "flex items-center gap-2",
              (activeRole === 'staff' || activeRole === 'superadmin') && "bg-primary text-primary-foreground"
            )}
          >
            <UserCog className="h-4 w-4" />
            <span className="hidden sm:inline">Admin</span>
          </ToggleGroupItem>
        )}
      </ToggleGroup>
    </div>
  );
};
