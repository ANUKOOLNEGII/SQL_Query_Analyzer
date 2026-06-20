import React from 'react';
import Badge from '../common/Badge';
import { ShieldCheck, ShieldAlert } from 'lucide-react';

interface ValidationPanelProps {
  validation: {
    isValid: boolean;
    errors: string[];
  } | null;
}

export const ValidationPanel: React.FC<ValidationPanelProps> = ({ validation }) => {
  if (!validation) return null;

  return (
    <div className={`p-5 rounded-xl border text-left flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0
      ${validation.isValid 
        ? 'bg-green-50/40 dark:bg-green-950/10 border-green-200 dark:border-green-800' 
        : 'bg-red-50/40 dark:bg-red-950/10 border-red-200 dark:border-red-800'
      }`}
    >
      <div className="flex items-start space-x-3 text-sm">
        <div className={`p-2.5 rounded-lg flex-shrink-0 ${
          validation.isValid 
            ? 'bg-green-100 dark:bg-green-900/20 text-success' 
            : 'bg-red-100 dark:bg-red-900/20 text-error'
        }`}>
          {validation.isValid ? <ShieldCheck size={20} /> : <ShieldAlert size={20} />}
        </div>
        <div>
          <h4 className="font-bold text-text-primaryLight dark:text-text-primaryDark">
            {validation.isValid ? 'Query Approved' : 'Query Validation Failed'}
          </h4>
          <p className="text-xs text-text-secondaryLight dark:text-text-secondaryDark mt-0.5 leading-relaxed">
            {validation.isValid 
              ? 'Syntax verified. Schema structures match database records and no restricted commands detected.' 
              : 'Syntax issues or forbidden operations prevent execution.'}
          </p>
          {!validation.isValid && validation.errors.length > 0 && (
            <ul className="mt-3.5 space-y-1 text-xs font-semibold text-error list-disc pl-4">
              {validation.errors.map((err, idx) => (
                <li key={idx}>{err}</li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="flex-shrink-0">
        <Badge variant={validation.isValid ? 'success' : 'error'}>
          {validation.isValid ? 'Valid' : 'Blocked'}
        </Badge>
      </div>
    </div>
  );
};
export default ValidationPanel;
