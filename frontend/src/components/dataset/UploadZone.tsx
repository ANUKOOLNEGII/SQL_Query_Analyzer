import React, { useState, useRef } from 'react';
import { Upload, File, AlertCircle } from 'lucide-react';
import Button from '../common/Button';

interface UploadZoneProps {
  onUploadSuccess: (file: File) => Promise<void>;
}

export const UploadZone: React.FC<UploadZoneProps> = ({ onUploadSuccess }) => {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const validateFile = (selectedFile: File) => {
    const isCSV = selectedFile.name.endsWith('.csv') || selectedFile.type === 'text/csv';
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (!isCSV) {
      setError('Invalid file type. Please upload a standard CSV file.');
      return false;
    }
    if (selectedFile.size > maxSize) {
      setError('File size too large. Maximum supported size is 10MB.');
      return false;
    }
    if (selectedFile.size === 0) {
      setError('File is empty. Please select a valid CSV file.');
      return false;
    }

    setError('');
    return true;
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (validateFile(droppedFile)) {
        setFile(droppedFile);
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (validateFile(selectedFile)) {
        setFile(selectedFile);
      }
    }
  };

  const onButtonClick = () => {
    inputRef.current?.click();
  };

  const handleUploadSubmit = async () => {
    if (!file) return;
    setIsUploading(true);
    try {
      await onUploadSuccess(file);
      setFile(null);
    } catch (err: any) {
      setError(err.message || 'File upload failed. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="w-full text-center">
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        accept=".csv"
        onChange={handleFileChange}
      />
      
      {/* Drop zone container */}
      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-card p-10 flex flex-col items-center justify-center min-h-[250px] transition-all duration-300
          ${dragActive 
            ? 'border-primary-light bg-teal-50/5 dark:bg-teal-950/5 scale-98' 
            : 'border-border-light dark:border-border-dark bg-surface-light/50 dark:bg-surface-dark/50'
          }`}
      >
        {!file ? (
          <>
            <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-full mb-4 text-slate-500 dark:text-slate-400">
              <Upload size={32} />
            </div>
            <p className="text-sm font-bold text-text-primaryLight dark:text-text-primaryDark mb-1">
              Drag & Drop your CSV file here
            </p>
            <p className="text-xs text-text-secondaryLight dark:text-text-secondaryDark mb-4">
              Supports standard commas format, max 10MB
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onButtonClick}
            >
              Browse Files
            </Button>
          </>
        ) : (
          <div className="space-y-6 w-full max-w-md">
            <div className="flex items-center space-x-3.5 p-4 bg-slate-100 dark:bg-slate-800 rounded-xl text-left border border-slate-200 dark:border-slate-700">
              <File className="text-primary-light dark:text-primary-dark h-8 w-8 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-text-primaryLight dark:text-text-primaryDark truncate">
                  {file.name}
                </p>
                <p className="text-xs text-text-secondaryLight dark:text-text-secondaryDark">
                  {(file.size / 1024).toFixed(1)} KB
                </p>
              </div>
              <button
                onClick={() => setFile(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs font-bold"
                disabled={isUploading}
              >
                Clear
              </button>
            </div>

            <Button
              type="button"
              variant="primary"
              className="w-full flex items-center justify-center space-x-2"
              onClick={handleUploadSubmit}
              isLoading={isUploading}
            >
              <span>Process Dataset</span>
            </Button>
          </div>
        )}
      </div>

      {error && (
        <div className="flex items-center space-x-2 text-error text-xs font-semibold mt-4 justify-center bg-red-50 dark:bg-red-950/15 p-3 rounded-lg border border-red-200 dark:border-red-900/35">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};
export default UploadZone;
