import React from 'react';
import type { Dataset } from '../../store/datasetSlice';
import { KeyRound, Columns, Rows } from 'lucide-react';

interface DatasetPreviewProps {
  dataset: Dataset;
}

export const DatasetPreview: React.FC<DatasetPreviewProps> = ({ dataset }) => {
  return (
    <div className="space-y-6 text-left">
      <div className="flex items-center space-x-6 pb-4 border-b border-border-light dark:border-border-dark">
        <div className="flex items-center space-x-2 text-slate-500">
          <Rows size={16} />
          <span className="text-sm font-semibold">{dataset.rowCount.toLocaleString()} Rows</span>
        </div>
        <div className="flex items-center space-x-2 text-slate-500">
          <Columns size={16} />
          <span className="text-sm font-semibold">{dataset.columnCount} Columns</span>
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="text-base font-bold text-text-primaryLight dark:text-text-primaryDark">
          Columns Schema
        </h4>
        
        <div className="overflow-hidden border border-border-light dark:border-border-dark rounded-table">
          <table className="min-w-full divide-y divide-border-light dark:divide-border-dark text-left">
            <thead className="bg-slate-50 dark:bg-slate-800/40">
              <tr>
                <th scope="col" className="px-5 py-3 text-xs font-bold text-text-secondaryLight dark:text-text-secondaryDark uppercase">
                  Column Name
                </th>
                <th scope="col" className="px-5 py-3 text-xs font-bold text-text-secondaryLight dark:text-text-secondaryDark uppercase">
                  Data Type
                </th>
                <th scope="col" className="px-5 py-3 text-xs font-bold text-text-secondaryLight dark:text-text-secondaryDark uppercase">
                  Nullable
                </th>
                <th scope="col" className="px-5 py-3 text-xs font-bold text-text-secondaryLight dark:text-text-secondaryDark uppercase">
                  Keys
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-light dark:divide-border-dark text-sm bg-white dark:bg-surface-dark">
              {dataset.columns?.map((col, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20">
                  <td className="px-5 py-3.5 font-semibold text-text-primaryLight dark:text-text-primaryDark font-mono text-xs">
                    {col.name}
                  </td>
                  <td className="px-5 py-3.5 text-text-secondaryLight dark:text-text-secondaryDark font-mono text-xs">
                    {col.type}
                  </td>
                  <td className="px-5 py-3.5 text-text-secondaryLight dark:text-text-secondaryDark">
                    {col.isNullable ? 'Yes' : 'No'}
                  </td>
                  <td className="px-5 py-3.5">
                    {col.isPrimaryKey && (
                      <span className="inline-flex items-center space-x-1 text-xs font-bold text-amber-600 bg-amber-50 dark:bg-amber-950/20 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-800">
                        <KeyRound size={11} />
                        <span>PK</span>
                      </span>
                    )}
                    {!col.isPrimaryKey && '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
export default DatasetPreview;
