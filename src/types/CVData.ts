
export interface CVData {
  fullName: string;
  title: string;
  contact: {
    email: string;
    phone?: string;
    location?: string;
    website?: string;
    linkedin?: string;
    github?: string;
  };
  summary: string;
  skills: string[];
  experience: {
    company: string;
    role: string;
    start: string;
    end?: string;
    description: string;
  }[];
  education: {
    school: string;
    degree: string;
    start: string;
    end?: string;
    description?: string;
  }[];
  languages?: { language: string; proficiency: string }[];
  certifications?: { name: string; issuer: string; date: string }[];
  projects?: { name: string; description: string; technologies: string[] }[];
  awards?: { title: string; issuer: string; date: string; description?: string }[];
  profileImageUrl?: string;
}
