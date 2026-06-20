import React, { useState, useMemo } from 'react';
import Pagination from './Pagination';
import { ChevronUp, ChevronDown, Search } from 'lucide-react';
import Input from '../common/Input';

interface ResultsTableProps {
  columns: string[];
  rows: Record<string, any>[];
  pageSize?: number;
}

export const ResultsTable: React.FC<ResultsTableProps> = ({
  columns,
  rows,
  pageSize = 10,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortCol, setSortCol] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);

  // Column resize stub width mapping
  const [colWidths, setColWidths] = useState<Record<string, number>>(() => {
    const widths: Record<string, number> = {};
    columns.forEach(col => {
      widths[col] = 160; // default min width
    });
    return widths;
  });

  const handleSort = (colName: string) => {
    if (sortCol === colName) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortCol(colName);
      setSortDir('asc');
    }
    setCurrentPage(1);
  };

  // 1. Filter rows by Search Term
  const filteredRows = useMemo(() => {
    if (!searchTerm.trim()) return rows;
    const term = searchTerm.toLowerCase();
    return rows.filter((row) =>
      columns.some((col) => {
        const val = row[col];
        if (val === null || val === undefined) return false;
        return String(val).toLowerCase().includes(term);
      })
    );
  }, [rows, columns, searchTerm]);

  // 2. Sort rows
  const sortedRows = useMemo(() => {
    if (!sortCol) return filteredRows;
    const sorted = [...filteredRows];
    sorted.sort((a, b) => {
      const valA = a[sortCol];
      const valB = b[sortCol];
      
      if (valA === null || valA === undefined) return 1;
      if (valB === null || valB === undefined) return -1;
      
      if (typeof valA === 'number' && typeof valB === 'number') {
        return sortDir === 'asc' ? valA - valB : valB - valA;
      }
      
      const strA = String(valA).toLowerCase();
      const strB = String(valB).toLowerCase();
      return sortDir === 'asc' 
        ? strA.localeCompare(strB) 
        : strB.localeCompare(strA);
    });
    return sorted;
  }, [filteredRows, sortCol, sortDir]);

  // 3. Paginate rows
  const paginatedRows = useMemo(() => {
    const startIdx = (currentPage - 1) * pageSize;
    return sortedRows.slice(startIdx, startIdx + pageSize);
  }, [sortedRows, currentPage, pageSize]);

  const totalPages = Math.ceil(sortedRows.length / pageSize);

  const startColumnResize = (e: React.MouseEvent, col: string) => {
    e.preventDefault();
    const startX = e.clientX;
    const startWidth = colWidths[col];

    const doDrag = (moveEvent: MouseEvent) => {
      const currentWidth = Math.max(80, startWidth + (moveEvent.clientX - startX));
      setColWidths((prev) => ({
        ...prev,
        [col]: currentWidth,
      }));
    };

    const stopDrag = () => {
      document.removeEventListener('mousemove', doDrag);
      document.removeEventListener('mouseup', stopDrag);
    };

    document.addEventListener('mousemove', doDrag);
    document.addEventListener('mouseup', stopDrag);
  };

  return (
    <div className="space-y-4">
      {/* Search Input filter */}
      <div className="flex items-center max-w-sm ml-auto relative">
        <Input
          placeholder="Search records..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
          className="h-[44px] pl-10"
        />
        <Search size={16} className="absolute left-3.5 top-[14px] text-slate-400 pointer-events-none" />
      </div>

      {/* Structured data table with Sticky header */}
      <div className="overflow-hidden border border-border-light dark:border-border-dark rounded-table bg-surface-light dark:bg-surface-dark shadow-sm">
        <div className="overflow-x-auto max-h-[500px]">
          <table className="min-w-full divide-y divide-border-light dark:divide-border-dark text-left table-fixed">
            <thead className="bg-slate-50 dark:bg-slate-800/50 sticky top-0 z-10">
              <tr>
                {columns.map((col) => {
                  const isSorted = sortCol === col;
                  return (
                    <th
                      key={col}
                      scope="col"
                      style={{ width: `${colWidths[col]}px` }}
                      className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-text-secondaryLight dark:text-text-secondaryDark hover:bg-slate-100 dark:hover:bg-slate-800 select-none relative group"
                    >
                      <button
                        onClick={() => handleSort(col)}
                        className="w-full flex items-center justify-between font-bold"
                      >
                        <span className="truncate">{col}</span>
                        <span className="ml-1 text-slate-400">
                          {isSorted ? (
                            sortDir === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                          ) : (
                            <ChevronDown size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                          )}
                        </span>
                      </button>
                      
                      {/* Column resizer line element */}
                      <div
                        onMouseDown={(e) => startColumnResize(e, col)}
                        className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-primary-light/50 bg-transparent z-10"
                      />
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody className="divide-y divide-border-light dark:divide-border-dark bg-white dark:bg-surface-dark">
              {paginatedRows.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="px-5 py-12 text-center text-sm text-text-secondaryLight dark:text-text-secondaryDark">
                    No matching records found.
                  </td>
                </tr>
              ) : (
                paginatedRows.map((row, rowIdx) => (
                  <tr key={rowIdx} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/20 transition-colors">
                    {columns.map((col) => {
                      const val = row[col];
                      return (
                        <td
                          key={col}
                          className="px-5 py-3.5 whitespace-nowrap text-sm text-text-primaryLight dark:text-text-primaryDark truncate font-mono text-xs"
                          title={String(val)}
                        >
                          {val === null || val === undefined ? (
                            <span className="text-slate-400 italic">null</span>
                          ) : typeof val === 'object' ? (
                            JSON.stringify(val)
                          ) : (
                            String(val)
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination component */}
      <Pagination
        currentPage={currentPage}
        totalPageCount={totalPages}
        onPageChange={setCurrentPage}
        rowsPerPage={pageSize}
        totalRows={sortedRows.length}
      />
    </div>
  );
};
export default ResultsTable;
