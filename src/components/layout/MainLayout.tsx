
import React, { useState } from 'react';
import { LeftSidebar } from './LeftSidebar';
import { TopSearchBar } from './TopSearchBar';
import { RightSidebar } from './RightSidebar';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface MainLayoutProps {
  children: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const [leftSidebarCollapsed, setLeftSidebarCollapsed] = useState(false);
  const [rightSidebarCollapsed, setRightSidebarCollapsed] = useState(true);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-gradient-to-br from-background to-accent/30">
      {/* Left Sidebar */}
      <div className="relative flex flex-col transition-all duration-300 ease-in-out"
        style={{ 
          width: leftSidebarCollapsed ? '60px' : '240px'
        }}
      >
        {/* Left sidebar toggle button */}
        <button
          onClick={() => setLeftSidebarCollapsed(!leftSidebarCollapsed)}
          className="absolute right-0 top-4 z-10 bg-primary text-white rounded-full p-1 shadow-md transition-all duration-300 ease-in-out translate-x-1/2"
        >
          {leftSidebarCollapsed ? (
            <ChevronRight size={16} />
          ) : (
            <ChevronLeft size={16} />
          )}
        </button>
        
        <LeftSidebar collapsed={leftSidebarCollapsed} />
      </div>
      
      {/* Main Content */}
      <div className="flex flex-col flex-1 relative">
        <TopSearchBar />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="animate-fade-in">
            {children}
          </div>
        </main>
      </div>
      
      {/* Right Sidebar */}
      <div className="relative flex flex-col transition-all duration-300 ease-in-out"
        style={{ 
          width: rightSidebarCollapsed ? '60px' : '300px'
        }}
      >
        {/* Right sidebar toggle button */}
        <button
          onClick={() => setRightSidebarCollapsed(!rightSidebarCollapsed)}
          className="absolute left-0 top-4 z-10 bg-primary text-white rounded-full p-1 shadow-md transition-all duration-300 ease-in-out -translate-x-1/2"
        >
          {rightSidebarCollapsed ? (
            <ChevronLeft size={16} />
          ) : (
            <ChevronRight size={16} />
          )}
        </button>
        
        <RightSidebar collapsed={rightSidebarCollapsed} />
      </div>
    </div>
  );
};
