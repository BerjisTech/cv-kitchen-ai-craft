
import React from 'react';
import { A4Wrapper } from '../A4Wrapper';
import { CVData } from '@/types/CVData';
import { Separator } from '@/components/ui/separator';

interface MinimalTemplateProps {
  data: CVData;
  id?: string;
}

export const MinimalTemplate: React.FC<MinimalTemplateProps> = ({ data, id }) => {
  return (
    <A4Wrapper id={id} className="p-10 font-sans">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-light tracking-wide uppercase">{data.fullName}</h1>
        <Separator className="my-4 mx-auto w-20" />
        <p className="text-gray-600">{data.title}</p>
        
        {/* Contact Row */}
        <div className="mt-4 flex flex-wrap justify-center gap-x-6 text-sm text-gray-500">
          {data.contact.email && <div>{data.contact.email}</div>}
          {data.contact.phone && <div>{data.contact.phone}</div>}
          {data.contact.location && <div>{data.contact.location}</div>}
          {data.contact.website && <div>{data.contact.website}</div>}
        </div>
        
        {data.contact.linkedin || data.contact.github ? (
          <div className="mt-2 flex flex-wrap justify-center gap-x-6 text-sm text-gray-500">
            {data.contact.linkedin && <div>{data.contact.linkedin}</div>}
            {data.contact.github && <div>{data.contact.github}</div>}
          </div>
        ) : null}
      </div>
      
      {/* Summary */}
      <div className="mb-8">
        <h2 className="text-sm tracking-widest uppercase text-gray-400 mb-3 font-medium">Profile</h2>
        <p className="text-gray-700">{data.summary}</p>
      </div>
      
      {/* Experience */}
      <div className="mb-8">
        <h2 className="text-sm tracking-widest uppercase text-gray-400 mb-4 font-medium">Experience</h2>
        <div className="space-y-6">
          {data.experience.map((exp, index) => (
            <div key={index}>
              <div className="flex justify-between items-baseline mb-1">
                <h3 className="font-medium">{exp.role}</h3>
                <span className="text-sm text-gray-500">{exp.start} – {exp.end || 'Present'}</span>
              </div>
              <p className="text-gray-600 mb-2">{exp.company}</p>
              <p className="text-gray-700 text-sm">{exp.description}</p>
            </div>
          ))}
        </div>
      </div>
      
      {/* Education */}
      <div className="mb-8">
        <h2 className="text-sm tracking-widest uppercase text-gray-400 mb-4 font-medium">Education</h2>
        <div className="space-y-4">
          {data.education.map((edu, index) => (
            <div key={index}>
              <div className="flex justify-between items-baseline mb-1">
                <h3 className="font-medium">{edu.degree}</h3>
                <span className="text-sm text-gray-500">{edu.start} – {edu.end || 'Present'}</span>
              </div>
              <p className="text-gray-600">{edu.school}</p>
              {edu.description && <p className="text-sm text-gray-700 mt-1">{edu.description}</p>}
            </div>
          ))}
        </div>
      </div>
      
      {/* Skills */}
      <div className="mb-8">
        <h2 className="text-sm tracking-widest uppercase text-gray-400 mb-4 font-medium">Skills</h2>
        <div>
          {data.skills.join(' • ')}
        </div>
      </div>
      
      {/* Optional Sections */}
      {data.languages && data.languages.length > 0 && (
        <div className="mb-8">
          <h2 className="text-sm tracking-widest uppercase text-gray-400 mb-4 font-medium">Languages</h2>
          <div>
            {data.languages.map((lang, index) => (
              <span key={index}>
                {lang.language} ({lang.proficiency})
                {index < data.languages.length - 1 ? ' • ' : ''}
              </span>
            ))}
          </div>
        </div>
      )}
      
      {data.certifications && data.certifications.length > 0 && (
        <div className="mb-8">
          <h2 className="text-sm tracking-widest uppercase text-gray-400 mb-4 font-medium">Certifications</h2>
          <div className="space-y-2">
            {data.certifications.map((cert, index) => (
              <div key={index}>
                <span className="font-medium">{cert.name}</span>
                <span className="text-gray-600"> • {cert.issuer}, {cert.date}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </A4Wrapper>
  );
};
