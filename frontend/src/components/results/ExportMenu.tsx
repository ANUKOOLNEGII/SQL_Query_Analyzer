import React, { useState } from 'react';
import { exportService } from '../../services/export.service';
import Button from '../common/Button';
import { Download, FileText, Sheet, File } from 'lucide-react';

interface ExportMenuProps {
  columns: string[];
  rows: Record<string, any>[];
  filename?: string;
}

export const ExportMenu: React.FC<ExportMenuProps> = ({
  columns,
  rows,
  filename = 'query_results',
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleExport = (format: 'csv' | 'excel' | 'pdf') => {
    setDropdownOpen(false);
    if (format === 'csv') {
      exportService.exportToCSV(filename, columns, rows);
    } else if (format === 'excel') {
      exportService.exportToExcel(filename, columns, rows);
    } else if (format === 'pdf') {
      exportService.exportToPDF(filename, columns, rows);
    }
  };

  return (
    <div className="relative">
      <Button
        variant="outline"
        size="sm"
        className="h-[44px] rounded-lg px-4 flex items-center space-x-2 border-border-light dark:border-border-dark"
        onClick={() => setDropdownOpen(!dropdownOpen)}
      >
        <Download size={15} />
        <span>Export Data</span>
      </Button>

      {dropdownOpen && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setDropdownOpen(false)} />
          <div className="absolute right-0 z-40 mt-2 w-48 origin-top-right divide-y divide-slate-100 dark:divide-slate-800 rounded-lg bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark shadow-modal py-1 ring-1 ring-black ring-opacity-5 focus:outline-none text-left">
            <button
              onClick={() => handleExport('csv')}
              className="flex w-full items-center px-4 py-2.5 text-sm text-text-primaryLight dark:text-text-primaryDark hover:bg-slate-50 dark:hover:bg-slate-850/50 transition-colors"
            >
              <File size={15} className="mr-3 text-slate-400" />
              CSV Format
            </button>
            <button
              onClick={() => handleExport('excel')}
              className="flex w-full items-center px-4 py-2.5 text-sm text-text-primaryLight dark:text-text-primaryDark hover:bg-slate-50 dark:hover:bg-slate-850/50 transition-colors"
            >
              <Sheet size={15} className="mr-3 text-slate-400" />
              Excel Worksheet
            </button>
            <button
              onClick={() => handleExport('pdf')}
              className="flex w-full items-center px-4 py-2.5 text-sm text-text-primaryLight dark:text-text-primaryDark hover:bg-slate-50 dark:hover:bg-slate-850/50 transition-colors"
            >
              <FileText size={15} className="mr-3 text-slate-400" />
              ASCII PDF Report
            </button>
          </div>
        </>
      )}
    </div>
  );
};
export default ExportMenu;
