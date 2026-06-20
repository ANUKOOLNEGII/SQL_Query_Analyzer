import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAppDispatch } from '../../hooks/redux';
import { setNaturalQuery, setGeneratedSQL, setExplanation, setValidation } from '../../store/querySlice';
import { historyService } from '../../services/history.service';
import { useToast } from '../../contexts/ToastContext';
import Card from '../../components/common/Card';
import Loader from '../../components/common/Loader';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import SQLViewer from '../../components/query/SQLViewer';
import QueryExplanation from '../../components/query/QueryExplanation';
import StatisticsCard from '../../components/results/StatisticsCard';
import { ArrowLeft, Play, ArrowUpRight } from 'lucide-react';

export const QueryDetails: React.FC = () => {
  const { id = '' } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { addToast } = useToast();

  const [queryItem, setQueryItem] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchItem = async () => {
      try {
        const data = await historyService.getHistoryItem(id);
        setQueryItem(data);
      } catch (err) {
        addToast('Failed to retrieve query details', 'error');
        navigate('/query-history');
      } finally {
        setLoading(false);
      }
    };

    fetchItem();
  }, [id, navigate]);

  const handleReuse = () => {
    if (!queryItem) return;
    dispatch(setNaturalQuery(queryItem.naturalQuery));
    dispatch(setGeneratedSQL(queryItem.generatedSQL));
    dispatch(setExplanation(queryItem.explanation));
    dispatch(setValidation({ isValid: true, errors: [] }));
    addToast('Loaded query into workspace', 'success');
    navigate('/query-generator');
  };

  if (loading) {
    return <Loader fullScreen text="Fetching query metrics..." />;
  }

  if (!queryItem) return null;

  return (
    <div className="space-y-8 text-left animate-fade-in max-w-4xl mx-auto">
      {/* Header breadcrumb */}
      <div className="flex items-center space-x-3.5">
        <Link 
          to="/query-history"
          className="p-2 border border-border-light dark:border-border-dark rounded-xl bg-surface-light dark:bg-surface-dark text-slate-500 hover:text-slate-700 dark:hover:text-slate-350 shadow-sm"
        >
          <ArrowLeft size={16} />
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-text-primaryLight dark:text-text-primaryDark">
            Query Details
          </h1>
          <p className="text-sm text-text-secondaryLight dark:text-text-secondaryDark mt-1">
            Detailed compilation specs and runtime statistics for this query.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Natural query prompt info */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4 border-b border-border-light dark:border-border-dark pb-3">
            <span className="text-xs font-semibold text-text-secondaryLight dark:text-text-secondaryDark">Natural Language Instruction</span>
            <Badge variant={queryItem.status === 'success' ? 'success' : 'error'}>
              {queryItem.status === 'success' ? 'Successful Run' : 'Failed Run'}
            </Badge>
          </div>
          <h3 className="text-lg font-bold text-text-primaryLight dark:text-text-primaryDark leading-relaxed">
            "{queryItem.naturalQuery}"
          </h3>
        </Card>

        {/* Generated SQL query */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold text-text-secondaryLight dark:text-text-secondaryDark">Compiled SQL code</span>
          </div>
          <SQLViewer sql={queryItem.generatedSQL} onSQLChange={() => {}} />
        </Card>

        {/* Statistics speed */}
        <StatisticsCard
          rowCount={queryItem.status === 'success' ? 5 : 0}
          executionTime={queryItem.executionTime}
        />

        {/* Explanation */}
        <QueryExplanation explanation={queryItem.explanation} />

        {/* Action triggers */}
        <div className="flex justify-end space-x-4 pt-4">
          <Button variant="outline" className="flex items-center space-x-2" onClick={handleReuse}>
            <ArrowUpRight size={16} />
            <span>Reuse Query</span>
          </Button>
          <Button variant="primary" className="flex items-center space-x-2" onClick={() => navigate('/query-execution')}>
            <Play size={16} />
            <span>Execute SQL</span>
          </Button>
        </div>
      </div>
    </div>
  );
};
export default QueryDetails;
