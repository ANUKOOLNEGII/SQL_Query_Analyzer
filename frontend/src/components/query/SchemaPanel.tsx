import React from 'react';
import type { Dataset } from '../../store/datasetSlice';
import { Columns, Info } from 'lucide-react';

interface SchemaPanelProps {
  dataset: Dataset | null;
}

export const SchemaPanel: React.FC<SchemaPanelProps> = ({ dataset }) => {
  if (!dataset) {
    return (
      <div className="p-6 text-center text-xs font-semibold text-text-secondaryLight dark:text-text-secondaryDark">
        <Info size={28} className="mx-auto text-slate-400 mb-3" />
        No active schema selected. Link a database or upload a CSV file to begin.
      </div>
    );
  }

  return (
    <div className="space-y-5 text-left">
      <div className="flex items-center space-x-2 pb-3 border-b border-border-light dark:border-border-dark">
        <Columns size={16} className="text-primary-light" />
        <h4 className="text-sm font-bold text-text-primaryLight dark:text-text-primaryDark truncate">
          Active Schema Attributes
        </h4>
      </div>

      <div className="space-y-1.5 max-h-[380px] overflow-y-auto pr-1">
        {dataset.columns && dataset.columns.length > 0 ? (
          dataset.columns.map((col, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-2.5 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/10 hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-colors"
            >
              <span className="font-mono text-xs font-bold text-text-primaryLight dark:text-text-primaryDark">
                {col.name}
              </span>
              <div className="flex items-center space-x-1.5 text-[10px] font-semibold">
                <span className="text-text-secondaryLight dark:text-text-secondaryDark font-mono">{col.type}</span>
                {col.isPrimaryKey && (
                  <span className="text-amber-600 bg-amber-50 dark:bg-amber-950/20 px-1 rounded" title="Primary Key">
                    PK
                  </span>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="text-xs text-text-secondaryLight dark:text-text-secondaryDark italic text-center py-4">
            No columns detected in the selected source.
          </div>
        )}
      </div>
    </div>
  );
};
export default SchemaPanel;
