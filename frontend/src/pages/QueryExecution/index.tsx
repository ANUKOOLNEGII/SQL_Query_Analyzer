import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../../hooks/redux';
import { setResults } from '../../store/querySlice';
import { queryService } from '../../services/query.service';
import { useToast } from '../../contexts/ToastContext';
import StatisticsCard from '../../components/results/StatisticsCard';
import ExportMenu from '../../components/results/ExportMenu';
import ResultsTable from '../../components/results/ResultsTable';
import Card from '../../components/common/Card';
import Loader from '../../components/common/Loader';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import { ArrowLeft, Play, AlertCircle, LayoutGrid, Terminal } from 'lucide-react';

export const QueryExecution: React.FC = () => {
  const dispatch = useAppDispatch();
  const { addToast } = useToast();

  const { generatedSQL, naturalQuery, results } = useAppSelector((state) => state.query);
  const { selectedDataset } = useAppSelector((state) => state.dataset);

  const [executing, setExecuting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleExecute = async () => {
    if (!generatedSQL) return;
    setExecuting(true);
    setErrorMsg('');
    try {
      const isDb = selectedDataset?.name?.startsWith('db://');
      const res = await queryService.executeSQL({
        sql: generatedSQL,
        datasetId: isDb ? undefined : selectedDataset?.id,
        connectionId: isDb ? selectedDataset?.id : undefined,
        naturalQuery,
      });

      dispatch(setResults({
        columns: res.columns,
        rows: res.rows,
        rowCount: res.rowCount,
        executionTime: res.executionTime,
      }));
      addToast('Query executed successfully!', 'success');
    } catch (err: any) {
      const msg = err.response?.data?.message || 'SQL execution failed. Check query syntax.';
      setErrorMsg(msg);
      addToast(msg, 'error');
    } finally {
      setExecuting(false);
    }
  };

  if (!generatedSQL) {
    return (
      <div className="space-y-6 text-left animate-fade-in max-w-2xl mx-auto py-12">
        <Card className="p-8 text-center flex flex-col items-center">
          <AlertCircle size={48} className="text-slate-400 mb-4" />
          <h3 className="text-lg font-bold text-text-primaryLight dark:text-text-primaryDark mb-2">No Active Query to Run</h3>
          <p className="text-sm text-text-secondaryLight dark:text-text-secondaryDark mb-6 max-w-sm">
            Please author or generate a SQL query in the workspace before executing.
          </p>
          <Link to="/query-generator">
            <Button variant="primary">Go to Workspace</Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8 text-left animate-fade-in">
      {/* Header breadcrumb */}
      <div className="flex items-center space-x-3.5">
        <Link 
          to="/query-generator"
          className="p-2 border border-border-light dark:border-border-dark rounded-xl bg-surface-light dark:bg-surface-dark text-slate-500 hover:text-slate-700 dark:hover:text-slate-350 shadow-sm"
        >
          <ArrowLeft size={16} />
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-text-primaryLight dark:text-text-primaryDark">
            Query Runner
          </h1>
          <p className="text-sm text-text-secondaryLight dark:text-text-secondaryDark mt-1">
            Execute your generated SQL statement safely and explore structured data tables.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* SQL Preview block */}
        <Card className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-border-light dark:border-border-dark pb-4 mb-4 space-y-3 sm:space-y-0">
            <div className="flex items-center space-x-2 text-slate-500 font-bold text-sm">
              <Terminal size={16} />
              <span>Target SQL Statement</span>
            </div>
            {selectedDataset && (
              <Badge variant="primary" className="text-xs">
                Target: {selectedDataset.name}
              </Badge>
            )}
          </div>
          <pre className="p-4 rounded-xl bg-slate-950 text-emerald-400 font-mono text-sm leading-relaxed overflow-x-auto border border-slate-900 shadow-inner">
            {generatedSQL}
          </pre>
          <div className="flex justify-end mt-5">
            <Button
              variant="primary"
              onClick={handleExecute}
              isLoading={executing}
              className="flex items-center space-x-2 shadow-md hover:shadow-lg"
            >
              {!executing && <Play size={16} />}
              <span>Execute SQL Statement</span>
            </Button>
          </div>
        </Card>

        {/* Loading overlay panel */}
        {executing && (
          <Card className="p-8 text-center border-none shadow-none">
            <Loader text="Opening database connection & running SQL query..." />
          </Card>
        )}

        {/* Error notification banner */}
        {!executing && errorMsg && (
          <div className="flex items-start space-x-3.5 p-5 border border-red-200 dark:border-red-900/35 rounded-card bg-red-50 dark:bg-red-950/15 text-error">
            <AlertCircle size={24} className="mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-bold text-sm">SQL Database Execution Error</h4>
              <p className="text-xs mt-1 leading-relaxed opacity-90 font-mono font-bold bg-white/20 dark:bg-black/20 p-3 rounded-lg mt-3">
                {errorMsg}
              </p>
            </div>
          </div>
        )}

        {/* Results layout view */}
        {!executing && results && (
          <div className="space-y-6 animate-slide-up">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0">
              <h3 className="text-lg font-bold text-text-primaryLight dark:text-text-primaryDark flex items-center space-x-2">
                <LayoutGrid size={18} className="text-primary-light" />
                <span>3. Query Output Results</span>
              </h3>
              <ExportMenu 
                columns={results.columns} 
                rows={results.rows} 
                filename={selectedDataset?.name ? selectedDataset.name.replace('.csv', '_results') : 'query_output'}
              />
            </div>

            {/* Run stats */}
            <StatisticsCard
              rowCount={results.rowCount}
              executionTime={results.executionTime}
            />

            {/* Main results table */}
            <Card className="p-6">
              <ResultsTable columns={results.columns} rows={results.rows} />
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};
export default QueryExecution;
