import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'outline' | 'text';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyle = 'inline-flex items-center justify-center font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  const sizeStyles = {
    sm: 'h-9 px-4 rounded-lg text-sm',
    md: 'h-[52px] px-7 rounded-button text-base',
    lg: 'h-14 px-9 rounded-button text-lg',
  };

  const variantStyles = {
    primary: 'bg-primary-light dark:bg-primary-dark text-white hover:bg-teal-800 dark:hover:bg-teal-500 focus:ring-teal-500 shadow-md hover:shadow-lg disabled:bg-slate-300 dark:disabled:bg-slate-700 disabled:shadow-none',
    secondary: 'bg-secondary-light dark:bg-secondary-dark text-white hover:bg-blue-700 dark:hover:bg-blue-500 focus:ring-blue-500 shadow-md disabled:bg-slate-300 dark:disabled:bg-slate-700',
    danger: 'bg-error text-white hover:bg-red-700 focus:ring-red-500 shadow-md',
    outline: 'bg-transparent border border-border-light dark:border-border-dark text-text-primaryLight dark:text-text-primaryDark hover:bg-slate-50 dark:hover:bg-slate-800 focus:ring-slate-400',
    text: 'bg-transparent text-text-primaryLight dark:text-text-primaryDark hover:underline focus:ring-transparent p-0 h-auto',
  };

  return (
    <button
      className={`${baseStyle} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="flex items-center space-x-2">
          <svg className="animate-spin h-5 w-5 text-current" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span>Loading...</span>
        </span>
      ) : (
        children
      )}
    </button>
  );
};
export default Button;
