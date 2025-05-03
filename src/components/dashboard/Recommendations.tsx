
import React, { useState, useEffect } from 'react';
import { FileText, UserSquare, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getProfile } from '@/services/profileService';
import { getUserDocuments } from '@/services/documentService';
import { getUserLinkedInData } from '@/services/linkedinImportService';
import { getRecentAnalyses } from '@/services/jobAnalysisService';

interface RecommendationProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  variant: 'default' | 'success' | 'warning';
  onClick?: () => void;
}

const RecommendationItem = ({ icon, title, description, variant, onClick }: RecommendationProps) => {
  const getBgColor = () => {
    switch (variant) {
      case 'success':
        return 'bg-blue-50';
      case 'warning':
        return 'bg-orange-50';
      default:
        return 'bg-primary/5';
    }
  };

  const getIconBgColor = () => {
    switch (variant) {
      case 'success':
        return 'bg-blue-100 text-blue-600';
      case 'warning':
        return 'bg-orange-100 text-orange-500';
      default:
        return 'bg-primary/10 text-primary';
    }
  };

  return (
    <div 
      className={`p-4 rounded-lg mb-3 ${getBgColor()} ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
    >
      <div className="flex gap-3 items-center justify-between">
        <div className="flex gap-3 items-center">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getIconBgColor()}`}>
            {icon}
          </div>
          <div>
            <h3 className="text-sm font-medium">{title}</h3>
            <p className="text-xs text-muted-foreground">{description}</p>
          </div>
        </div>
        {onClick && (
          <ArrowRight className="h-4 w-4 text-muted-foreground" />
        )}
      </div>
    </div>
  );
};

export const Recommendations = () => {
  const navigate = useNavigate();
  const [recommendations, setRecommendations] = useState<RecommendationProps[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      setIsLoading(true);
      try {
        // Get profile data
        const profile = await getProfile();
        
        // Get CV documents
        const documents = await getUserDocuments('cv');
        
        // Get LinkedIn data
        const linkedInData = await getUserLinkedInData();
        
        // Get recent analyses
        const analyses = await getRecentAnalyses();
        
        // Generate recommendations based on user data
        const userRecommendations: RecommendationProps[] = [];
        
        // Check if profile is incomplete
        if (profile) {
          if (!profile.full_name || !profile.avatar_url || !profile.bio) {
            userRecommendations.push({
              icon: <UserSquare size={18} />,
              title: "Complete your profile",
              description: `Add ${!profile.avatar_url ? 'a profile photo' : !profile.bio ? 'a bio' : 'your full name'} to increase visibility`,
              variant: "warning",
              onClick: () => navigate("/profile")
            });
          }
        }
        
        // If user has no CVs
        if (!documents || documents.length === 0) {
          userRecommendations.push({
            icon: <FileText size={18} />,
            title: "Upload your CV",
            description: "Add your CV to get personalized job recommendations",
            variant: "default",
            onClick: () => navigate("/kitchen")
          });
        }
        
        // If user has no LinkedIn data
        if (!linkedInData) {
          userRecommendations.push({
            icon: <FileText size={18} />,
            title: "Import LinkedIn data",
            description: "Connect your LinkedIn profile to enhance your CVs",
            variant: "default",
            onClick: () => navigate("/kitchen")
          });
        }
        
        // If user has analyzed jobs but not created CVs - need to fix this check
        if (analyses && analyses.length > 0) {
          // Since we don't have has_cv property directly, we might need to check something else
          // For now, just suggest creating tailored CVs if they have analyses
          userRecommendations.push({
            icon: <FileText size={18} />,
            title: "Create tailored CVs",
            description: "Generate CVs for your analyzed job descriptions",
            variant: "success",
            onClick: () => navigate("/kitchen")
          });
        }
        
        // Add default recommendations if we don't have enough
        if (userRecommendations.length < 3) {
          if (!userRecommendations.some(r => r.title.includes("Update your skills"))) {
            userRecommendations.push({
              icon: <FileText size={18} />,
              title: "Update your skills",
              description: "Add your latest technical skills to showcase your expertise",
              variant: "default",
              onClick: () => navigate("/profile")
            });
          }
          
          if (!userRecommendations.some(r => r.title.includes("Tailor for"))) {
            userRecommendations.push({
              icon: <FileText size={18} />,
              title: "Tailor for your dream job",
              description: "Analyze a job description to get customized CV tips",
              variant: "success",
              onClick: () => navigate("/kitchen")
            });
          }
        }
        
        // Limit to 3 recommendations
        setRecommendations(userRecommendations.slice(0, 3));
        
      } catch (error) {
        console.error("Error fetching data for recommendations:", error);
        // Fallback recommendations
        setRecommendations([
          {
            icon: <FileText size={18} />,
            title: "Update your skills",
            description: "Add your latest technical skills to showcase your expertise",
            variant: "default",
            onClick: () => navigate("/profile")
          },
          {
            icon: <FileText size={18} />,
            title: "Tailor for your dream job",
            description: "Customize your CV for specific job opportunities",
            variant: "success",
            onClick: () => navigate("/kitchen")
          },
          {
            icon: <UserSquare size={18} />,
            title: "Complete your profile",
            description: "Add a profile photo to increase visibility",
            variant: "warning",
            onClick: () => navigate("/profile")
          }
        ]);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUserData();
  }, [navigate]);

  return (
    <div className="glass-card p-6">
      <h2 className="text-lg font-semibold mb-4">Recommendations</h2>
      
      {isLoading ? (
        // Loading skeleton
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-4 rounded-lg bg-muted/20 animate-pulse">
              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-lg bg-muted"></div>
                <div className="flex-1">
                  <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-muted rounded w-5/6"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        // Actual recommendations
        recommendations.map((rec, index) => (
          <RecommendationItem 
            key={index}
            icon={rec.icon}
            title={rec.title}
            description={rec.description}
            variant={rec.variant}
            onClick={rec.onClick}
          />
        ))
      )}
    </div>
  );
};
