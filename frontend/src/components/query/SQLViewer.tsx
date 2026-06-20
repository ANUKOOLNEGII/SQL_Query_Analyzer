import React, { useState } from 'react';
import { useToast } from '../../contexts/ToastContext';
import Button from '../common/Button';
import { Copy, Download, Edit2, Check } from 'lucide-react';

interface SQLViewerProps {
  sql: string;
  onSQLChange: (newSql: string) => void;
}

export const SQLViewer: React.FC<SQLViewerProps> = ({ sql, onSQLChange }) => {
  const { addToast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(sql);
      setCopied(true);
      addToast('SQL Query copied to clipboard!', 'success');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      addToast('Failed to copy text', 'error');
    }
  };

  const handleDownload = () => {
    const blob = new Blob([sql], { type: 'text/plain;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `query_${Date.now()}.sql`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast('SQL Query file downloaded!', 'success');
  };

  // Simple Regex-based SQL syntax highlighter
  const highlightSQL = (text: string) => {
    if (!text) return '';
    const keywords = [
      'SELECT', 'FROM', 'WHERE', 'AND', 'OR', 'JOIN', 'ON', 'GROUP BY', 
      'ORDER BY', 'DESC', 'ASC', 'LIMIT', 'SUM', 'AVG', 'COUNT', 
      'MAX', 'MIN', 'AS', 'IN', 'ON', 'HAVING'
    ];

    let highlighted = text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    // Highlight strings
    highlighted = highlighted.replace(/(['"])(.*?)\1/g, '<span class="text-amber-400">$&</span>');

    // Highlight keywords
    keywords.forEach((keyword) => {
      const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
      highlighted = highlighted.replace(regex, (match) => `<span class="text-teal-400 font-bold">${match.toUpperCase()}</span>`);
    });

    // Highlight comments
    highlighted = highlighted.replace(/(--.*?$)/gm, '<span class="text-slate-500 italic">$&</span>');

    return highlighted;
  };

  return (
    <div className="w-full text-left bg-slate-950 rounded-card border border-slate-900 shadow-lg overflow-hidden flex flex-col min-h-[220px]">
      {/* Header bar */}
      <div className="flex items-center justify-between px-6 py-4.5 bg-slate-900 border-b border-slate-950">
        <span className="text-xs font-bold text-slate-400 font-mono">SQL Console</span>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            className="h-8.5 rounded-lg border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 text-xs flex items-center space-x-1"
            onClick={() => setIsEditing(!isEditing)}
          >
            <Edit2 size={13} />
            <span>{isEditing ? 'Preview' : 'Edit'}</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="h-8.5 w-8.5 p-0 rounded-lg border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800"
            onClick={handleCopy}
            title="Copy SQL"
          >
            {copied ? <Check size={14} className="text-success" /> : <Copy size={14} />}
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="h-8.5 w-8.5 p-0 rounded-lg border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800"
            onClick={handleDownload}
            title="Download SQL File"
          >
            <Download size={14} />
          </Button>
        </div>
      </div>

      {/* Editor/Viewer Panel */}
      <div className="flex-1 flex flex-col relative font-mono text-sm leading-relaxed p-6">
        {isEditing ? (
          <textarea
            value={sql}
            onChange={(e) => onSQLChange(e.target.value)}
            className="w-full h-40 bg-transparent text-emerald-400 border-none outline-none resize-none focus:ring-0 font-mono p-0"
            placeholder="-- Edit SQL code block here..."
          />
        ) : (
          <pre
            className="w-full overflow-x-auto text-emerald-400 p-0 m-0"
            dangerouslySetInnerHTML={{ __html: highlightSQL(sql) || '-- No SQL generated yet' }}
          />
        )}
      </div>
    </div>
  );
};
export default SQLViewer;
