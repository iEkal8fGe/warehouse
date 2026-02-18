import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ children, className = '' }) => {
  return (
    <div className={`card ${className}`}>
      {children}
      <style>{`
        .card {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: var(--radius);
          padding: 24px;
          color: white;
          transition: var(--transition);
        }
        .card:hover {
          background: rgba(255, 255, 255, 0.15);
          transform: translateY(-2px);
          box-shadow: var(--shadow);
        }
      `}</style>
    </div>
  );
};