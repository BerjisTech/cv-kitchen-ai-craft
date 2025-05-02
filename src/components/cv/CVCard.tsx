
import React from 'react';
import { Button } from '@/components/ui/button';
import { FileText, Eye, Edit, Download } from 'lucide-react';

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
    <div className="bg-muted/30 rounded-lg overflow-hidden flex flex-col h-full border border-border/20">
      {/* CV Thumbnail */}
      <div className="aspect-[3/4] relative overflow-hidden bg-muted/20 flex items-center justify-center">
        {thumbnailUrl ? (
          <img 
            src={thumbnailUrl} 
            alt={`${title} CV preview`}
            className="w-full h-full object-cover"
          />
        ) : (
          <FileText className="h-16 w-16 text-muted-foreground/60" />
        )}
      </div>
      
      {/* CV Info */}
      <div className="p-4 flex-1">
        <h3 className="font-medium">{title}</h3>
        {category && <p className="text-sm text-muted-foreground">{category}</p>}
        {company && <p className="text-sm text-muted-foreground">{company}</p>}
      </div>
      
      {/* Actions */}
      <div className="flex items-center justify-between px-4 py-3 border-t border-border/20">
        <p className="text-xs text-muted-foreground">{lastUpdated}</p>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Eye size={16} />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Edit size={16} />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Download size={16} />
          </Button>
        </div>
      </div>
    </div>
  );
};
