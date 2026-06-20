import React, { createContext, useContext, useState, useCallback } from 'react';
import { X, CheckCircle, AlertTriangle, XCircle, Info } from 'lucide-react';

export type ToastType = 'success' | 'warning' | 'error' | 'info';

export interface ToastMessage {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

interface ToastContextType {
  toasts: ToastMessage[];
  addToast: (message: string, type?: ToastType, duration?: number) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((message: string, type: ToastType = 'info', duration = 4000) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, message, duration }]);
    
    setTimeout(() => {
      removeToast(id);
    }, duration);
  }, [removeToast]);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      {/* Toast Render Panel */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col space-y-3 max-w-sm w-full">
        {toasts.map((toast) => (
          <ToastCard key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within a ToastProvider');
  return context;
};

// Toast Card Render Component
const ToastCard: React.FC<{ toast: ToastMessage; onClose: () => void }> = ({ toast, onClose }) => {
  const icons = {
    success: <CheckCircle className="text-success h-5 w-5 flex-shrink-0" />,
    warning: <AlertTriangle className="text-warning h-5 w-5 flex-shrink-0" />,
    error: <XCircle className="text-error h-5 w-5 flex-shrink-0" />,
    info: <Info className="text-secondary-light dark:text-secondary-dark h-5 w-5 flex-shrink-0" />,
  };

  const bgStyles = {
    success: 'border-l-success bg-white dark:bg-slate-900 border-l-4 shadow-md',
    warning: 'border-l-warning bg-white dark:bg-slate-900 border-l-4 shadow-md',
    error: 'border-l-error bg-white dark:bg-slate-900 border-l-4 shadow-md',
    info: 'border-l-secondary-light dark:border-l-secondary-dark bg-white dark:bg-slate-900 border-l-4 shadow-md',
  };

  return (
    <div
      className={`flex items-start p-4 rounded-lg border border-slate-100 dark:border-slate-800 ${bgStyles[toast.type]} transition-all duration-300 animate-slide-in`}
    >
      <div className="mr-3">{icons[toast.type]}</div>
      <div className="flex-1 text-sm font-medium text-text-primaryLight dark:text-text-primaryDark text-left">
        {toast.message}
      </div>
      <button
        onClick={onClose}
        className="ml-4 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-400 focus:outline-none"
      >
        <X size={16} />
      </button>
    </div>
  );
};
