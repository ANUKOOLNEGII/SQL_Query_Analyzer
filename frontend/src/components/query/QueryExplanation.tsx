import React from 'react';
import Card from '../common/Card';
import { Sparkles } from 'lucide-react';

interface QueryExplanationProps {
  explanation: string;
}

export const QueryExplanation: React.FC<QueryExplanationProps> = ({ explanation }) => {
  if (!explanation) return null;

  return (
    <div className="space-y-3.5 text-left">
      <div className="flex items-center space-x-2 text-slate-500 font-bold text-sm">
        <Sparkles size={16} className="text-accent-light dark:text-accent-dark" />
        <span>AI Translation Explanation</span>
      </div>

      <Card className="p-6 bg-slate-50/50 dark:bg-slate-900/10 border border-border-light dark:border-border-dark leading-relaxed">
        <p className="text-sm text-text-primaryLight dark:text-text-primaryDark">
          {explanation}
        </p>
      </Card>
    </div>
  );
};
export default QueryExplanation;
