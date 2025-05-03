
export interface TailoredCV {
  id: string;
  user_id: string;
  analysis_id: string;
  job_description: string;
  cv_content: any; // This will be a JSON object with CV content
  template: string;
  created_at: string;
  updated_at: string;
}
