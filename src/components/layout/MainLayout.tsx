
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
      <div className="relative h-full transition-all duration-300 ease-in-out"
        style={{ 
          width: leftSidebarCollapsed ? '60px' : '240px'
        }}
      >
        <LeftSidebar 
          collapsed={leftSidebarCollapsed} 
          onToggleCollapse={() => setLeftSidebarCollapsed(!leftSidebarCollapsed)} 
        />
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
      <div className="relative h-full transition-all duration-300 ease-in-out"
        style={{ 
          width: rightSidebarCollapsed ? '60px' : '300px'
        }}
      >
        <RightSidebar 
          collapsed={rightSidebarCollapsed} 
          onToggleCollapse={() => setRightSidebarCollapsed(!rightSidebarCollapsed)} 
        />
      </div>
    </div>
  );
};
