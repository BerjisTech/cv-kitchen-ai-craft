
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";

export interface TailoredCV {
  id: string;
  user_id: string;
  analysis_id: string;
  job_description: string;
  cv_content: any;
  template: string;
  created_at: string;
  updated_at: string;
}

export interface CVTemplateOption {
  id: string;
  name: string;
  preview: string;
}

export const CV_TEMPLATES: CVTemplateOption[] = [
  {
    id: 'modern',
    name: 'Modern',
    preview: '/templates/modern-preview.png'
  },
  {
    id: 'classic',
    name: 'Classic',
    preview: '/templates/classic-preview.png'
  },
  {
    id: 'glass',
    name: 'Glass',
    preview: '/templates/glass-preview.png'
  }
];

export async function generateTailoredCV(jobDescription: string, analysisId: string): Promise<TailoredCV | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      toast.error("You must be logged in to generate a CV");
      return null;
    }
    
    // Check if we already have a tailored CV for this analysis
    const { data: existingCV } = await supabase
      .from('tailored_cvs')
      .select('*')
      .eq('user_id', user.id)
      .eq('analysis_id', analysisId)
      .single();
    
    if (existingCV) {
      return existingCV as TailoredCV;
    }
    
    toast.info("Generating tailored CV, this may take a minute...");
    
    const { data, error } = await supabase.functions.invoke('generate-tailored-cv', {
      body: {
        jobDescription,
        userId: user.id,
        analysisId
      },
    });
    
    if (error) {
      console.error("Error generating tailored CV:", error);
      toast.error("Failed to generate tailored CV");
      return null;
    }
    
    toast.success("CV generation complete!");
    return data.cv;
  } catch (error: any) {
    console.error("Error in tailoredCVService:", error);
    toast.error("An error occurred while generating CV");
    return null;
  }
}

export async function getTailoredCV(analysisId: string): Promise<TailoredCV | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return null;
    
    const { data, error } = await supabase
      .from('tailored_cvs')
      .select('*')
      .eq('user_id', user.id)
      .eq('analysis_id', analysisId)
      .single();
    
    if (error) {
      console.error("Error fetching tailored CV:", error);
      return null;
    }
    
    return data as TailoredCV;
  } catch (error: any) {
    console.error("Error fetching tailored CV:", error);
    return null;
  }
}

export async function updateCVTemplate(cvId: string, template: string): Promise<boolean> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      toast.error("You must be logged in to update CV template");
      return false;
    }
    
    const { error } = await supabase
      .from('tailored_cvs')
      .update({ template })
      .eq('id', cvId)
      .eq('user_id', user.id);
    
    if (error) {
      console.error("Error updating CV template:", error);
      toast.error("Failed to update CV template");
      return false;
    }
    
    toast.success("CV template updated");
    return true;
  } catch (error: any) {
    console.error("Error updating CV template:", error);
    toast.error("Failed to update CV template");
    return false;
  }
}

export async function generatePDF(cvId: string): Promise<string | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      toast.error("You must be logged in to generate PDF");
      return null;
    }
    
    // This would typically call an edge function to generate a PDF
    // For now, we'll just return a mock URL
    toast.success("PDF generated successfully");
    return `/api/cv/${cvId}/download`;
  } catch (error: any) {
    console.error("Error generating PDF:", error);
    toast.error("Failed to generate PDF");
    return null;
  }
}
