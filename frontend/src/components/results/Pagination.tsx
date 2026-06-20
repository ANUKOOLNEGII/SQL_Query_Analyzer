import React from 'react';
import Button from '../common/Button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPageCount: number;
  onPageChange: (page: number) => void;
  rowsPerPage: number;
  totalRows: number;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPageCount,
  onPageChange,
  rowsPerPage,
  totalRows,
}) => {
  if (totalPageCount <= 1) return null;

  const startRow = (currentPage - 1) * rowsPerPage + 1;
  const endRow = Math.min(currentPage * rowsPerPage, totalRows);

  return (
    <div className="flex items-center justify-between border-t border-border-light dark:border-border-dark pt-5 bg-transparent mt-4">
      <div className="text-xs font-semibold text-text-secondaryLight dark:text-text-secondaryDark">
        Showing <span className="font-bold text-text-primaryLight dark:text-text-primaryDark">{startRow}</span> to{' '}
        <span className="font-bold text-text-primaryLight dark:text-text-primaryDark">{endRow}</span> of{' '}
        <span className="font-bold text-text-primaryLight dark:text-text-primaryDark">{totalRows}</span> records
      </div>

      <div className="flex space-x-2">
        <Button
          variant="outline"
          size="sm"
          className="h-9 px-3 rounded-lg flex items-center"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          <ChevronLeft size={16} className="mr-1" />
          <span>Previous</span>
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="h-9 px-3 rounded-lg flex items-center"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPageCount}
        >
          <span>Next</span>
          <ChevronRight size={16} className="ml-1" />
        </Button>
      </div>
    </div>
  );
};
export default Pagination;
