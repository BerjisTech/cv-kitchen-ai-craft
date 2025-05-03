
import React from 'react';
import { Button } from '@/components/ui/button';
import { Filter, Plus, LayoutGrid, List } from 'lucide-react';

interface ShelfHeaderProps {
  viewMode: 'grid' | 'list';
  setViewMode: (mode: 'grid' | 'list') => void;
  itemCount: number;
  handleCreateNew: () => void;
}

export const ShelfHeader: React.FC<ShelfHeaderProps> = ({
  viewMode,
  setViewMode,
  itemCount,
  handleCreateNew
}) => {
  return (
    <>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Your CV Shelf</h1>
          <p className="text-muted-foreground">Manage your CVs and cover letters</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" className="gap-1.5">
            <Filter size={16} />
            Filter
          </Button>
          
          <Button 
            size="sm" 
            className="bg-blue-500 hover:bg-blue-600 gap-1.5"
            onClick={handleCreateNew}
          >
            <Plus size={16} />
            Create New
          </Button>
        </div>
      </div>
      
      {/* Count and View Controls */}
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">{itemCount} items</p>
        <div className="flex gap-2">
          <Button
            variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
            size="icon"
            onClick={() => setViewMode('grid')}
            className="size-8"
          >
            <LayoutGrid size={16} />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'secondary' : 'ghost'}
            size="icon"
            onClick={() => setViewMode('list')}
            className="size-8"
          >
            <List size={16} />
          </Button>
        </div>
      </div>
    </>
  );
};
