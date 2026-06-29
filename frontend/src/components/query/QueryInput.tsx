import React from 'react';
import TextArea from '../common/TextArea';
import Button from '../common/Button';
import { Send } from 'lucide-react';

interface QueryInputProps {
  value: string;
  onChange: (val: string) => void;
  onSubmit: () => void;
  isLoading: boolean;
  placeholder?: string;
}

export const QueryInput: React.FC<QueryInputProps> = ({
  value,
  onChange,
  onSubmit,
  isLoading,
  placeholder = "Ask anything about your database... (e.g. Show top 10 employees by salary)"
}) => {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Submit on Ctrl+Enter or Cmd+Enter
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      onSubmit();
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <form onSubmit={handleFormSubmit} className="space-y-4 w-full text-left">
      <div className="relative">
        <TextArea
          rows={5}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="pr-16 text-base font-medium h-[180px] shadow-sm"
          disabled={isLoading}
        />
        <div className="absolute right-4 bottom-4 flex items-center space-x-3">
          <span className="hidden sm:inline text-xs text-text-secondaryLight dark:text-text-secondaryDark font-semibold bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
            Ctrl + Enter
          </span>
          <Button
            type="submit"
            variant="primary"
            className="flex items-center space-x-2 px-4 py-2"
            disabled={!value.trim() || isLoading}
            isLoading={isLoading}
            aria-label="Generate SQL Query"
          >
            {!isLoading && <Send size={16} />}
            <span>Generate SQL</span>
          </Button>
        </div>
      </div>
    </form>
  );
};
export default QueryInput;
