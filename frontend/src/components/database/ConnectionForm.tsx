import React, { useState } from 'react';
import { databaseService } from '../../services/database.service';
import type { DBConnectionData } from '../../services/database.service';
import { useToast } from '../../contexts/ToastContext';
import Input from '../common/Input';
import Button from '../common/Button';
import { ShieldCheck, AlertCircle } from 'lucide-react';

interface ConnectionFormProps {
  onSuccess: (newConn: any) => void;
}

export const ConnectionForm: React.FC<ConnectionFormProps> = ({ onSuccess }) => {
  const { addToast } = useToast();
  
  const [name, setName] = useState('');
  const [type, setType] = useState('postgresql');
  const [host, setHost] = useState('localhost');
  const [port, setPort] = useState(5432);
  const [databaseName, setDatabaseName] = useState('');
  const [username, setUsername] = useState('postgres');
  const [password, setPassword] = useState('');
  
  const [testing, setTesting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  const getFormData = (): DBConnectionData => ({
    name,
    type,
    host,
    port,
    databaseName,
    username,
    password,
  });

  const handleTest = async () => {
    if (!host || !databaseName || !username) {
      addToast('Please fill required Host, DB Name, and User fields', 'warning');
      return;
    }
    setTesting(true);
    setTestResult(null);
    try {
      const res = await databaseService.testConnection(getFormData());
      setTestResult({ success: true, message: res.message || 'Connection successful!' });
      addToast('Database connection tested successfully!', 'success');
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Connection failed. Verify host port/credentials.';
      setTestResult({ success: false, message: msg });
      addToast(msg, 'error');
    } finally {
      setTesting(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !host || !databaseName || !username) {
      addToast('Please fill in all required fields', 'warning');
      return;
    }
    setSaving(true);
    try {
      const newConn = await databaseService.createConnection(getFormData());
      addToast('Database connection saved successfully!', 'success');
      onSuccess(newConn);
      // Reset form
      setName('');
      setDatabaseName('');
      setPassword('');
      setTestResult(null);
    } catch (err: any) {
      addToast(err.response?.data?.message || 'Failed to save connection', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedType = e.target.value;
    setType(selectedType);
    setPort(selectedType === 'mysql' ? 3306 : 5432);
    if (selectedType === 'mysql' && username === 'postgres') {
      setUsername('root');
    } else if (selectedType === 'postgresql' && username === 'root') {
      setUsername('postgres');
    }
  };

  return (
    <form onSubmit={handleSave} className="space-y-5 text-left">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Input
          label="Connection Alias"
          placeholder="e.g. Sales DB Prod"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <div className="flex flex-col">
          <label className="text-sm font-semibold mb-2 text-text-primaryLight dark:text-text-primaryDark">
            Database Engine
          </label>
          <select
            value={type}
            onChange={handleTypeChange}
            className="h-[52px] px-[18px] rounded-input border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark text-text-primaryLight dark:text-text-primaryDark text-base outline-none focus:border-primary-light focus:ring-1 focus:ring-primary-light transition-all"
          >
            <option value="postgresql">PostgreSQL</option>
            <option value="mysql">MySQL</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="md:col-span-2">
          <Input
            label="Host Address"
            placeholder="localhost or dev.db.internal"
            value={host}
            onChange={(e) => setHost(e.target.value)}
            required
          />
        </div>
        <Input
          label="Port"
          type="number"
          placeholder="5432"
          value={port}
          onChange={(e) => setPort(parseInt(e.target.value) || 0)}
          required
        />
      </div>

      <Input
        label="Database Name"
        placeholder="e.g. analytics_warehouse"
        value={databaseName}
        onChange={(e) => setDatabaseName(e.target.value)}
        required
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Input
          label="Username"
          placeholder="postgres"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <Input
          label="Password"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>

      {testResult && (
        <div className={`flex items-start space-x-2 text-xs font-semibold p-3.5 rounded-xl border ${
          testResult.success
            ? 'bg-green-50 dark:bg-green-950/15 border-green-200 dark:border-green-800 text-success'
            : 'bg-red-50 dark:bg-red-950/15 border-red-200 dark:border-red-900/35 text-error'
        }`}>
          {testResult.success ? <ShieldCheck size={16} className="mt-0.5" /> : <AlertCircle size={16} className="mt-0.5" />}
          <span>{testResult.message}</span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row space-y-3.5 sm:space-y-0 sm:space-x-4 pt-2">
        <Button
          type="button"
          variant="outline"
          className="flex-1"
          onClick={handleTest}
          isLoading={testing}
        >
          Test Connection
        </Button>
        <Button
          type="submit"
          variant="primary"
          className="flex-1"
          isLoading={saving}
        >
          Save Connection
        </Button>
      </div>
    </form>
  );
};
export default ConnectionForm;
