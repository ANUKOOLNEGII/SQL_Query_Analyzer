import React from 'react';
import type { Dataset } from '../../store/datasetSlice';
import Card from '../common/Card';
import Badge from '../common/Badge';
import { Database, Calendar } from 'lucide-react';

interface DatasetCardProps {
  dataset: Dataset;
  isSelected: boolean;
  onSelect: () => void;
}

export const DatasetCard: React.FC<DatasetCardProps> = ({
  dataset,
  isSelected,
  onSelect,
}) => {
  return (
    <Card
      onClick={onSelect}
      className={`cursor-pointer p-6 flex flex-col justify-between border-2 transition-all duration-200 text-left
        ${isSelected 
          ? 'border-primary-light dark:border-primary-dark shadow-hover' 
          : 'border-border-light dark:border-border-dark'
        }`}
    >
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="p-2.5 bg-slate-50 dark:bg-slate-800 rounded-lg text-slate-500">
            <Database size={20} />
          </div>
          <Badge variant={dataset.status === 'available' ? 'success' : 'warning'}>
            {dataset.status === 'available' ? 'Ready' : 'Processing'}
          </Badge>
        </div>
        
        <h4 className="text-base font-bold text-text-primaryLight dark:text-text-primaryDark truncate">
          {dataset.name}
        </h4>
        <div className="mt-1.5 flex items-center space-x-4 text-xs font-semibold text-text-secondaryLight dark:text-text-secondaryDark">
          <span>{dataset.rowCount.toLocaleString()} rows</span>
          <span>•</span>
          <span>{dataset.columnCount} columns</span>
        </div>
      </div>

      <div className="mt-5 pt-3.5 border-t border-border-light dark:border-border-dark flex items-center justify-between text-xs text-text-secondaryLight dark:text-text-secondaryDark font-medium">
        <span className="flex items-center space-x-1.5">
          <Calendar size={13} />
          <span>{new Date(dataset.createdAt).toLocaleDateString()}</span>
        </span>
        {isSelected && (
          <span className="text-primary-light dark:text-primary-dark font-bold">Active</span>
        )}
      </div>
    </Card>
  );
};
export default DatasetCard;
