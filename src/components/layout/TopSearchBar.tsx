import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { UserMenu } from '@/components/auth/UserMenu';
import { RoleSwitcher } from "@/components/auth/RoleSwitcher";

export const TopSearchBar = () => {
  const [focused, setFocused] = useState(false);
  
  return (
    <div className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div 
        className={`
          relative max-w-xl transition-all duration-300
          ${focused ? 'w-full' : 'w-3/4'}
        `}
      >
        <div className={`
          flex items-center w-full px-4 h-10 rounded-full
          ${focused 
            ? 'bg-white shadow-md ring-1 ring-primary/20' 
            : 'bg-muted/50'
          }
        `}>
          <Search size={18} className="text-muted-foreground" />
          <input
            type="text"
            placeholder="Search CVs, templates, or type a command..."
            className="w-full h-full bg-transparent px-3 focus:outline-none"
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
          />
        </div>
        
        {focused && (
          <div className="absolute top-full left-0 right-0 mt-1 p-2 bg-white rounded-lg shadow-lg border border-slate-200 z-50">
            <div className="text-sm text-muted-foreground p-2">
              Try searching for "tech resume" or "marketing cover letter"
            </div>
          </div>
        )}
      </div>
      
      <div className="flex items-center gap-4 md:ml-auto md:gap-2 lg:gap-4">
        <RoleSwitcher />
        <UserMenu />
      </div>
    </div>
  );
};
