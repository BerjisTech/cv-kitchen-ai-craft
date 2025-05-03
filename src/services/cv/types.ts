
export type ExtractedCVData = {
  fullName?: string;
  title?: string;
  contact?: {
    email?: string;
    phone?: string;
    location?: string;
    website?: string;
    linkedin?: string;
    github?: string;
  };
  summary?: string;
  skills?: string[];
  experience?: Array<{
    company?: string;
    role?: string;
    start?: string;
    end?: string | null;
    description?: string;
  }>;
  education?: Array<{
    school?: string;
    degree?: string;
    start?: string;
    end?: string | null;
    description?: string;
  }>;
  languages?: Array<{
    language?: string;
    proficiency?: string;
  }>;
  certifications?: Array<{
    name?: string;
    issuer?: string;
    date?: string;
  }>;
};
