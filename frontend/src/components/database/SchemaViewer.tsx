import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Table2, KeyRound } from 'lucide-react';

interface SchemaViewerProps {
  schema: {
    tables: {
      name: string;
      columns: {
        name: string;
        type: string;
        isPrimaryKey: boolean;
        isForeignKey: boolean;
      }[];
    }[];
  } | null;
}

export const SchemaViewer: React.FC<SchemaViewerProps> = ({ schema }) => {
  const [expandedTables, setExpandedTables] = useState<Record<string, boolean>>({});

  const toggleTable = (tableName: string) => {
    setExpandedTables((prev) => ({
      ...prev,
      [tableName]: !prev[tableName],
    }));
  };

  if (!schema || !schema.tables || schema.tables.length === 0) {
    return (
      <div className="py-8 text-center text-sm text-text-secondaryLight dark:text-text-secondaryDark">
        No schema tables detected. Verify connection settings.
      </div>
    );
  }

  return (
    <div className="space-y-3.5 text-left">
      <h4 className="text-base font-bold text-text-primaryLight dark:text-text-primaryDark">
        Detected Schema Tables ({schema.tables.length})
      </h4>
      <div className="space-y-2 max-h-[450px] overflow-y-auto pr-1">
        {schema.tables.map((table) => {
          const isExpanded = !!expandedTables[table.name];
          return (
            <div
              key={table.name}
              className="border border-border-light dark:border-border-dark rounded-xl overflow-hidden bg-surface-light dark:bg-surface-dark transition-all duration-200"
            >
              {/* Header Toggle */}
              <button
                onClick={() => toggleTable(table.name)}
                className="w-full flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors focus:outline-none"
              >
                <div className="flex items-center space-x-2.5">
                  <Table2 size={16} className="text-primary-light dark:text-primary-dark" />
                  <span className="text-sm font-bold text-text-primaryLight dark:text-text-primaryDark font-mono">
                    {table.name}
                  </span>
                  <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-500 font-semibold px-2 py-0.5 rounded-full">
                    {table.columns.length} columns
                  </span>
                </div>
                {isExpanded ? <ChevronDown size={16} className="text-slate-400" /> : <ChevronRight size={16} className="text-slate-400" />}
              </button>

              {/* Column list */}
              {isExpanded && (
                <div className="border-t border-border-light dark:border-border-dark px-4 py-2 bg-slate-50/50 dark:bg-slate-900/10">
                  <div className="divide-y divide-slate-100 dark:divide-slate-800">
                    {table.columns.map((col, idx) => (
                      <div key={idx} className="flex items-center justify-between py-2 text-xs font-mono">
                        <span className="font-bold text-slate-700 dark:text-slate-300">
                          {col.name}
                        </span>
                        <div className="flex items-center space-x-2">
                          <span className="text-slate-400">{col.type}</span>
                          {col.isPrimaryKey && (
                            <span className="text-[9px] font-bold text-amber-600 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 px-1 rounded flex items-center space-x-0.5">
                              <KeyRound size={9} />
                              <span>PK</span>
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
        })}
      </div>
    </div>
  );
};
export default SchemaViewer;
