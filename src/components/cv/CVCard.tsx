
import React from 'react';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Download } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

interface CVCardProps {
  title: string;
  company?: string;
  position?: string;
  lastUpdated: string;
  thumbnailUrl?: string;
}

export const CVCard: React.FC<CVCardProps> = ({
  title,
  company,
  position,
  lastUpdated,
  thumbnailUrl
}) => {
  return (
    <div className="glass-card overflow-hidden flex flex-col h-full">
      {/* CV Thumbnail */}
      <div className="aspect-[3/4] relative overflow-hidden bg-muted/30">
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
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-medium">{title}</h3>
            {company && <p className="text-sm text-muted-foreground">{company}</p>}
            <p className="text-xs text-muted-foreground mt-1">Last updated: {lastUpdated}</p>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal size={18} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Edit</DropdownMenuItem>
              <DropdownMenuItem>Duplicate</DropdownMenuItem>
              <DropdownMenuItem>Share</DropdownMenuItem>
              <DropdownMenuItem>Delete</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      {/* Actions */}
      <div className="p-4 pt-2 border-t border-slate-100">
        <div className="flex gap-2">
          <Button size="sm" className="w-full gap-1.5">
            <Download size={14} />
            Download
          </Button>
        </div>
      </div>
    </div>
  );
};
