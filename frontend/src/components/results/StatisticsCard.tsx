import React from 'react';
import Card from '../common/Card';
import { Database, Zap } from 'lucide-react';

interface StatisticsCardProps {
  rowCount: number;
  executionTime: number;
}

export const StatisticsCard: React.FC<StatisticsCardProps> = ({
  rowCount,
  executionTime,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left w-full">
      <Card hoverable={false} className="p-5 flex items-center space-x-3.5 bg-slate-50 dark:bg-slate-800/40">
        <div className="p-2 bg-white dark:bg-slate-850 rounded-lg text-primary-light border border-slate-200 dark:border-slate-700 flex-shrink-0">
          <Database size={16} />
        </div>
        <div>
          <div className="text-sm text-text-secondaryLight dark:text-text-secondaryDark font-semibold">Records Returned</div>
          <div className="text-lg font-bold text-text-primaryLight dark:text-text-primaryDark mt-0.5">{rowCount.toLocaleString()} rows</div>
        </div>
      </Card>

      <Card hoverable={false} className="p-5 flex items-center space-x-3.5 bg-slate-50 dark:bg-slate-800/40">
        <div className="p-2 bg-white dark:bg-slate-850 rounded-lg text-amber-500 border border-slate-200 dark:border-slate-700 flex-shrink-0">
          <Zap size={16} />
        </div>
        <div>
          <div className="text-sm text-text-secondaryLight dark:text-text-secondaryDark font-semibold">Execution Speed</div>
          <div className="text-lg font-bold text-text-primaryLight dark:text-text-primaryDark mt-0.5">{executionTime} ms</div>
        </div>
      </Card>
    </div>
  );
};
export default StatisticsCard;
