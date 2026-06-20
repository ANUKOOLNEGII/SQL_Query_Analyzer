import React from 'react';
import Card from '../common/Card';
import Badge from '../common/Badge';
import { Calendar, Link2 } from 'lucide-react';

interface ConnectionCardProps {
  connection: {
    id: string;
    name: string;
    type: string;
    host: string;
    databaseName: string;
    createdAt: string;
  };
  isSelected: boolean;
  onSelect: () => void;
}

export const ConnectionCard: React.FC<ConnectionCardProps> = ({
  connection,
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
            <Link2 size={20} />
          </div>
          <Badge variant="primary">
            {connection.type.toUpperCase()}
          </Badge>
        </div>

        <h4 className="text-base font-bold text-text-primaryLight dark:text-text-primaryDark truncate">
          {connection.name}
        </h4>
        <div className="mt-1.5 space-y-1 text-xs text-text-secondaryLight dark:text-text-secondaryDark">
          <p className="truncate">Host: <span className="font-semibold">{connection.host}</span></p>
          <p className="truncate">DB: <span className="font-semibold">{connection.databaseName}</span></p>
        </div>
      </div>

      <div className="mt-5 pt-3.5 border-t border-border-light dark:border-border-dark flex items-center justify-between text-xs text-text-secondaryLight dark:text-text-secondaryDark font-medium">
        <span className="flex items-center space-x-1.5">
          <Calendar size={13} />
          <span>{new Date(connection.createdAt).toLocaleDateString()}</span>
        </span>
        {isSelected ? (
          <span className="text-primary-light dark:text-primary-dark font-bold">Selected</span>
        ) : (
          <span className="text-slate-400">Idle</span>
        )}
      </div>
    </Card>
  );
};
export default ConnectionCard;
