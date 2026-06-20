import React, { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { useToast } from '../../contexts/ToastContext';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { 
  Bell, 
  Sun, 
  Moon, 
  Cpu, 
  Download 
} from 'lucide-react';

export const Settings: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const { addToast } = useToast();
  
  const [activeTab, setActiveTab] = useState<'appearance' | 'notifications' | 'ai' | 'export'>('appearance');

  // Notification states
  const [notifySuccess, setNotifySuccess] = useState(true);
  const [notifyFailure, setNotifyFailure] = useState(true);
  const [emailDigest, setEmailDigest] = useState(false);

  // AI preference states
  const [aiProvider, setAiProvider] = useState('openai');
  const [maxTokens, setMaxTokens] = useState(1024);
  const [temperature, setTemperature] = useState(0.2);

  // Export formats
  const [defaultExportFormat, setDefaultExportFormat] = useState('csv');

  const handleSaveSettings = () => {
    // Save to localStorage or mock call
    localStorage.setItem('pref_ai_provider', aiProvider);
    localStorage.setItem('pref_export_format', defaultExportFormat);
    addToast('Preferences saved successfully!', 'success');
  };

  const tabs = [
    { id: 'appearance', label: 'Appearance', icon: <Sun size={18} /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell size={18} /> },
    { id: 'ai', label: 'AI Preferences', icon: <Cpu size={18} /> },
    { id: 'export', label: 'Export Defaults', icon: <Download size={18} /> },
  ];

  return (
    <div className="space-y-8 text-left animate-fade-in max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-text-primaryLight dark:text-text-primaryDark">
          Workspace Settings
        </h1>
        <p className="text-sm text-text-secondaryLight dark:text-text-secondaryDark mt-1">
          Customize query execution, AI thresholds, default exports, and user preferences.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 items-start">
        {/* Left: Tab list selectors */}
        <div className="space-y-1.5 flex flex-col">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-3 px-4 py-3.5 rounded-button text-sm font-semibold transition-all duration-150 text-left
                ${activeTab === tab.id
                  ? 'bg-primary-light/10 dark:bg-primary-dark/10 text-primary-light dark:text-primary-dark border-l-4 border-primary-light dark:border-primary-dark pl-3'
                  : 'text-text-secondaryLight dark:text-text-secondaryDark hover:bg-slate-50 dark:hover:bg-slate-800/40 hover:text-text-primaryLight'
                }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Right: Active Tab Form card */}
        <Card className="md:col-span-3 p-8 min-h-[350px]">
          {activeTab === 'appearance' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-text-primaryLight dark:text-text-primaryDark">Appearance settings</h3>
                <p className="text-xs text-text-secondaryLight dark:text-text-secondaryDark mt-0.5">Toggle interface themes and styling parameters.</p>
              </div>

              <div className="border-t border-border-light dark:border-border-dark pt-5 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-text-primaryLight dark:text-text-primaryDark">Dark Theme Mode</h4>
                  <p className="text-xs text-text-secondaryLight dark:text-text-secondaryDark mt-0.5">Switch workspace components to high contrast dark styling.</p>
                </div>
                <Button
                  variant="outline"
                  onClick={toggleTheme}
                  className="flex items-center space-x-2 border-border-light dark:border-border-dark"
                >
                  {theme === 'dark' ? <Moon size={16} /> : <Sun size={16} />}
                  <span>{theme === 'dark' ? 'Dark Mode' : 'Light Mode'}</span>
                </Button>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-text-primaryLight dark:text-text-primaryDark">Notifications</h3>
                <p className="text-xs text-text-secondaryLight dark:text-text-secondaryDark mt-0.5">Select triggers for email warnings and analytical digests.</p>
              </div>

              <div className="border-t border-border-light dark:border-border-dark pt-5 space-y-4">
                <label className="flex items-start space-x-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={notifySuccess}
                    onChange={(e) => setNotifySuccess(e.target.checked)}
                    className="mt-1 rounded border-border-light dark:border-border-dark text-primary-light focus:ring-primary-light h-4 w-4"
                  />
                  <div>
                    <span className="text-sm font-bold text-text-primaryLight dark:text-text-primaryDark">Query Executions logs</span>
                    <p className="text-xs text-text-secondaryLight dark:text-text-secondaryDark mt-0.5">Get visual alerts for successfully parsed database runs.</p>
                  </div>
                </label>

                <label className="flex items-start space-x-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={notifyFailure}
                    onChange={(e) => setNotifyFailure(e.target.checked)}
                    className="mt-1 rounded border-border-light dark:border-border-dark text-primary-light focus:ring-primary-light h-4 w-4"
                  />
                  <div>
                    <span className="text-sm font-bold text-text-primaryLight dark:text-text-primaryDark">API failures & Warning events</span>
                    <p className="text-xs text-text-secondaryLight dark:text-text-secondaryDark mt-0.5">Alert immediately upon database validation errors.</p>
                  </div>
                </label>

                <label className="flex items-start space-x-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={emailDigest}
                    onChange={(e) => setEmailDigest(e.target.checked)}
                    className="mt-1 rounded border-border-light dark:border-border-dark text-primary-light focus:ring-primary-light h-4 w-4"
                  />
                  <div>
                    <span className="text-sm font-bold text-text-primaryLight dark:text-text-primaryDark">Weekly Activity Digest</span>
                    <p className="text-xs text-text-secondaryLight dark:text-text-secondaryDark mt-0.5">Receive summary reports detailing executed SQL counts.</p>
                  </div>
                </label>
              </div>

              <div className="flex justify-end pt-4">
                <Button variant="primary" onClick={handleSaveSettings}>
                  Save Preferences
                </Button>
              </div>
            </div>
          )}

          {activeTab === 'ai' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-text-primaryLight dark:text-text-primaryDark">AI Preferences</h3>
                <p className="text-xs text-text-secondaryLight dark:text-text-secondaryDark mt-0.5">Tune OpenAI and Gemini fallback compiler parameters.</p>
              </div>

              <div className="border-t border-border-light dark:border-border-dark pt-5 space-y-5">
                <div className="flex flex-col text-left">
                  <label className="text-sm font-bold mb-2 text-text-primaryLight dark:text-text-primaryDark">Default AI LLM Provider</label>
                  <select
                    value={aiProvider}
                    onChange={(e) => setAiProvider(e.target.value)}
                    className="h-[52px] px-[18px] rounded-input border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark text-text-primaryLight dark:text-text-primaryDark text-base outline-none focus:border-primary-light transition-all"
                  >
                    <option value="openai">OpenAI GPT-4o (Primary)</option>
                    <option value="gemini">Google Gemini 1.5 Pro (Fallback)</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <Input
                    label="Temperature (Creativity)"
                    type="number"
                    step="0.1"
                    min="0"
                    max="1"
                    value={temperature}
                    onChange={(e) => setTemperature(parseFloat(e.target.value) || 0.2)}
                  />
                  <Input
                    label="Max Response Tokens"
                    type="number"
                    min="256"
                    max="4096"
                    value={maxTokens}
                    onChange={(e) => setMaxTokens(parseInt(e.target.value) || 1024)}
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <Button variant="primary" onClick={handleSaveSettings}>
                  Save Preferences
                </Button>
              </div>
            </div>
          )}

          {activeTab === 'export' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-text-primaryLight dark:text-text-primaryDark">Export Defaults</h3>
                <p className="text-xs text-text-secondaryLight dark:text-text-secondaryDark mt-0.5">Choose preferred layouts and formats for result spreadsheets.</p>
              </div>

              <div className="border-t border-border-light dark:border-border-dark pt-5 space-y-4">
                <div className="flex flex-col text-left">
                  <label className="text-sm font-bold mb-2 text-text-primaryLight dark:text-text-primaryDark">Default Output Download Format</label>
                  <select
                    value={defaultExportFormat}
                    onChange={(e) => setDefaultExportFormat(e.target.value)}
                    className="h-[52px] px-[18px] rounded-input border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark text-text-primaryLight dark:text-text-primaryDark text-base outline-none focus:border-primary-light transition-all"
                  >
                    <option value="csv">Comma Separated Values (.csv)</option>
                    <option value="excel">Microsoft Excel Worksheet (.xls)</option>
                    <option value="pdf">Structured ASCII PDF Report (.txt)</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <Button variant="primary" onClick={handleSaveSettings}>
                  Save Preferences
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};
export default Settings;
