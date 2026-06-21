const mockRowsByQuery: Record<string, Array<Record<string, unknown>>> = {
  columns: [
    { TABLE_NAME: 'employees', COLUMN_NAME: 'id', DATA_TYPE: 'int' },
    { TABLE_NAME: 'employees', COLUMN_NAME: 'salary', DATA_TYPE: 'decimal' },
  ],
  primaryKeys: [{ TABLE_NAME: 'employees', COLUMN_NAME: 'id' }],
  relationships: [
    {
      SOURCE_TABLE: 'employees',
      SOURCE_COLUMN: 'department_id',
      TARGET_TABLE: 'departments',
      TARGET_COLUMN: 'id',
    },
  ],
};

jest.mock('tedious', () => {
  class MockRequest {
    sql: string;
    rowHandler?: (columns: Array<{ metadata: { colName: string }; value: unknown }>) => void;
    completionHandler?: (err: Error | null) => void;

    constructor(sql: string, callback: (err: Error | null) => void) {
      this.sql = sql;
      this.completionHandler = callback;
    }

    addParameter = jest.fn();

    on = jest.fn((event: string, handler: (columns: Array<{ metadata: { colName: string }; value: unknown }>) => void) => {
      if (event === 'row') {
        this.rowHandler = handler;
      }
    });

    execute = () => {
      let rows: Array<Record<string, unknown>> = [];
      if (this.sql.includes('INFORMATION_SCHEMA.COLUMNS')) {
        rows = mockRowsByQuery.columns;
      } else if (this.sql.includes("CONSTRAINT_TYPE = 'PRIMARY KEY'")) {
        rows = mockRowsByQuery.primaryKeys;
      } else if (this.sql.includes('REFERENTIAL_CONSTRAINTS')) {
        rows = mockRowsByQuery.relationships;
      }

      rows.forEach((row) => {
        this.rowHandler?.(
          Object.entries(row).map(([colName, value]) => ({
            metadata: { colName },
            value,
          }))
        );
      });

      this.completionHandler?.(null);
    };
  }

  class MockConnection {
    on = jest.fn((event: string, handler: (err: Error | null) => void) => {
      if (event === 'connect') {
        setImmediate(() => handler(null));
      }
    });
    connect = jest.fn();
    close = jest.fn();
    execSql = jest.fn((request: MockRequest) => {
      request.execute();
    });
  }

  return {
    Connection: MockConnection,
    Request: MockRequest,
    TYPES: { NVarChar: 'NVarChar' },
  };
});

import { getDatabaseSchema } from '../../src/services/schema.service';

describe('SQL Server Schema Integration Tests', () => {
  it('should return tables and relationships from SQL Server schema extraction', async () => {
    const schema = await getDatabaseSchema({
      databaseType: 'sqlserver',
      host: 'localhost',
      port: 1433,
      username: 'sa',
      password: 'password',
      databaseName: 'company_db',
    });

    expect(schema.tables).toHaveLength(1);
    expect(schema.tables[0].name).toEqual('employees');
    expect(schema.tables[0].columns).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: 'id', primaryKey: true }),
        expect.objectContaining({ name: 'salary', primaryKey: false }),
      ])
    );
    expect(schema.relationships).toEqual([
      {
        sourceTable: 'employees',
        sourceColumn: 'department_id',
        targetTable: 'departments',
        targetColumn: 'id',
      },
    ]);
  });
});
