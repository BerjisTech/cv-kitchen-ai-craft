
export interface ExtractedCVData {
  personal_info?: {
    full_name?: string;
    email?: string;
    phone?: string;
    location?: string;
    linkedin_url?: string;
    website?: string;
    github_url?: string;
  };
  summary?: string;
  skills?: Array<{ name: string; level?: number }>;
  work_experience?: Array<{
    company: string;
    role: string;
    start_date: string;
    end_date?: string;
    description?: string;
  }>;
  education?: Array<{
    institution: string;
    degree: string;
    start_year: string;
    end_year?: string;
    description?: string;
  }>;
  certifications?: Array<{
    name: string;
    issuer?: string;
    date?: string;
  }>;
  languages?: Array<{
    language: string;
    level?: string;
  }>;
}

export interface ProfileData {
  id: string;
  full_name?: string;
  avatar_url?: string;
  username?: string;
  location?: string;
  website?: string;
  bio?: string;
  role?: string;
  created_at: string;
  updated_at: string;
}
