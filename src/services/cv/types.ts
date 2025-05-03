
export interface ProfileData {
  personal_info: {
    full_name?: string;
    email?: string; 
    phone?: string;
    location?: string;
    linkedin_url?: string;
    website?: string;
    github_url?: string;
  };
  summary?: string;
  work_experience: Array<{
    company: string;
    role: string;
    start_date: string;
    end_date?: string;
    description?: string;
    source?: string;
  }>;
  education: Array<{
    institution: string;
    degree?: string;
    start_year?: string;
    end_year?: string;
    description?: string;
    source?: string;
  }>;
  skills: Array<{
    name: string;
    level?: number;
    category?: string;
  }>;
  certifications: Array<{
    name: string;
    issuer: string;
    date?: string;
  }>;
  languages: Array<{
    language: string;
    level?: string;
  }>;
}

export type ExtractedCVData = ProfileData;
