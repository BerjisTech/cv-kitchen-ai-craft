
import React from 'react';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Download, Eye, Edit } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

interface CVCardProps {
  title: string;
  company?: string;
  position?: string;
  lastUpdated: string;
  thumbnailUrl?: string;
  category?: string;
}

export const CVCard: React.FC<CVCardProps> = ({
  title,
  company,
  position,
  lastUpdated,
  thumbnailUrl,
  category
}) => {
  return (
    <div className="glass-card overflow-hidden flex flex-col h-full border border-white/10">
      {/* CV Thumbnail */}
      <div className="aspect-[3/4] relative overflow-hidden bg-muted/20">
        {thumbnailUrl ? (
          <img 
            src={thumbnailUrl} 
            alt={`${title} CV preview`}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="p-6 bg-white/90 rounded-lg">
              <h3 className="font-semibold">{title}</h3>
              {position && <p className="text-sm text-muted-foreground mt-1">{position}</p>}
            </div>
          </div>
        )}
      </div>
      
      {/* CV Info */}
      <div className="p-4 flex-1">
        <div>
          <h3 className="font-medium">{title}</h3>
          {company && <p className="text-sm text-muted-foreground">{company}</p>}
          {category && <p className="text-sm text-muted-foreground">{category}</p>}
        </div>
      </div>
      
      {/* Actions */}
      <div className="flex items-center justify-between px-4 py-3 border-t border-white/10">
        <p className="text-xs text-muted-foreground">{lastUpdated}</p>
        <div className="flex items-center gap-2">
          <button className="text-gray-500 hover:text-gray-700">
            <Eye size={16} />
          </button>
          <button className="text-gray-500 hover:text-gray-700">
            <Edit size={16} />
          </button>
          <button className="text-gray-500 hover:text-gray-700">
            <Download size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};
