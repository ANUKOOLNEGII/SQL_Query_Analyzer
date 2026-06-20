import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../../hooks/redux';
import { setDatasets, setSelectedDataset, removeDataset } from '../../store/datasetSlice';
import { datasetService } from '../../services/dataset.service';
import { useToast } from '../../contexts/ToastContext';
import DatasetTable from '../../components/dataset/DatasetTable';
import DatasetPreview from '../../components/dataset/DatasetPreview';
import EmptyState from '../../components/common/EmptyState';
import Loader from '../../components/common/Loader';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { PlusCircle, Database } from 'lucide-react';

export const DatasetManager: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { addToast } = useToast();
  const { datasets, selectedDataset } = useAppSelector((state) => state.dataset);
  
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDatasets = async () => {
      try {
        const data = await datasetService.getDatasets();
        dispatch(setDatasets(data));
        // Auto select first dataset if none selected
        if (data.length > 0 && !selectedDataset) {
          dispatch(setSelectedDataset(data[0]));
        }
      } catch (err) {
        addToast('Failed to load datasets', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchDatasets();
  }, [dispatch]);

  const handleSelect = (ds: any) => {
    dispatch(setSelectedDataset(ds));
    addToast(`Selected "${ds.name}" as active workspace dataset`, 'info');
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this dataset? All history referencing it will remain but queries cannot be run.')) return;
    try {
      await datasetService.deleteDataset(id);
      dispatch(removeDataset(id));
      addToast('Dataset deleted successfully', 'success');
    } catch (err) {
      addToast('Failed to delete dataset', 'error');
    }
  };

  if (loading) {
    return <Loader fullScreen text="Loading datasets..." />;
  }

  return (
    <div className="space-y-8 text-left animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-text-primaryLight dark:text-text-primaryDark">
            Dataset Manager
          </h1>
          <p className="text-sm text-text-secondaryLight dark:text-text-secondaryDark mt-1">
            Choose the active dataset to query or inspect metadata attributes and schema types.
          </p>
        </div>
        <Link to="/upload-csv">
          <Button variant="primary" className="h-11 shadow-sm flex items-center space-x-2">
            <PlusCircle size={16} />
            <span>Upload CSV</span>
          </Button>
        </Link>
      </div>

      {datasets.length === 0 ? (
        <EmptyState
          type="dataset"
          title="No Datasets Uploaded"
          description="Upload a CSV file to map column schemas and execute English instructions."
          actionLabel="Upload CSV File"
          onActionClick={() => navigate('/upload-csv')}
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Table Container (2/3 width) */}
          <div className="lg:col-span-2 space-y-6">
            <DatasetTable
              datasets={datasets}
              selectedDataset={selectedDataset}
              onSelect={handleSelect}
              onDelete={handleDelete}
            />
          </div>

          {/* Details Preview Sidebar (1/3 width) */}
          <div className="space-y-6">
            {selectedDataset ? (
              <Card className="p-6 border-l-4 border-l-primary-light">
                <div className="flex items-center space-x-2 pb-4 mb-4 border-b border-border-light dark:border-border-dark">
                  <Database className="text-primary-light" size={20} />
                  <h3 className="text-lg font-bold text-text-primaryLight dark:text-text-primaryDark truncate">
                    {selectedDataset.name}
                  </h3>
                </div>
                <DatasetPreview dataset={selectedDataset} />
              </Card>
            ) : (
              <Card className="p-6 text-center text-sm text-text-secondaryLight dark:text-text-secondaryDark">
                Please select a dataset to inspect its schema.
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
export default DatasetManager;
