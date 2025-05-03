
import React from 'react';
import { A4Wrapper } from '../A4Wrapper';
import { CVData } from '@/types/CVData';
import { Mail, Phone, MapPin, Linkedin, Github, Globe } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

interface ClassicTemplateProps {
  data: CVData;
  id?: string;
}

export const ClassicTemplate: React.FC<ClassicTemplateProps> = ({ data, id }) => {
  return (
    <A4Wrapper id={id} className="p-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold uppercase tracking-wide">{data.fullName}</h1>
        <p className="text-lg text-gray-600 mt-1">{data.title}</p>
        
        {/* Contact Information */}
        <div className="mt-4 flex flex-wrap justify-center gap-x-4 gap-y-2 text-sm">
          {data.contact.email && (
            <div className="flex items-center gap-1">
              <Mail size={14} className="text-gray-500" />
              <span>{data.contact.email}</span>
            </div>
          )}
          {data.contact.phone && (
            <div className="flex items-center gap-1">
              <Phone size={14} className="text-gray-500" />
              <span>{data.contact.phone}</span>
            </div>
          )}
          {data.contact.location && (
            <div className="flex items-center gap-1">
              <MapPin size={14} className="text-gray-500" />
              <span>{data.contact.location}</span>
            </div>
          )}
          {data.contact.linkedin && (
            <div className="flex items-center gap-1">
              <Linkedin size={14} className="text-gray-500" />
              <span>{data.contact.linkedin}</span>
            </div>
          )}
          {data.contact.github && (
            <div className="flex items-center gap-1">
              <Github size={14} className="text-gray-500" />
              <span>{data.contact.github}</span>
            </div>
          )}
          {data.contact.website && (
            <div className="flex items-center gap-1">
              <Globe size={14} className="text-gray-500" />
              <span>{data.contact.website}</span>
            </div>
          )}
        </div>
      </div>
      
      {/* Summary */}
      <div className="mb-6">
        <h2 className="text-lg font-bold uppercase border-b-2 border-gray-300 pb-1 mb-3">Professional Summary</h2>
        <p className="text-gray-700">{data.summary}</p>
      </div>
      
      {/* Experience */}
      <div className="mb-6">
        <h2 className="text-lg font-bold uppercase border-b-2 border-gray-300 pb-1 mb-3">Professional Experience</h2>
        <div className="space-y-4">
          {data.experience.map((exp, index) => (
            <div key={index}>
              <div className="flex justify-between items-baseline">
                <h3 className="font-semibold">{exp.role}</h3>
                <span className="text-sm text-gray-600">{exp.start} - {exp.end || 'Present'}</span>
              </div>
              <p className="text-gray-700 italic">{exp.company}</p>
              <p className="text-sm mt-1">{exp.description}</p>
            </div>
          ))}
        </div>
      </div>
      
      {/* Education */}
      <div className="mb-6">
        <h2 className="text-lg font-bold uppercase border-b-2 border-gray-300 pb-1 mb-3">Education</h2>
        <div className="space-y-4">
          {data.education.map((edu, index) => (
            <div key={index}>
              <div className="flex justify-between items-baseline">
                <h3 className="font-semibold">{edu.degree}</h3>
                <span className="text-sm text-gray-600">{edu.start} - {edu.end || 'Present'}</span>
              </div>
              <p className="text-gray-700 italic">{edu.school}</p>
              {edu.description && <p className="text-sm mt-1">{edu.description}</p>}
            </div>
          ))}
        </div>
      </div>
      
      {/* Skills */}
      <div className="mb-6">
        <h2 className="text-lg font-bold uppercase border-b-2 border-gray-300 pb-1 mb-3">Skills</h2>
        <div className="flex flex-wrap gap-1">
          {data.skills.map((skill, index) => (
            <span key={index} className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-sm">
              {skill}
            </span>
          ))}
        </div>
      </div>
      
      {/* Optional Sections */}
      {data.languages && data.languages.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-bold uppercase border-b-2 border-gray-300 pb-1 mb-3">Languages</h2>
          <div className="grid grid-cols-2 gap-2">
            {data.languages.map((lang, index) => (
              <div key={index} className="text-sm">
                <span className="font-medium">{lang.language}:</span>
                <span className="ml-1 text-gray-600">{lang.proficiency}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {data.certifications && data.certifications.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-bold uppercase border-b-2 border-gray-300 pb-1 mb-3">Certifications</h2>
          <div className="space-y-1">
            {data.certifications.map((cert, index) => (
              <div key={index} className="text-sm">
                <span className="font-medium">{cert.name}</span>
                <span className="ml-1 text-gray-600"> - {cert.issuer}, {cert.date}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </A4Wrapper>
  );
};
