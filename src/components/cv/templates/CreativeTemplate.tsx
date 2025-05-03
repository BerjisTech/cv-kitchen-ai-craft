
import React from 'react';
import { A4Wrapper } from '../A4Wrapper';
import { CVData } from '@/types/CVData';
import { Mail, Phone, MapPin, Linkedin, Github, Globe, Briefcase, School, Award } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface CreativeTemplateProps {
  data: CVData;
  id?: string;
}

export const CreativeTemplate: React.FC<CreativeTemplateProps> = ({ data, id }) => {
  return (
    <A4Wrapper id={id} className="flex flex-col relative overflow-hidden">
      {/* Left sidebar with accent color */}
      <div className="absolute left-0 top-0 w-24 h-full bg-primary opacity-90"></div>
      
      {/* Main content area */}
      <div className="flex flex-1">
        {/* Left sidebar content */}
        <div className="w-24 relative z-10 flex flex-col items-center pt-10 pb-8 text-white">
          {data.profileImageUrl && (
            <div className="w-16 h-16 rounded-full overflow-hidden mb-8 border-2 border-white">
              <img 
                src={data.profileImageUrl} 
                alt={data.fullName} 
                className="w-full h-full object-cover" 
              />
            </div>
          )}
          
          <div className="mt-auto flex flex-col gap-6 items-center">
            {data.contact.email && <Mail size={16} />}
            {data.contact.phone && <Phone size={16} />}
            {data.contact.location && <MapPin size={16} />}
            {data.contact.linkedin && <Linkedin size={16} />}
            {data.contact.github && <Github size={16} />}
            {data.contact.website && <Globe size={16} />}
          </div>
        </div>
        
        {/* Main content */}
        <div className="flex-1 p-8 pl-6">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800">{data.fullName}</h1>
            <p className="text-lg text-primary font-medium mt-1">{data.title}</p>
            
            <div className="mt-6 text-sm space-y-1 text-gray-600">
              {data.contact.email && <div>{data.contact.email}</div>}
              {data.contact.phone && <div>{data.contact.phone}</div>}
              {data.contact.location && <div>{data.contact.location}</div>}
              {data.contact.linkedin && <div>{data.contact.linkedin}</div>}
              {data.contact.github && <div>{data.contact.github}</div>}
              {data.contact.website && <div>{data.contact.website}</div>}
            </div>
          </div>
          
          {/* Summary */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-3 border-b border-primary pb-1">About Me</h2>
            <p className="text-gray-700">{data.summary}</p>
          </div>
          
          {/* Experience */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-3 border-b border-primary pb-1">
              <div className="flex items-center gap-2">
                <Briefcase size={18} className="text-primary" />
                <span>Work Experience</span>
              </div>
            </h2>
            <div className="space-y-5">
              {data.experience.map((exp, index) => (
                <div key={index} className="relative pl-6 before:absolute before:left-0 before:top-2 before:w-3 before:h-3 before:bg-primary before:rounded-full">
                  <div className="flex flex-col md:flex-row md:justify-between md:items-baseline">
                    <h3 className="font-semibold text-gray-800">{exp.role}</h3>
                    <span className="text-sm text-gray-500">{exp.start} - {exp.end || 'Present'}</span>
                  </div>
                  <p className="text-primary font-medium text-sm">{exp.company}</p>
                  <p className="text-sm mt-1 text-gray-600">{exp.description}</p>
                </div>
              ))}
            </div>
          </div>
          
          {/* Education */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-3 border-b border-primary pb-1">
              <div className="flex items-center gap-2">
                <School size={18} className="text-primary" />
                <span>Education</span>
              </div>
            </h2>
            <div className="space-y-4">
              {data.education.map((edu, index) => (
                <div key={index} className="relative pl-6 before:absolute before:left-0 before:top-2 before:w-3 before:h-3 before:bg-primary before:rounded-full">
                  <div className="flex flex-col md:flex-row md:justify-between md:items-baseline">
                    <h3 className="font-semibold text-gray-800">{edu.degree}</h3>
                    <span className="text-sm text-gray-500">{edu.start} - {edu.end || 'Present'}</span>
                  </div>
                  <p className="text-primary font-medium text-sm">{edu.school}</p>
                  {edu.description && <p className="text-sm mt-1 text-gray-600">{edu.description}</p>}
                </div>
              ))}
            </div>
          </div>
          
          {/* Skills */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-3 border-b border-primary pb-1">Skills</h2>
            <div className="flex flex-wrap gap-2">
              {data.skills.map((skill, index) => (
                <Badge key={index} className="bg-primary/10 hover:bg-primary/20 text-primary">
                  {skill}
                </Badge>
              ))}
            </div>
          </div>
          
          {/* Optional sections */}
          {data.certifications && data.certifications.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-3 border-b border-primary pb-1">
                <div className="flex items-center gap-2">
                  <Award size={18} className="text-primary" />
                  <span>Certifications</span>
                </div>
              </h2>
              <div className="space-y-2">
                {data.certifications.map((cert, index) => (
                  <div key={index} className="text-sm">
                    <span className="font-medium">{cert.name}</span>
                    <span className="text-gray-600"> • {cert.issuer}, {cert.date}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {data.languages && data.languages.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-3 border-b border-primary pb-1">Languages</h2>
              <div className="grid grid-cols-2 gap-3">
                {data.languages.map((lang, index) => (
                  <div key={index} className="text-sm">
                    <span className="font-medium">{lang.language}</span>
                    <span className="text-gray-600"> • {lang.proficiency}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </A4Wrapper>
  );
};
