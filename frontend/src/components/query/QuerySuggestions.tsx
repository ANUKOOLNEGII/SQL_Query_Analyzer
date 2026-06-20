import React from 'react';
import Card from '../common/Card';
import { HelpCircle, ArrowUpRight } from 'lucide-react';

interface QuerySuggestionsProps {
  suggestions: string[];
  onSelect: (suggestion: string) => void;
}

export const QuerySuggestions: React.FC<QuerySuggestionsProps> = ({
  suggestions,
  onSelect,
}) => {
  if (!suggestions || suggestions.length === 0) return null;

  return (
    <div className="space-y-3.5 text-left">
      <div className="flex items-center space-x-2 text-slate-500 font-bold text-sm">
        <HelpCircle size={16} />
        <span>Alternative interpretations / Suggested queries</span>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {suggestions.map((suggestion, idx) => (
          <Card
            key={idx}
            onClick={() => onSelect(suggestion)}
            className="p-5 border border-border-light dark:border-border-dark bg-slate-50/50 dark:bg-slate-900/10 cursor-pointer hover:border-accent-light dark:hover:border-accent-dark shadow-xs flex justify-between items-start text-xs font-semibold leading-relaxed group"
          >
            <span className="text-text-primaryLight dark:text-text-primaryDark pr-2 truncate-2-lines group-hover:text-accent-light dark:group-hover:text-accent-dark">
              {suggestion}
            </span>
            <ArrowUpRight size={13} className="text-slate-400 group-hover:text-accent-light dark:group-hover:text-accent-dark flex-shrink-0" />
          </Card>
        ))}
      </div>
    </div>
  );
};
export default QuerySuggestions;
