import React from 'react';
import { Database, FileSpreadsheet, History, Search } from 'lucide-react';
import Button from './Button';

interface EmptyStateProps {
  title: string;
  description: string;
  type?: 'database' | 'dataset' | 'history' | 'search';
  actionLabel?: string;
  onActionClick?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  type = 'search',
  actionLabel,
  onActionClick,
}) => {
  const icons = {
    database: <Database size={48} className="text-slate-400 dark:text-slate-600 animate-pulse" />,
    dataset: <FileSpreadsheet size={48} className="text-slate-400 dark:text-slate-600 animate-pulse" />,
    history: <History size={48} className="text-slate-400 dark:text-slate-600 animate-pulse" />,
    search: <Search size={48} className="text-slate-400 dark:text-slate-600 animate-pulse" />,
  };

  return (
    <div className="flex flex-col items-center justify-center text-center p-12 border border-dashed border-border-light dark:border-border-dark rounded-card bg-surface-light/40 dark:bg-surface-dark/40 py-16">
      <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-full mb-6">
        {icons[type]}
      </div>
      <h3 className="text-lg font-bold text-text-primaryLight dark:text-text-primaryDark mb-2">
        {title}
      </h3>
      <p className="text-sm text-text-secondaryLight dark:text-text-secondaryDark max-w-md mb-6 leading-relaxed">
        {description}
      </p>
      {actionLabel && onActionClick && (
        <Button variant="primary" onClick={onActionClick}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
};
export default EmptyState;
