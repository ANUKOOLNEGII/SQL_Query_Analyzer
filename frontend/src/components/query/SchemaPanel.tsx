import React, { useState } from 'react';
import type { Dataset } from '../../store/datasetSlice';
import { useAppSelector } from '../../hooks/redux';
import { Columns, Info, Table2, KeyRound, ChevronDown, ChevronRight } from 'lucide-react';

interface SchemaPanelProps {
  dataset: Dataset | null;
}

export const SchemaPanel: React.FC<SchemaPanelProps> = ({ dataset }) => {
  const { schema } = useAppSelector(state => state.dataset);
  const [expandedTables, setExpandedTables] = useState<Record<string, boolean>>({});

  const toggleTable = (tableName: string) => {
    setExpandedTables((prev) => ({
      ...prev,
      [tableName]: !prev[tableName],
    }));
  };

  if (!dataset) {
    return (
      <div className="p-6 text-center text-xs font-semibold text-text-secondaryLight dark:text-text-secondaryDark">
        <Info size={28} className="mx-auto text-slate-400 mb-3" />
        No active schema selected. Link a database or upload a CSV file to begin.
      </div>
    );
  }

  const isDb = dataset.name.startsWith('db://');

  return (
    <div className="space-y-5 text-left">
      <div className="flex items-center space-x-2 pb-3 border-b border-border-light dark:border-border-dark">
        <Columns size={16} className="text-primary-light" />
        <h4 className="text-sm font-bold text-text-primaryLight dark:text-text-primaryDark truncate">
          {isDb ? 'Connected DB Schema' : 'Active Schema Attributes'}
        </h4>
      </div>

      <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
        {isDb ? (
          schema && schema.tables && schema.tables.length > 0 ? (
            schema.tables.map((table) => {
              const isExpanded = !!expandedTables[table.name];
              return (
                <div key={table.name} className="border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden bg-slate-50/50 dark:bg-slate-900/10">
                  <button
                    onClick={() => toggleTable(table.name)}
                    className="w-full flex items-center justify-between p-2.5 hover:bg-slate-100 dark:hover:bg-slate-800/40 transition-colors focus:outline-none"
                  >
                    <div className="flex items-center space-x-2">
                      <Table2 size={14} className="text-primary-light" />
                      <span className="font-mono text-xs font-bold text-text-primaryLight dark:text-text-primaryDark">
                        {table.name}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] text-slate-500">{table.columns.length} cols</span>
                      {isExpanded ? <ChevronDown size={14} className="text-slate-400" /> : <ChevronRight size={14} className="text-slate-400" />}
                    </div>
                  </button>
                  {isExpanded && (
                    <div className="border-t border-slate-200 dark:border-slate-800 px-3 py-2 bg-white dark:bg-slate-900/50">
                      <div className="divide-y divide-slate-100 dark:divide-slate-800/50">
                        {table.columns.map((col, idx) => (
                          <div key={idx} className="flex items-center justify-between py-1.5">
                            <span className="font-mono text-[11px] font-bold text-slate-700 dark:text-slate-300">
                              {col.name}
                            </span>
                            <div className="flex items-center space-x-1.5 text-[9px] font-semibold">
                              <span className="text-slate-400">{col.type}</span>
                              {col.isPrimaryKey && (
                                <span className="text-amber-600 bg-amber-50 dark:bg-amber-950/20 px-1 rounded flex items-center" title="Primary Key">
                                  <KeyRound size={8} className="mr-0.5" /> PK
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="text-xs text-text-secondaryLight dark:text-text-secondaryDark italic text-center py-4">
              Loading schema or no tables detected...
            </div>
          )
        ) : (
          dataset.columns && dataset.columns.length > 0 ? (
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
          )
        )}
      </div>
    </div>
  );
};
export default SchemaPanel;
