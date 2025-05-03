
import React, { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { supabase } from '@/integrations/supabase/client';
import { TailoredCV } from '@/types/tailoredCV';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/components/ui/sonner';
import { ShelfHeader } from '@/components/shelf/ShelfHeader';
import { ResumesSection } from '@/components/shelf/ResumesSection';
import { CoverLettersSection } from '@/components/shelf/CoverLettersSection';
import { TemplatesSection } from '@/components/shelf/TemplatesSection';
import { useFormatDate } from '@/hooks/useFormatDate';
import { getUserCoverLetters, CoverLetter } from '@/services/coverLetterService';

const Shelf = () => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [resumes, setResumes] = useState<TailoredCV[]>([]);
  const [coverLetters, setCoverLetters] = useState<CoverLetter[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingCoverLetters, setIsLoadingCoverLetters] = useState(true);
  const navigate = useNavigate();
  const { formatDate } = useFormatDate();
  
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
      setIsLoadingCoverLetters(true);
      
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
        
        // Fetch cover letters
        try {
          const coverLetterData = await getUserCoverLetters();
          setCoverLetters(coverLetterData);
        } catch (error) {
          console.error('Error fetching cover letters:', error);
          toast.error('Failed to load your cover letters');
        } finally {
          setIsLoadingCoverLetters(false);
        }
        
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
  
  const handleCreateCoverLetter = () => {
    navigate('/cover-letter/new');
  };
  
  const handleViewCV = (cvId: string) => {
    navigate(`/kitchen/cv-viewer/${cvId}`);
  };
  
  const handleViewCoverLetter = (id: string) => {
    navigate(`/cover-letter/${id}`);
  };

  const handleUseTemplate = (template: string) => {
    // Navigate to kitchen with template parameter
    navigate(`/kitchen?template=${template}`);
    toast.info(`Selected ${template} template. Create a new CV to use it.`);
  };

  const totalItemCount = resumes.length + coverLetters.length;

  return (
    <MainLayout>
      <div className="space-y-8">
        <ShelfHeader 
          viewMode={viewMode}
          setViewMode={setViewMode}
          itemCount={totalItemCount}
          handleCreateNew={handleCreateNew}
        />
        
        {/* Resumes Section */}
        <ResumesSection 
          resumes={resumes}
          isLoading={isLoading}
          handleViewCV={handleViewCV}
          handleCreateNew={handleCreateNew}
          formatDate={formatDate}
        />
        
        {/* Cover Letters Section */}
        <CoverLettersSection 
          coverLetters={coverLetters}
          isLoading={isLoadingCoverLetters}
          handleCreateNew={handleCreateCoverLetter}
          handleViewCoverLetter={handleViewCoverLetter}
        />
        
        {/* Templates Section */}
        <TemplatesSection 
          templates={templates}
          handleUseTemplate={handleUseTemplate}
        />
      </div>
    </MainLayout>
  );
};

export default Shelf;
