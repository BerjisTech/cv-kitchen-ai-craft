
import React from 'react';

interface A4WrapperProps {
  children: React.ReactNode;
  className?: string;
  id?: string;
}

export const A4Wrapper: React.FC<A4WrapperProps> = ({ children, className = '', id }) => {
  return (
    <div 
      id={id}
      className={`w-[210mm] h-[297mm] bg-white shadow-lg mx-auto print:shadow-none ${className}`}
      style={{ 
        fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
      }}
    >
      {children}
    </div>
  );
};
