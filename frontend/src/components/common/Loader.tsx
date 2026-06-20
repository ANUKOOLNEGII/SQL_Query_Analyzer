import React from 'react';

interface LoaderProps {
  size?: 'sm' | 'md' | 'lg';
  fullScreen?: boolean;
  text?: string;
  variant?: 'spinner' | 'skeleton';
}

export const Loader: React.FC<LoaderProps> = ({
  size = 'md',
  fullScreen = false,
  text,
  variant = 'spinner'
}) => {
  const sizeClasses = {
    sm: 'h-6 w-6 border-2',
    md: 'h-10 w-10 border-3',
    lg: 'h-16 w-16 border-4',
  };

  if (variant === 'skeleton') {
    return (
      <div className="animate-pulse space-y-4 w-full">
        <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-md w-2/3"></div>
        <div className="space-y-2">
          <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded-md w-full"></div>
          <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded-md w-5/6"></div>
          <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded-md w-4/5"></div>
        </div>
      </div>
    );
  }

  const spinner = (
    <div className="flex flex-col items-center justify-center space-y-3">
      <div
        className={`animate-spin rounded-full border-t-primary-light dark:border-t-primary-dark border-r-transparent border-b-transparent border-l-transparent ${sizeClasses[size]}`}
        style={{ borderColor: 'rgba(15,118,110,0.1)', borderTopColor: 'currentColor' }}
      />
      {text && (
        <span className="text-sm font-medium text-text-secondaryLight dark:text-text-secondaryDark">
          {text}
        </span>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-bg-light/80 dark:bg-bg-dark/80 backdrop-blur-sm">
        {spinner}
      </div>
    );
  }

  return spinner;
};
export default Loader;
