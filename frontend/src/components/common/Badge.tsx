import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'success' | 'warning' | 'error' | 'primary' | 'secondary' | 'neutral';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  className = '',
}) => {
  const styles = {
    success: 'bg-green-50 dark:bg-green-900/20 text-success border-green-200 dark:border-green-800',
    warning: 'bg-amber-50 dark:bg-amber-900/20 text-warning border-amber-200 dark:border-amber-800',
    error: 'bg-red-50 dark:bg-red-900/20 text-error border-red-200 dark:border-red-800',
    primary: 'bg-teal-50 dark:bg-teal-900/20 text-primary-light dark:text-primary-dark border-teal-200 dark:border-teal-800',
    secondary: 'bg-blue-50 dark:bg-blue-900/20 text-secondary-light dark:text-secondary-dark border-blue-200 dark:border-blue-800',
    neutral: 'bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800',
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${styles[variant]} ${className}`}
    >
      {children}
    </span>
  );
};
export default Badge;
