import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  className = '',
  id,
  type = 'text',
  ...props
}) => {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className="flex flex-col w-full text-left">
      {label && (
        <label
          htmlFor={inputId}
          className="text-sm font-semibold mb-2 text-text-primaryLight dark:text-text-primaryDark"
        >
          {label}
        </label>
      )}
      <input
        type={type}
        id={inputId}
        className={`h-[52px] px-[18px] rounded-input border bg-surface-light dark:bg-surface-dark transition-all duration-200 outline-none
          ${error 
            ? 'border-error focus:ring-1 focus:ring-error' 
            : 'border-border-light dark:border-border-dark focus:border-primary-light dark:focus:border-primary-dark focus:ring-1 focus:ring-primary-light'
          }
          text-text-primaryLight dark:text-text-primaryDark text-base placeholder:text-slate-400 dark:placeholder:text-slate-600 disabled:bg-slate-50 dark:disabled:bg-slate-900 disabled:cursor-not-allowed ${className}`}
        {...props}
      />
      {error ? (
        <span className="text-xs text-error mt-1.5 font-medium">{error}</span>
      ) : helperText ? (
        <span className="text-xs text-text-secondaryLight dark:text-text-secondaryDark mt-1.5">{helperText}</span>
      ) : null}
    </div>
  );
};
export default Input;
