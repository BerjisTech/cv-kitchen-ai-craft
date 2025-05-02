
import React, { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { FileText, Eye, Download, Edit, Filter, Plus, LayoutGrid, List } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';

const Shelf = () => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  // Mock data for resumes
  const resumes = [
    {
      title: 'Frontend Developer',
      category: 'Modern template',
      lastUpdated: '2 days ago'
    },
    {
      title: 'UX Designer',
      category: 'Creative template',
      lastUpdated: '1 week ago'
    },
    {
      title: 'Product Manager',
      category: 'Professional template',
      lastUpdated: '2 weeks ago'
    },
    {
      title: 'Web Developer',
      category: 'Minimalist template',
      lastUpdated: '1 month ago'
    },
  ];
  
  // Mock data for cover letters
  const coverLetters = [
    {
      title: 'Google Application',
      position: 'Frontend Developer',
      lastUpdated: '2 days ago'
    },
    {
      title: 'Microsoft Cover Letter',
      position: 'UX Designer',
      lastUpdated: '1 week ago'
    },
    {
      title: 'Amazon Application',
      position: 'Product Manager',
      lastUpdated: '2 weeks ago'
    },
  ];
  
  // Mock data for templates
  const templates = [
    {
      name: 'Modern',
      description: 'A clean, modern design with a touch of color.',
      isPremium: false,
      image: 'https://images.unsplash.com/photo-1569698145698-0e5d2a12cab5?q=80&w=200'
    },
    {
      name: 'Professional',
      description: 'A traditional, professional layout suitable for corporate roles.',
      isPremium: false,
      image: 'https://images.unsplash.com/photo-1572021335469-31706a17aaef?q=80&w=200'
    },
    {
      name: 'Creative',
      description: 'A bold, creative design to help you stand out.',
      isPremium: true,
      image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=200'
    },
    {
      name: 'Minimalist',
      description: 'A simple, minimalist design focusing on content.',
      isPremium: false,
      image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=200'
    }
  ];

  return (
    <MainLayout>
      <div className="space-y-8">
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
            
            <Button size="sm" className="bg-blue-500 hover:bg-blue-600 gap-1.5">
              <Plus size={16} />
              Create New
            </Button>
          </div>
        </div>
        
        {/* Count and View Controls */}
        <div className="flex justify-between items-center">
          <p className="text-sm text-muted-foreground">{resumes.length + coverLetters.length} items</p>
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
        
        {/* Resumes Section */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Resumes</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {resumes.map((resume, index) => (
              <div key={index} className="glass-card overflow-hidden">
                <div className="aspect-[3/4] bg-gray-100 flex items-center justify-center">
                  <FileText size={64} className="text-gray-400" />
                </div>
                <div className="p-4">
                  <h3 className="font-semibold">{resume.title}</h3>
                  <p className="text-sm text-muted-foreground">{resume.category}</p>
                </div>
                <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
                  <p className="text-xs text-muted-foreground">{resume.lastUpdated}</p>
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
            ))}
          </div>
        </div>
        
        {/* Cover Letters Section */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Cover Letters</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {coverLetters.map((letter, index) => (
              <div key={index} className="glass-card overflow-hidden" style={{ backgroundColor: 'rgba(236, 253, 243, 0.4)' }}>
                <div className="aspect-[3/4] flex items-center justify-center bg-green-50/80">
                  <FileText size={64} className="text-green-400" />
                </div>
                <div className="p-4">
                  <h3 className="font-semibold">{letter.title}</h3>
                  <p className="text-sm text-muted-foreground">{letter.position}</p>
                </div>
                <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
                  <p className="text-xs text-muted-foreground">{letter.lastUpdated}</p>
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
            ))}
          </div>
        </div>
        
        {/* Templates Section */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Templates</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {templates.map((template, index) => (
              <Card key={index} className="overflow-hidden glass-card border-0">
                <div className="aspect-video relative overflow-hidden">
                  <img 
                    src={template.image} 
                    alt={template.name} 
                    className="w-full h-full object-cover"
                  />
                  {template.isPremium && (
                    <Badge className="absolute top-3 right-3 bg-orange-500 hover:bg-orange-600">
                      Premium
                    </Badge>
                  )}
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-1">{template.name}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{template.description}</p>
                  <Button className="w-full bg-blue-500 hover:bg-blue-600">Use Template</Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Shelf;
