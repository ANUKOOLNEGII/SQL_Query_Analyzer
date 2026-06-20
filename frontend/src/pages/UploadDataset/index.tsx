import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../../hooks/redux';
import { addDataset, setSelectedDataset } from '../../store/datasetSlice';
import { datasetService } from '../../services/dataset.service';
import { useToast } from '../../contexts/ToastContext';
import UploadZone from '../../components/dataset/UploadZone';
import Card from '../../components/common/Card';
import { FileSpreadsheet } from 'lucide-react';

export const UploadDataset: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { addToast } = useToast();

  const handleUploadSuccess = async (file: File) => {
    try {
      const newDs = await datasetService.uploadDataset(file);
      dispatch(addDataset(newDs));
      dispatch(setSelectedDataset(newDs)); // Auto select uploaded
      addToast(`Dataset "${file.name}" uploaded and parsed successfully!`, 'success');
      navigate('/datasets');
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to process file';
      addToast(msg, 'error');
      throw new Error(msg);
    }
  };

  return (
    <div className="space-y-8 text-left animate-fade-in max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-text-primaryLight dark:text-text-primaryDark">
          Upload CSV Dataset
        </h1>
        <p className="text-sm text-text-secondaryLight dark:text-text-secondaryDark mt-1">
          Upload spreadsheets to map database schemas, query tables, and extract analytical summaries.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Upload Action */}
        <Card className="md:col-span-2 p-8">
          <UploadZone onUploadSuccess={handleUploadSuccess} />
        </Card>

        {/* Formatting Info panel */}
        <Card className="p-8 flex flex-col space-y-4">
          <div className="p-3 bg-teal-50 dark:bg-teal-900/10 text-primary-light rounded-xl w-max">
            <FileSpreadsheet size={24} />
          </div>
          <h4 className="text-base font-bold text-text-primaryLight dark:text-text-primaryDark">
            Formatting Guidelines
          </h4>
          <ul className="text-xs text-text-secondaryLight dark:text-text-secondaryDark space-y-2.5 list-disc pl-4 leading-relaxed">
            <li>File must be in standard comma-separated **CSV** format.</li>
            <li>First row of the sheet must contain **column headers**.</li>
            <li>Keep file sizes under **10MB** for optimized browser querying.</li>
            <li>Ensure columns contain clean dates and values without emojis.</li>
          </ul>
        </Card>
      </div>
    </div>
  );
};
export default UploadDataset;
