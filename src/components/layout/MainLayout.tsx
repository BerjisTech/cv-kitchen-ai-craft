
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
      <div 
        className={`transition-all duration-300 ease-in-out ${
          leftSidebarCollapsed ? 'w-[60px]' : 'w-[240px]'
        }`}
      >
        <LeftSidebar collapsed={leftSidebarCollapsed} />
      </div>
      
      {/* Left sidebar toggle button */}
      <button
        onClick={() => setLeftSidebarCollapsed(!leftSidebarCollapsed)}
        className="absolute left-[240px] top-1/2 -translate-y-1/2 z-10 bg-primary text-white rounded-full p-1 shadow-md transition-all duration-300 ease-in-out"
        style={{ 
          transform: `translate(${leftSidebarCollapsed ? '-220px' : '0px'}, -50%)` 
        }}
      >
        {leftSidebarCollapsed ? (
          <ChevronRight size={16} />
        ) : (
          <ChevronLeft size={16} />
        )}
      </button>
      
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
      <div
        className={`transition-all duration-300 ease-in-out ${
          rightSidebarCollapsed ? 'w-[60px]' : 'w-[300px]'
        }`}
      >
        <RightSidebar collapsed={rightSidebarCollapsed} />
      </div>
      
      {/* Right sidebar toggle button */}
      <button
        onClick={() => setRightSidebarCollapsed(!rightSidebarCollapsed)}
        className="absolute right-[60px] top-1/2 -translate-y-1/2 z-10 bg-primary text-white rounded-full p-1 shadow-md transition-all duration-300 ease-in-out"
        style={{ 
          right: rightSidebarCollapsed ? '60px' : '300px'
        }}
      >
        {rightSidebarCollapsed ? (
          <ChevronLeft size={16} />
        ) : (
          <ChevronRight size={16} />
        )}
      </button>
    </div>
  );
};
