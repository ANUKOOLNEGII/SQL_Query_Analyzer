import React from 'react';
import Button from '../common/Button';
import { Play } from 'lucide-react';

interface ExecuteButtonProps {
  onExecute: () => void;
  isLoading: boolean;
  disabled?: boolean;
}

export const ExecuteButton: React.FC<ExecuteButtonProps> = ({
  onExecute,
  isLoading,
  disabled = false,
}) => {
  return (
    <div className="flex justify-end pt-2">
      <Button
        type="button"
        variant="secondary"
        className="w-full sm:w-auto shadow-md hover:shadow-lg flex items-center justify-center space-x-2"
        onClick={onExecute}
        disabled={disabled || isLoading}
        isLoading={isLoading}
      >
        {!isLoading && <Play size={16} />}
        <span>Run Query</span>
      </Button>
    </div>
  );
};
export default ExecuteButton;
