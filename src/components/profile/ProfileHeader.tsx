
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Share2, Download, User } from 'lucide-react';

export const ProfileHeader: React.FC = () => {
  return (
    <Card className="glass-card">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
          <div className="relative">
            <div className="w-28 h-28 rounded-full overflow-hidden bg-primary/20 border border-white/30 flex items-center justify-center">
              <User size={40} className="text-primary/60" />
            </div>
            <div className="absolute -bottom-1 -right-1 bg-green-500 w-5 h-5 rounded-full border-2 border-white" />
          </div>
          
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-2xl font-bold">John Doe</h1>
            <p className="text-muted-foreground">Senior Frontend Developer</p>
            <p className="mt-1 text-sm max-w-md">Passionate about creating intuitive user interfaces and delivering exceptional user experiences</p>
            
            <div className="flex flex-wrap gap-2 mt-3 justify-center md:justify-start">
              <span className="px-3 py-1 bg-primary/10 text-primary text-xs rounded-full">
                React
              </span>
              <span className="px-3 py-1 bg-primary/10 text-primary text-xs rounded-full">
                TypeScript
              </span>
              <span className="px-3 py-1 bg-primary/10 text-primary text-xs rounded-full">
                UI/UX
              </span>
            </div>
          </div>
          
          <div className="flex gap-2 self-center">
            <Button variant="outline" size="sm" className="gap-2">
              <Share2 size={16} />
              Share
            </Button>
            <Button size="sm" className="gap-2">
              <Download size={16} />
              Download CV
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
