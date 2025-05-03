
import React, { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { FileText, Eye, Download, Edit, Filter, Plus, LayoutGrid, List } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { TailoredCV } from '@/types/tailoredCV';
import { CVCard } from '@/components/cv/CVCard';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/components/ui/sonner';

const Shelf = () => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [resumes, setResumes] = useState<TailoredCV[]>([]);
  const [coverLetters, setCoverLetters] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  
  // Templates data
  const templates = [
    {
      name: 'Modern',
      description: 'A clean, modern design with a touch of color.',
      isPremium: false,
      template: 'modern',
      image: 'https://images.unsplash.com/photo-1569698145698-0e5d2a12cab5?q=80&w=200'
    },
    {
      name: 'Classic',
      description: 'A traditional, professional layout suitable for corporate roles.',
      isPremium: false,
      template: 'classic',
      image: 'https://images.unsplash.com/photo-1572021335469-31706a17aaef?q=80&w=200'
    },
    {
      name: 'Creative',
      description: 'A bold, creative design to help you stand out.',
      isPremium: true,
      template: 'creative',
      image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=200'
    },
    {
      name: 'Minimal',
      description: 'A simple, minimalist design focusing on content.',
      isPremium: false,
      template: 'minimal',
      image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=200'
    }
  ];

  useEffect(() => {
    const fetchUserData = async () => {
      setIsLoading(true);
      try {
        // Fetch tailored CVs
        const { data: cvData, error: cvError } = await supabase
          .from('tailored_cvs')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (cvError) {
          console.error('Error fetching CVs:', cvError);
          toast.error('Failed to load your CVs');
        } else {
          setResumes(cvData || []);
        }
        
        // In a real app, fetch cover letters as well
        // For now, we'll use an empty array as cover letters aren't implemented yet
        setCoverLetters([]);
        
      } catch (error) {
        console.error('Error fetching shelf data:', error);
        toast.error('Failed to load your data');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUserData();
  }, []);

  const handleCreateNew = () => {
    navigate('/kitchen');
  };
  
  const handleViewCV = (cvId: string) => {
    navigate(`/kitchen/cv-viewer/${cvId}`);
  };

  const handleUseTemplate = (template: string) => {
    // Navigate to kitchen with template parameter
    navigate(`/kitchen?template=${template}`);
    toast.info(`Selected ${template} template. Create a new CV to use it.`);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return 'Today';
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else if (diffDays < 30) {
      return `${Math.floor(diffDays / 7)} weeks ago`;
    } else {
      return `${Math.floor(diffDays / 30)} months ago`;
    }
  };

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
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="glass-card overflow-hidden">
                  <div className="aspect-[3/4] bg-gray-100 animate-pulse"></div>
                  <div className="p-4">
                    <div className="h-5 bg-gray-200 rounded animate-pulse mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-2/3"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : resumes.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {resumes.map((resume) => (
                <div 
                  key={resume.id} 
                  className="glass-card overflow-hidden cursor-pointer"
                  onClick={() => handleViewCV(resume.id)}
                >
                  <div className="aspect-[3/4] bg-gray-100 flex items-center justify-center">
                    <FileText size={64} className="text-gray-400" />
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold">
                      {resume.cv_content?.title || resume.cv_content?.header?.title || "Untitled CV"}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {resume.template.charAt(0).toUpperCase() + resume.template.slice(1)} template
                    </p>
                  </div>
                  <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
                    <p className="text-xs text-muted-foreground">{formatDate(resume.created_at)}</p>
                    <div className="flex items-center gap-2">
                      <button className="text-gray-500 hover:text-gray-700" onClick={(e) => {
                        e.stopPropagation();
                        handleViewCV(resume.id);
                      }}>
                        <Eye size={16} />
                      </button>
                      <button className="text-gray-500 hover:text-gray-700" onClick={(e) => {
                        e.stopPropagation();
                        // Edit functionality would be implemented here
                      }}>
                        <Edit size={16} />
                      </button>
                      <button className="text-gray-500 hover:text-gray-700" onClick={(e) => {
                        e.stopPropagation();
                        // Download functionality would be implemented here
                      }}>
                        <Download size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 bg-muted/20 rounded-lg">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-3" />
              <h3 className="text-lg font-medium mb-1">No resumes yet</h3>
              <p className="text-muted-foreground mb-4">Create your first tailored CV in the Kitchen</p>
              <Button 
                onClick={handleCreateNew} 
                className="bg-blue-500 hover:bg-blue-600"
              >
                Create CV
              </Button>
            </div>
          )}
        </div>
        
        {/* Cover Letters Section */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Cover Letters</h2>
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {[1, 2].map(i => (
                <div key={i} className="glass-card overflow-hidden">
                  <div className="aspect-[3/4] bg-gray-100 animate-pulse"></div>
                  <div className="p-4">
                    <div className="h-5 bg-gray-200 rounded animate-pulse mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-2/3"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : coverLetters.length > 0 ? (
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
          ) : (
            <div className="text-center py-10 bg-muted/20 rounded-lg">
              <FileText className="mx-auto h-12 w-12 text-green-300 mb-3" />
              <h3 className="text-lg font-medium mb-1">No cover letters yet</h3>
              <p className="text-muted-foreground mb-4">Create your first cover letter</p>
              <Button 
                onClick={handleCreateNew} 
                className="bg-green-500 hover:bg-green-600"
              >
                Create Cover Letter
              </Button>
            </div>
          )}
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
                  <Button 
                    className="w-full bg-blue-500 hover:bg-blue-600"
                    onClick={() => handleUseTemplate(template.template)}
                  >
                    Use Template
                  </Button>
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
