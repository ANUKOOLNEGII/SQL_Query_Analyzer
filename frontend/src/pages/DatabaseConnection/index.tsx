import React, { useEffect, useState } from 'react';
import { databaseService } from '../../services/database.service';
import { useToast } from '../../contexts/ToastContext';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { setSelectedDataset, setSchema } from '../../store/datasetSlice';
import ConnectionForm from '../../components/database/ConnectionForm';
import ConnectionCard from '../../components/database/ConnectionCard';
import SchemaViewer from '../../components/database/SchemaViewer';
import Loader from '../../components/common/Loader';
import Card from '../../components/common/Card';
import { Link2, LayoutGrid } from 'lucide-react';

export const DatabaseConnection: React.FC = () => {
  const { addToast } = useToast();
  const dispatch = useAppDispatch();
  const { schema } = useAppSelector((state) => state.dataset);

  const [connections, setConnections] = useState<any[]>([]);
  const [selectedConnId, setSelectedConnId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const loadConnections = async () => {
    try {
      const data = await databaseService.getConnections();
      setConnections(data);
      if (data.length > 0 && !selectedConnId) {
        handleSelectConnection(data[0]);
      }
    } catch (err) {
      addToast('Failed to load database connections', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConnections();
  }, []);

  const handleSelectConnection = (conn: any) => {
    setSelectedConnId(conn.id);
    
    // Simulate mapping connection to dataset context
    const datasetRepresentation = {
      id: conn.id,
      name: `db://${conn.name}`,
      rowCount: 10000, // mock default
      columnCount: 15,
      createdAt: conn.createdAt,
      status: 'available' as const,
      columns: []
    };
    dispatch(setSelectedDataset(datasetRepresentation));

    // Inject mock schema for visualization
    const mockSchema = {
      tables: [
        {
          name: 'users',
          columns: [
            { name: 'id', type: 'UUID', isPrimaryKey: true, isForeignKey: false, isNullable: false },
            { name: 'name', type: 'VARCHAR(100)', isPrimaryKey: false, isForeignKey: false, isNullable: false },
            { name: 'email', type: 'VARCHAR(255)', isPrimaryKey: false, isForeignKey: false, isNullable: false },
            { name: 'password_hash', type: 'TEXT', isPrimaryKey: false, isForeignKey: false, isNullable: false },
            { name: 'created_at', type: 'TIMESTAMP', isPrimaryKey: false, isForeignKey: false, isNullable: false }
          ]
        },
        {
          name: 'query_history',
          columns: [
            { name: 'id', type: 'UUID', isPrimaryKey: true, isForeignKey: false, isNullable: false },
            { name: 'user_id', type: 'UUID', isPrimaryKey: false, isForeignKey: true, isNullable: false },
            { name: 'natural_query', type: 'TEXT', isPrimaryKey: false, isForeignKey: false, isNullable: false },
            { name: 'generated_sql', type: 'TEXT', isPrimaryKey: false, isForeignKey: false, isNullable: false },
            { name: 'execution_time', type: 'INTEGER', isPrimaryKey: false, isForeignKey: false, isNullable: true }
          ]
        }
      ]
    };
    dispatch(setSchema(mockSchema));
    addToast(`Selected "${conn.name}" connection`, 'info');
  };

  const handleNewConnectionSuccess = (newConn: any) => {
    setConnections((prev) => [...prev, newConn]);
    handleSelectConnection(newConn);
  };

  if (loading) {
    return <Loader fullScreen text="Loading connections..." />;
  }

  const activeConnection = connections.find((c) => c.id === selectedConnId);

  return (
    <div className="space-y-8 text-left animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-text-primaryLight dark:text-text-primaryDark">
          Database Connection
        </h1>
        <p className="text-sm text-text-secondaryLight dark:text-text-secondaryDark mt-1">
          Link remote Postgres or MySQL databases to automatically inspect metadata and generate SQL queries.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Side: Connection Form & Cards List (2/3 width) */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-8">
            <div className="flex items-center space-x-2.5 pb-4 mb-6 border-b border-border-light dark:border-border-dark">
              <Link2 size={20} className="text-primary-light" />
              <h3 className="text-lg font-bold text-text-primaryLight dark:text-text-primaryDark">
                Link New Database
              </h3>
            </div>
            <ConnectionForm onSuccess={handleNewConnectionSuccess} />
          </Card>

          {/* List of saved connections */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-text-primaryLight dark:text-text-primaryDark">
              Saved Connections ({connections.length})
            </h3>
            {connections.length === 0 ? (
              <Card className="p-8 text-center text-sm text-text-secondaryLight dark:text-text-secondaryDark">
                No connections configured yet. Configure credentials above.
              </Card>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {connections.map((c) => (
                  <ConnectionCard
                    key={c.id}
                    connection={c}
                    isSelected={c.id === selectedConnId}
                    onSelect={() => handleSelectConnection(c)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Schema details (1/3 width) */}
        <div className="space-y-6">
          {activeConnection ? (
            <Card className="p-6 border-l-4 border-l-primary-light">
              <div className="flex items-center space-x-2 pb-4 mb-4 border-b border-border-light dark:border-border-dark">
                <LayoutGrid className="text-primary-light" size={20} />
                <h3 className="text-lg font-bold text-text-primaryLight dark:text-text-primaryDark">
                  Schema Catalog
                </h3>
              </div>
              <SchemaViewer schema={schema} />
            </Card>
          ) : (
            <Card className="p-6 text-center text-sm text-text-secondaryLight dark:text-text-secondaryDark">
              Select or save a database to inspect its tables.
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};
export default DatabaseConnection;
