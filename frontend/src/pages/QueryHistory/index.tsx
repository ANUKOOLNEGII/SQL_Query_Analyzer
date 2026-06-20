import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../../hooks/redux';
import { setQueryHistory, removeHistoryItem } from '../../store/historySlice';
import { setNaturalQuery, setGeneratedSQL, setExplanation, setValidation } from '../../store/querySlice';
import { historyService } from '../../services/history.service';
import { exportService } from '../../services/export.service';
import { useToast } from '../../contexts/ToastContext';
import Loader from '../../components/common/Loader';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import EmptyState from '../../components/common/EmptyState';
import { Calendar, Terminal, Trash2, ArrowUpRight, Search, FileDown } from 'lucide-react';
import Input from '../../components/common/Input';

export const QueryHistory: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { addToast } = useToast();
  const { queryHistory } = useAppSelector((state) => state.history);

  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const data = await historyService.getHistory();
        dispatch(setQueryHistory(data));
      } catch (err) {
        addToast('Failed to load query logs', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [dispatch]);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this history log?')) return;
    try {
      await historyService.deleteHistoryItem(id);
      dispatch(removeHistoryItem(id));
      addToast('History record deleted successfully', 'success');
    } catch (err) {
      addToast('Failed to delete history record', 'error');
    }
  };

  const handleReuse = (item: any, e: React.MouseEvent) => {
    e.stopPropagation();
    dispatch(setNaturalQuery(item.naturalQuery));
    dispatch(setGeneratedSQL(item.generatedSQL));
    dispatch(setExplanation(item.explanation));
    dispatch(setValidation({ isValid: true, errors: [] }));
    addToast('Loaded query into workspace', 'success');
    navigate('/query-generator');
  };

  const handleExportCSV = (e: React.MouseEvent) => {
    e.preventDefault();
    if (queryHistory.length === 0) return;
    const cols = ['id', 'createdAt', 'naturalQuery', 'generatedSQL', 'status', 'executionTime'];
    exportService.exportToCSV('query_history_report', cols, queryHistory);
    addToast('Query history log exported!', 'success');
  };

  const filteredHistory = queryHistory.filter((item) =>
    item.naturalQuery.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.generatedSQL.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <Loader fullScreen text="Retrieving history logs..." />;
  }

  return (
    <div className="space-y-8 text-left animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-text-primaryLight dark:text-text-primaryDark">
            Query History
          </h1>
          <p className="text-sm text-text-secondaryLight dark:text-text-secondaryDark mt-1">
            Chronological audit log of all natural language prompts and corresponding SQL compilations.
          </p>
        </div>
        {queryHistory.length > 0 && (
          <Button variant="outline" size="sm" onClick={handleExportCSV} className="h-11 flex items-center space-x-2 border-border-light dark:border-border-dark">
            <FileDown size={16} />
            <span>Export CSV</span>
          </Button>
        )}
      </div>

      {queryHistory.length === 0 ? (
        <EmptyState
          type="history"
          title="No Queries Logged Yet"
          description="Ask questions in the generator workspace, and they will appear in this audit log."
          actionLabel="Query Workspace"
          onActionClick={() => navigate('/query-generator')}
        />
      ) : (
        <div className="space-y-5">
          {/* Search bar */}
          <div className="flex items-center max-w-sm relative">
            <Input
              placeholder="Search history..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-[44px] pl-10"
            />
            <Search size={16} className="absolute left-3.5 top-[14px] text-slate-400 pointer-events-none" />
          </div>

          {/* History Accordion/Listing Grid */}
          <div className="space-y-4">
            {filteredHistory.length === 0 ? (
              <div className="py-12 text-center text-sm text-text-secondaryLight dark:text-text-secondaryDark">
                No matching queries found in history logs.
              </div>
            ) : (
              filteredHistory.map((item) => (
                <div
                  key={item.id}
                  onClick={() => navigate(`/query-history/${item.id}`)}
                  className="p-6 bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-card shadow-card hover:shadow-hover hover:-translate-y-0.5 transition-all duration-200 cursor-pointer flex flex-col md:flex-row md:items-start justify-between space-y-4 md:space-y-0 text-left"
                >
                  <div className="space-y-3.5 max-w-[75%]">
                    {/* Timestamp & Type tags */}
                    <div className="flex items-center space-x-3 text-xs text-text-secondaryLight dark:text-text-secondaryDark font-semibold">
                      <span className="flex items-center space-x-1.5">
                        <Calendar size={13} />
                        <span>{new Date(item.createdAt).toLocaleString()}</span>
                      </span>
                      <span>•</span>
                      <span className="flex items-center space-x-1">
                        <Terminal size={12} />
                        <span>SQL Genius</span>
                      </span>
                    </div>

                    <h4 className="text-base font-bold text-text-primaryLight dark:text-text-primaryDark leading-snug">
                      "{item.naturalQuery}"
                    </h4>

                    <pre className="p-3.5 bg-slate-950 text-emerald-400 font-mono text-xs rounded-xl overflow-x-auto border border-slate-900 leading-relaxed shadow-inner">
                      {item.generatedSQL}
                    </pre>
                  </div>

                  <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-start space-y-0 md:space-y-4 flex-shrink-0">
                    <div className="text-left md:text-right">
                      <Badge variant={item.status === 'success' ? 'success' : 'error'}>
                        {item.status === 'success' ? 'Success' : 'Failed'}
                      </Badge>
                      <span className="text-[10px] text-text-secondaryLight dark:text-text-secondaryDark font-medium block mt-1">
                        Execution: {item.executionTime}ms
                      </span>
                    </div>

                    <div className="flex space-x-2.5">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8.5 rounded-lg text-xs"
                        onClick={(e) => handleReuse(item, e)}
                      >
                        <span className="flex items-center space-x-1">
                          <ArrowUpRight size={13} />
                          <span>Reuse</span>
                        </span>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8.5 w-8.5 p-0 rounded-lg border-red-200 dark:border-red-900/40 text-error hover:bg-red-50 dark:hover:bg-red-950/20"
                        onClick={(e) => handleDelete(item.id, e)}
                        title="Delete log"
                      >
                        <Trash2 size={13} />
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
export default QueryHistory;
