import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  hoverable = true,
  className = '',
  ...props
}) => {
  return (
    <div
      className={`bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark p-7 rounded-card shadow-card transition-all duration-300
        ${hoverable ? 'hover:shadow-hover hover:-translate-y-0.5' : ''}
        ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
export default Card;
