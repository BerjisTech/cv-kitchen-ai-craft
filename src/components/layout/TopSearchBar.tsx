
import React, { useState } from 'react';
import { Search } from 'lucide-react';

export const TopSearchBar: React.FC = () => {
  const [focused, setFocused] = useState(false);
  
  return (
    <div className="flex items-center justify-center w-full h-16 px-4 border-b border-slate-200">
      <div 
        className={`
          relative max-w-xl w-full transition-all duration-300
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
    </div>
  );
};
