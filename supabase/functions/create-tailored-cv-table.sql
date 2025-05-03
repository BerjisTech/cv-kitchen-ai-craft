
-- This file is for your reference to create the table manually in the Supabase dashboard
-- Create a table for storing tailored CVs
CREATE TABLE public.tailored_cvs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  analysis_id UUID REFERENCES public.job_analyses NOT NULL,
  job_description TEXT NOT NULL,
  cv_content JSONB NOT NULL,
  template TEXT NOT NULL DEFAULT 'modern',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security
ALTER TABLE public.tailored_cvs ENABLE ROW LEVEL SECURITY;

-- Create policy that allows users to view their own tailored CVs
CREATE POLICY "Users can view their own tailored CVs" 
  ON public.tailored_cvs 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Create policy that allows users to create their own tailored CVs
CREATE POLICY "Users can create their own tailored CVs" 
  ON public.tailored_cvs 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Create policy that allows users to update their own tailored CVs
CREATE POLICY "Users can update their own tailored CVs" 
  ON public.tailored_cvs 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Create policy that allows users to delete their own tailored CVs
CREATE POLICY "Users can delete their own tailored CVs" 
  ON public.tailored_cvs 
  FOR DELETE 
  USING (auth.uid() = user_id);
