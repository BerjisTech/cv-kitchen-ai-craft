
import React from 'react';
import { A4Wrapper } from '../A4Wrapper';
import { CVData } from '@/types/CVData';
import { Mail, Phone, MapPin, Linkedin, Github, Globe, Calendar, Briefcase, School } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

interface ModernTemplateProps {
  data: CVData;
  id?: string;
}

export const ModernTemplate: React.FC<ModernTemplateProps> = ({ data, id }) => {
  return (
    <A4Wrapper id={id} className="p-8 flex flex-col">
      {/* Header Section */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">{data.fullName}</h1>
          <p className="text-xl text-gray-600 mt-1">{data.title}</p>
        </div>
        {data.profileImageUrl && (
          <div className="w-24 h-24 rounded-full overflow-hidden">
            <img 
              src={data.profileImageUrl} 
              alt={data.fullName} 
              className="w-full h-full object-cover" 
            />
          </div>
        )}
      </div>
      
      {/* Contact Information */}
      <div className="flex flex-wrap items-center gap-4 mb-6 text-sm">
        {data.contact.email && (
          <div className="flex items-center gap-1">
            <Mail size={16} className="text-primary" />
            <span>{data.contact.email}</span>
          </div>
        )}
        {data.contact.phone && (
          <div className="flex items-center gap-1">
            <Phone size={16} className="text-primary" />
            <span>{data.contact.phone}</span>
          </div>
        )}
        {data.contact.location && (
          <div className="flex items-center gap-1">
            <MapPin size={16} className="text-primary" />
            <span>{data.contact.location}</span>
          </div>
        )}
        {data.contact.linkedin && (
          <div className="flex items-center gap-1">
            <Linkedin size={16} className="text-primary" />
            <span>{data.contact.linkedin}</span>
          </div>
        )}
        {data.contact.github && (
          <div className="flex items-center gap-1">
            <Github size={16} className="text-primary" />
            <span>{data.contact.github}</span>
          </div>
        )}
        {data.contact.website && (
          <div className="flex items-center gap-1">
            <Globe size={16} className="text-primary" />
            <span>{data.contact.website}</span>
          </div>
        )}
      </div>
      
      {/* Summary */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Summary</h2>
        <p className="text-gray-700">{data.summary}</p>
      </div>
      
      <Separator className="my-4" />
      
      {/* Experience */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-3">Experience</h2>
        <div className="space-y-4">
          {data.experience.map((exp, index) => (
            <div key={index} className="ml-1">
              <div className="flex justify-between items-start">
                <h3 className="font-medium text-lg">{exp.role}</h3>
                <div className="flex items-center gap-1 text-sm text-gray-600">
                  <Calendar size={14} />
                  <span>{exp.start} - {exp.end || 'Present'}</span>
                </div>
              </div>
              <div className="flex items-center text-gray-600 text-sm">
                <Briefcase size={14} className="mr-1" />
                <span>{exp.company}</span>
              </div>
              <p className="text-sm mt-1">{exp.description}</p>
            </div>
          ))}
        </div>
      </div>
      
      <Separator className="my-4" />
      
      {/* Education */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-3">Education</h2>
        <div className="space-y-4">
          {data.education.map((edu, index) => (
            <div key={index} className="ml-1">
              <div className="flex justify-between items-start">
                <h3 className="font-medium text-lg">{edu.degree}</h3>
                <div className="flex items-center gap-1 text-sm text-gray-600">
                  <Calendar size={14} />
                  <span>{edu.start} - {edu.end || 'Present'}</span>
                </div>
              </div>
              <div className="flex items-center text-gray-600 text-sm">
                <School size={14} className="mr-1" />
                <span>{edu.school}</span>
              </div>
              {edu.description && (
                <p className="text-sm mt-1">{edu.description}</p>
              )}
            </div>
          ))}
        </div>
      </div>
      
      <Separator className="my-4" />
      
      {/* Skills */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-3">Skills</h2>
        <div className="flex flex-wrap gap-2">
          {data.skills.map((skill, index) => (
            <Badge key={index} variant="secondary" className="text-sm py-1">
              {skill}
            </Badge>
          ))}
        </div>
      </div>
      
      {/* Optional Sections */}
      {data.languages && data.languages.length > 0 && (
        <>
          <Separator className="my-4" />
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-3">Languages</h2>
            <div className="flex flex-wrap gap-4">
              {data.languages.map((lang, index) => (
                <div key={index} className="text-sm">
                  <span className="font-medium">{lang.language}</span>
                  <span className="text-gray-600"> - {lang.proficiency}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
      
      {data.certifications && data.certifications.length > 0 && (
        <>
          <Separator className="my-4" />
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-3">Certifications</h2>
            <div className="space-y-2">
              {data.certifications.map((cert, index) => (
                <div key={index} className="text-sm">
                  <span className="font-medium">{cert.name}</span>
                  <span className="text-gray-600"> - {cert.issuer}, {cert.date}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </A4Wrapper>
  );
};
