import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, BookOpen, GraduationCap, Briefcase } from 'lucide-react';

export const Recommendations = () => {
  // Placeholder data for recommendations
  const recommendationsData = [
    {
      title: "Complete Your Profile",
      description: "Add your education and work experience to get better job recommendations.",
      action: "Add Details",
      icon: GraduationCap,
      link: "/profile"
    },
    {
      title: "Explore Job Opportunities",
      description: "Browse through curated job listings that match your skills and experience.",
      action: "View Jobs",
      icon: Briefcase,
      link: "/jobs"
    },
    {
      title: "Enhance Your Skills",
      description: "Discover courses and resources to upskill and stay competitive in the job market.",
      action: "Find Courses",
      icon: BookOpen,
      link: "/courses"
    }
  ];

  return (
    <Card className="glass-card">
      <CardHeader className="pb-3">
        <CardTitle>Recommendations</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {recommendationsData.map((recommendation, index) => (
          <div key={index} className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <recommendation.icon className="h-4 w-4 text-muted-foreground" />
                <h3 className="text-sm font-medium">{recommendation.title}</h3>
              </div>
              <p className="text-sm text-muted-foreground">{recommendation.description}</p>
            </div>
            <Button variant="outline" size="sm" className="gap-2">
              <a href={recommendation.link} className="flex items-center gap-2">
                {recommendation.action}
                <ArrowRight className="h-4 w-4" />
              </a>
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
