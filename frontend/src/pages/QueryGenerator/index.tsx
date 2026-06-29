import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../../hooks/redux';
import { 
  setNaturalQuery, 
  setGeneratedSQL, 
  setSuggestions, 
  setExplanation, 
  setValidation,
  clearQueryState
} from '../../store/querySlice';
import { setSelectedDataset, setSchema } from '../../store/datasetSlice';
import { queryService } from '../../services/query.service';
import { datasetService } from '../../services/dataset.service';
import { databaseService } from '../../services/database.service';
import type { Dataset } from '../../store/datasetSlice';
import { useToast } from '../../contexts/ToastContext';
import QueryInput from '../../components/query/QueryInput';
import SQLViewer from '../../components/query/SQLViewer';
import QuerySuggestions from '../../components/query/QuerySuggestions';
import ValidationPanel from '../../components/query/ValidationPanel';
import QueryExplanation from '../../components/query/QueryExplanation';
import ExecuteButton from '../../components/query/ExecuteButton';
import SchemaPanel from '../../components/query/SchemaPanel';
import Loader from '../../components/common/Loader';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { Database, Sparkles, Terminal, AlertTriangle } from 'lucide-react';

export const QueryGenerator: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { addToast } = useToast();
  
  const { naturalQuery, generatedSQL, suggestions, explanation, validation } = useAppSelector((state) => state.query);
  const { datasets, selectedDataset } = useAppSelector((state) => state.dataset);

  const [inputVal, setInputVal] = useState(naturalQuery);
  const [generating, setGenerating] = useState(false);
  const [loadingDatasets, setLoadingDatasets] = useState(true);
  const [availableSources, setAvailableSources] = useState<Dataset[]>([]);

  useEffect(() => {
    const loadSources = async () => {
      try {
        const [datasetsData, connectionsData] = await Promise.all([
          datasetService.getDatasets(),
          databaseService.getConnections().catch(() => [])
        ]);

        const mappedConnections = connectionsData.map((conn: any) => ({
          id: conn.id,
          name: `db://${conn.name}`,
          rowCount: 0,
          columnCount: 0,
          createdAt: conn.createdAt || new Date().toISOString(),
          status: 'available' as const,
          columns: []
        }));

        const combined = [...datasetsData, ...mappedConnections];
        setAvailableSources(combined);

        if (combined.length > 0 && !selectedDataset) {
          dispatch(setSelectedDataset(combined[0]));
          if (combined[0].name.startsWith('db://')) {
            try {
              const schemaData = await databaseService.getSchema(combined[0].id);
              dispatch(setSchema(schemaData));
            } catch (err) {
              console.error('Failed to load initial db schema');
            }
          } else {
            dispatch(setSchema(null));
          }
        }
      } catch (err) {
        addToast('Failed to load data sources', 'error');
      } finally {
        setLoadingDatasets(false);
      }
    };

    loadSources();
  }, [dispatch]);

  // Synchronize input value with redux state changes (e.g. from suggestions click)
  useEffect(() => {
    setInputVal(naturalQuery);
  }, [naturalQuery]);

  const handleGenerate = async () => {
    if (!inputVal.trim()) return;
    if (!selectedDataset) {
      addToast('Please select a dataset or database connection first', 'warning');
      return;
    }

    setGenerating(true);
    // Clear previous generated SQL to reset visual states
    dispatch(setGeneratedSQL(''));
    dispatch(setExplanation(''));
    dispatch(setValidation({ isValid: false, errors: [] }));

    try {
      const isDb = selectedDataset.name.startsWith('db://');
      const res = await queryService.generateQuery({
        query: inputVal,
        datasetId: isDb ? undefined : selectedDataset.id,
        connectionId: isDb ? selectedDataset.id : undefined,
      });

      dispatch(setNaturalQuery(inputVal));
      dispatch(setGeneratedSQL(res.sql));
      dispatch(setExplanation(res.explanation));
      dispatch(setSuggestions(res.suggestions));
      dispatch(setValidation(res.validation));
      addToast('SQL Query generated successfully!', 'success');
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to generate query. Please try again.';
      addToast(msg, 'error');
    } finally {
      setGenerating(false);
    }
  };

  const handleSQLChange = (newSql: string) => {
    dispatch(setGeneratedSQL(newSql));
  };

  const handleSuggestionSelect = (sug: string) => {
    dispatch(setNaturalQuery(sug));
    setInputVal(sug);
  };

  const handleExecuteNavigate = () => {
    if (!generatedSQL) return;
    navigate('/query-execution');
  };

  const handleSourceSelect = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    const found = availableSources.find(d => d.id === val);
    if (found) {
      dispatch(setSelectedDataset(found));
      dispatch(clearQueryState());
      setInputVal('');
      
      if (found.name.startsWith('db://')) {
        try {
          const schemaData = await databaseService.getSchema(found.id);
          dispatch(setSchema(schemaData));
        } catch (err) {
          addToast('Failed to load database schema', 'error');
        }
      } else {
        dispatch(setSchema(null));
      }
    }
  };

  if (loadingDatasets) {
    return <Loader fullScreen text="Initializing query workspace..." />;
  }

  return (
    <div className="space-y-8 text-left animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-text-primaryLight dark:text-text-primaryDark flex items-center space-x-2">
            <Sparkles className="text-primary-light" size={28} />
            <span>Query Workspace</span>
          </h1>
          <p className="text-sm text-text-secondaryLight dark:text-text-secondaryDark mt-1">
            Build optimized SQL queries using plain English instructions. Validate and execute against your schema.
          </p>
        </div>

        {/* Source Selector */}
        <div className="flex items-center space-x-3.5 bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark p-2 rounded-button shadow-sm">
          <Database size={16} className="text-slate-400 ml-2" />
          <select
            value={selectedDataset?.id || ''}
            onChange={handleSourceSelect}
            className="bg-transparent border-none text-sm font-bold text-text-primaryLight dark:text-text-primaryDark outline-none focus:ring-0 cursor-pointer pr-8"
          >
            {availableSources.length === 0 ? (
              <option value="">No Active Schema</option>
            ) : (
              availableSources.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name.substring(0, 30)}
                </option>
              ))
            )}
          </select>
        </div>
      </div>

      {availableSources.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 py-20 border border-dashed border-border-light dark:border-border-dark rounded-card bg-surface-light/40 dark:bg-surface-dark/40 text-center">
          <AlertTriangle size={48} className="text-warning mb-6" />
          <h3 className="text-lg font-bold text-text-primaryLight dark:text-text-primaryDark mb-2">No Active Data Schemas</h3>
          <p className="text-sm text-text-secondaryLight dark:text-text-secondaryDark max-w-md mb-8">
            You must upload a CSV file or configure database credentials before generating queries.
          </p>
          <div className="flex space-x-4">
            <Button variant="primary" onClick={() => navigate('/upload-csv')}>Upload CSV</Button>
            <Button variant="outline" onClick={() => navigate('/database-connection')}>Connect Database</Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
          {/* Main prompt + output dashboard (3/4 width) */}
          <div className="lg:col-span-3 space-y-6">
            <Card className="p-7">
              <h3 className="text-lg font-bold text-text-primaryLight dark:text-text-primaryDark mb-4 flex items-center space-x-2">
                <Terminal size={18} className="text-primary-light" />
                <span>1. Ask Your Question</span>
              </h3>
              <QueryInput
                value={inputVal}
                onChange={setInputVal}
                onSubmit={handleGenerate}
                isLoading={generating}
              />
            </Card>

            {generating && (
              <Card className="p-8 text-center">
                <Loader text="AI Engine compiling prompt against schemas..." />
              </Card>
            )}

            {/* AI Generated blocks */}
            {!generating && generatedSQL && (
              <div className="space-y-6 animate-slide-up">
                {/* Generated SQL block */}
                <Card className="p-7">
                  <h3 className="text-lg font-bold text-text-primaryLight dark:text-text-primaryDark mb-4 flex items-center space-x-2">
                    <Sparkles size={18} className="text-teal-500" />
                    <span>2. Compiled SQL Query</span>
                  </h3>
                  <div className="space-y-4">
                    <SQLViewer sql={generatedSQL} onSQLChange={handleSQLChange} />
                    {validation && <ValidationPanel validation={validation} />}
                    <ExecuteButton
                      onExecute={handleExecuteNavigate}
                      isLoading={false}
                      disabled={!validation?.isValid}
                    />
                  </div>
                </Card>

                {/* Explanation and suggestions */}
                <QueryExplanation explanation={explanation} />
                <QuerySuggestions suggestions={suggestions} onSelect={handleSuggestionSelect} />
              </div>
            )}
          </div>

          {/* Sidebar Schema panel (1/4 width) */}
          <div className="space-y-6">
            <Card className="p-6">
              <SchemaPanel dataset={selectedDataset} />
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};
export default QueryGenerator;
