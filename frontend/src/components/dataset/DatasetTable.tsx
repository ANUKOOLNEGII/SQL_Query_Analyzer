import React from 'react';
import type { Dataset } from '../../store/datasetSlice';
import Badge from '../common/Badge';
import Button from '../common/Button';
import { Database, Trash2, CheckCircle2 } from 'lucide-react';

interface DatasetTableProps {
  datasets: Dataset[];
  selectedDataset: Dataset | null;
  onSelect: (dataset: Dataset) => void;
  onDelete: (id: string) => void;
}

export const DatasetTable: React.FC<DatasetTableProps> = ({
  datasets,
  selectedDataset,
  onSelect,
  onDelete,
}) => {
  return (
    <div className="overflow-hidden border border-border-light dark:border-border-dark rounded-table bg-surface-light dark:bg-surface-dark transition-colors duration-200">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-border-light dark:divide-border-dark text-left">
          <thead className="bg-slate-50 dark:bg-slate-800/50">
            <tr>
              <th scope="col" className="px-6 py-4.5 text-xs font-bold uppercase tracking-wider text-text-secondaryLight dark:text-text-secondaryDark">
                Dataset Name
              </th>
              <th scope="col" className="px-6 py-4.5 text-xs font-bold uppercase tracking-wider text-text-secondaryLight dark:text-text-secondaryDark">
                Rows count
              </th>
              <th scope="col" className="px-6 py-4.5 text-xs font-bold uppercase tracking-wider text-text-secondaryLight dark:text-text-secondaryDark">
                Columns count
              </th>
              <th scope="col" className="px-6 py-4.5 text-xs font-bold uppercase tracking-wider text-text-secondaryLight dark:text-text-secondaryDark">
                Upload Date
              </th>
              <th scope="col" className="px-6 py-4.5 text-xs font-bold uppercase tracking-wider text-text-secondaryLight dark:text-text-secondaryDark">
                Status
              </th>
              <th scope="col" className="relative px-6 py-4.5 text-right text-xs font-bold uppercase tracking-wider text-text-secondaryLight dark:text-text-secondaryDark">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-light dark:divide-border-dark">
            {datasets.map((d) => {
              const isSelected = selectedDataset?.id === d.id;
              return (
                <tr
                  key={d.id}
                  className={`hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors duration-150
                    ${isSelected ? 'bg-teal-50/15 dark:bg-teal-950/10' : ''}`}
                >
                  <td className="px-6 py-4.5 whitespace-nowrap text-sm font-bold text-text-primaryLight dark:text-text-primaryDark flex items-center space-x-2.5">
                    <Database size={16} className="text-slate-400" />
                    <span className="truncate max-w-[200px]">{d.name}</span>
                  </td>
                  <td className="px-6 py-4.5 whitespace-nowrap text-sm text-text-secondaryLight dark:text-text-secondaryDark font-medium">
                    {d.rowCount.toLocaleString()}
                  </td>
                  <td className="px-6 py-4.5 whitespace-nowrap text-sm text-text-secondaryLight dark:text-text-secondaryDark font-medium">
                    {d.columnCount}
                  </td>
                  <td className="px-6 py-4.5 whitespace-nowrap text-sm text-text-secondaryLight dark:text-text-secondaryDark">
                    {new Date(d.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4.5 whitespace-nowrap">
                    <Badge variant={d.status === 'available' ? 'success' : 'warning'}>
                      {d.status === 'available' ? 'Available' : 'Processing'}
                    </Badge>
                  </td>
                  <td className="px-6 py-4.5 whitespace-nowrap text-right text-sm font-semibold space-x-2">
                    <Button
                      variant={isSelected ? 'secondary' : 'outline'}
                      size="sm"
                      className="h-8.5 rounded-lg text-xs"
                      onClick={() => onSelect(d)}
                      disabled={d.status !== 'available'}
                    >
                      {isSelected ? (
                        <span className="flex items-center space-x-1">
                          <CheckCircle2 size={13} />
                          <span>Selected</span>
                        </span>
                      ) : (
                        'Select'
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8.5 w-8.5 p-0 border-red-200 dark:border-red-900/40 text-error hover:bg-red-50 dark:hover:bg-red-950/20"
                      onClick={() => onDelete(d.id)}
                    >
                      <Trash2 size={14} />
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
export default DatasetTable;
