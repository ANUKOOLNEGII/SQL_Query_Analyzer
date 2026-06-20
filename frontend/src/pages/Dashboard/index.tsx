import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../../hooks/redux';
import { setQueryHistory } from '../../store/historySlice';
import { setDatasets } from '../../store/datasetSlice';
import { historyService } from '../../services/history.service';
import { datasetService } from '../../services/dataset.service';
import { databaseService } from '../../services/database.service';
import Card from '../../components/common/Card';
import Loader from '../../components/common/Loader';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import QueryTrendChart from '../../components/charts/QueryTrendChart';
import UsageChart from '../../components/charts/UsageChart';
import { 
  Terminal, 
  Database, 
  FileSpreadsheet, 
  Save, 
  Clock, 
  ChevronRight, 
  PlusCircle, 
  Link2,
  Cpu
} from 'lucide-react';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { queryHistory } = useAppSelector((state) => state.history);
  const { user } = useAppSelector((state) => state.auth);

  const [dbCount, setDbCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const histData = await historyService.getHistory();
        dispatch(setQueryHistory(histData));

        const dsdData = await datasetService.getDatasets();
        dispatch(setDatasets(dsdData));

        const connData = await databaseService.getConnections();
        setDbCount(connData.length);
      } catch (err) {
        console.error('Failed to load dashboard statistics', err);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [dispatch]);

  if (loading) {
    return <Loader fullScreen text="Loading dashboard statistics..." />;
  }

  // Calculate statistics
  const totalQueries = queryHistory.length;
  const successfulQueries = queryHistory.filter(h => h.status === 'success').length;
  const savedQueriesCount = queryHistory.length; // all queries in history are currently saved in DB

  return (
    <div className="space-y-8 text-left animate-fade-in">
      {/* Welcome header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-text-primaryLight dark:text-text-primaryDark">
            Workspace Dashboard
          </h1>
          <p className="text-sm text-text-secondaryLight dark:text-text-secondaryDark mt-1">
            Welcome back, <span className="font-semibold text-text-primaryLight dark:text-text-primaryDark">{user?.name || 'Developer'}</span>. Here is your AI query activity overview.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Link to="/query-generator">
            <Button variant="primary" className="h-11 shadow-sm flex items-center space-x-2">
              <Terminal size={16} />
              <span>Query Workspace</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card hoverable className="flex items-center p-6 space-x-4">
          <div className="p-3 bg-teal-50 dark:bg-teal-900/10 text-primary-light dark:text-primary-dark rounded-xl">
            <Terminal size={24} />
          </div>
          <div>
            <div className="text-2xl font-bold text-text-primaryLight dark:text-text-primaryDark">{totalQueries}</div>
            <div className="text-xs text-text-secondaryLight dark:text-text-secondaryDark font-medium mt-0.5">Total AI Queries</div>
          </div>
        </Card>

        <Card hoverable className="flex items-center p-6 space-x-4">
          <div className="p-3 bg-green-50 dark:bg-green-900/10 text-success rounded-xl">
            <Cpu size={24} />
          </div>
          <div>
            <div className="text-2xl font-bold text-text-primaryLight dark:text-text-primaryDark">{successfulQueries}</div>
            <div className="text-xs text-text-secondaryLight dark:text-text-secondaryDark font-medium mt-0.5">Successful Executions</div>
          </div>
        </Card>

        <Card hoverable className="flex items-center p-6 space-x-4">
          <div className="p-3 bg-blue-50 dark:bg-blue-900/10 text-secondary-light dark:text-secondary-dark rounded-xl">
            <Database size={24} />
          </div>
          <div>
            <div className="text-2xl font-bold text-text-primaryLight dark:text-text-primaryDark">{dbCount}</div>
            <div className="text-xs text-text-secondaryLight dark:text-text-secondaryDark font-medium mt-0.5">Connected Hosts</div>
          </div>
        </Card>

        <Card hoverable className="flex items-center p-6 space-x-4">
          <div className="p-3 bg-purple-50 dark:bg-purple-900/10 text-accent-light dark:text-accent-dark rounded-xl">
            <Save size={24} />
          </div>
          <div>
            <div className="text-2xl font-bold text-text-primaryLight dark:text-text-primaryDark">{savedQueriesCount}</div>
            <div className="text-xs text-text-secondaryLight dark:text-text-secondaryDark font-medium mt-0.5">Saved Queries</div>
          </div>
        </Card>
      </div>

      {/* Charts section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 p-6 flex flex-col justify-between">
          <div className="mb-4">
            <h3 className="text-lg font-bold text-text-primaryLight dark:text-text-primaryDark">Query Creation Trends</h3>
            <p className="text-xs text-text-secondaryLight dark:text-text-secondaryDark mt-0.5">Daily volume of AI-generated queries</p>
          </div>
          <QueryTrendChart />
        </Card>

        <Card className="p-6 flex flex-col justify-between">
          <div className="mb-4">
            <h3 className="text-lg font-bold text-text-primaryLight dark:text-text-primaryDark">Command Distribution</h3>
            <p className="text-xs text-text-secondaryLight dark:text-text-secondaryDark mt-0.5">Breakdown by SQL operations type</p>
          </div>
          <UsageChart />
        </Card>
      </div>

      {/* Lower section: Recent Activity & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent queries */}
        <Card className="lg:col-span-2 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-text-primaryLight dark:text-text-primaryDark">Recent Query Activity</h3>
              <p className="text-xs text-text-secondaryLight dark:text-text-secondaryDark mt-0.5">History logs of recent actions</p>
            </div>
            <Link to="/query-history" className="text-xs font-bold text-primary-light dark:text-primary-dark hover:underline flex items-center space-x-1">
              <span>View all logs</span>
              <ChevronRight size={14} />
            </Link>
          </div>

          <div className="space-y-4">
            {queryHistory.length === 0 ? (
              <div className="py-12 text-center text-sm text-text-secondaryLight dark:text-text-secondaryDark">
                No queries executed yet. Open the workspace to get started.
              </div>
            ) : (
              queryHistory.slice(0, 4).map((q) => (
                <div 
                  key={q.id}
                  onClick={() => navigate(`/query-history`)}
                  className="flex items-start justify-between p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800/80 cursor-pointer transition-all duration-200"
                >
                  <div className="flex items-start space-x-3.5 text-left max-w-[70%]">
                    <div className="p-2 bg-white dark:bg-slate-800 rounded-lg text-slate-500 border border-slate-200 dark:border-slate-700 flex-shrink-0 mt-0.5">
                      <Clock size={16} />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-text-primaryLight dark:text-text-primaryDark truncate max-w-lg">
                        {q.naturalQuery}
                      </div>
                      <code className="text-xs font-mono text-primary-light dark:text-primary-dark block mt-1 truncate max-w-lg">
                        {q.generatedSQL}
                      </code>
                    </div>
                  </div>
                  <div className="text-right flex flex-col items-end space-y-1.5 flex-shrink-0">
                    <Badge variant={q.status === 'success' ? 'success' : 'error'}>
                      {q.status === 'success' ? 'Success' : 'Error'}
                    </Badge>
                    <span className="text-[10px] text-text-secondaryLight dark:text-text-secondaryDark font-medium">
                      {q.executionTime}ms
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Quick actions */}
        <Card className="p-6">
          <h3 className="text-lg font-bold text-text-primaryLight dark:text-text-primaryDark mb-6">Quick Shortcuts</h3>
          <div className="space-y-4">
            <Link 
              to="/upload-csv"
              className="flex items-center space-x-3.5 p-4 rounded-xl border border-border-light dark:border-border-dark hover:border-primary-light dark:hover:border-primary-dark hover:bg-teal-50/10 dark:hover:bg-teal-950/10 transition-all duration-200"
            >
              <div className="p-2 bg-teal-50 dark:bg-teal-950/40 text-primary-light rounded-lg">
                <PlusCircle size={18} />
              </div>
              <div className="text-left">
                <div className="text-sm font-bold text-text-primaryLight dark:text-text-primaryDark">Upload CSV file</div>
                <div className="text-xs text-text-secondaryLight dark:text-text-secondaryDark mt-0.5">Scaffold local tables</div>
              </div>
            </Link>

            <Link 
              to="/database-connection"
              className="flex items-center space-x-3.5 p-4 rounded-xl border border-border-light dark:border-border-dark hover:border-primary-light dark:hover:border-primary-dark hover:bg-teal-50/10 dark:hover:bg-teal-950/10 transition-all duration-200"
            >
              <div className="p-2 bg-blue-50 dark:bg-blue-950/40 text-secondary-light rounded-lg">
                <Link2 size={18} />
              </div>
              <div className="text-left">
                <div className="text-sm font-bold text-text-primaryLight dark:text-text-primaryDark">Add Connection</div>
                <div className="text-xs text-text-secondaryLight dark:text-text-secondaryDark mt-0.5">Link remote database hosts</div>
              </div>
            </Link>

            <Link 
              to="/datasets"
              className="flex items-center space-x-3.5 p-4 rounded-xl border border-border-light dark:border-border-dark hover:border-primary-light dark:hover:border-primary-dark hover:bg-teal-50/10 dark:hover:bg-teal-950/10 transition-all duration-200"
            >
              <div className="p-2 bg-purple-50 dark:bg-purple-950/40 text-accent-light rounded-lg">
                <FileSpreadsheet size={18} />
              </div>
              <div className="text-left">
                <div className="text-sm font-bold text-text-primaryLight dark:text-text-primaryDark">Dataset Manager</div>
                <div className="text-xs text-text-secondaryLight dark:text-text-secondaryDark mt-0.5">Manage existing files & schemas</div>
              </div>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
};
export default Dashboard;
