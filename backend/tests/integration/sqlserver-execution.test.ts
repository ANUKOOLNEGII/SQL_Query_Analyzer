jest.mock('tedious', () => {
  class MockRequest {
    completionHandler?: (
      err: Error | null,
      rowCount?: number,
      rows?: Array<Array<{ metadata: { colName: string }; value: unknown }>>
    ) => void;

    constructor(_sql: string, callback: NonNullable<MockRequest['completionHandler']>) {
      this.completionHandler = callback;
    }

    addParameter = jest.fn();
    on = jest.fn();

    execute = () => {
      const rows = [
        [
          { metadata: { colName: 'id' }, value: 1 },
          { metadata: { colName: 'name' }, value: 'Alice' },
          { metadata: { colName: 'salary' }, value: 70000 },
        ],
        [
          { metadata: { colName: 'id' }, value: 2 },
          { metadata: { colName: 'name' }, value: 'John' },
          { metadata: { colName: 'salary' }, value: 50000 },
        ],
      ];

      this.completionHandler?.(null, rows.length, rows);
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

import { executeConnectionQuery } from '../../src/services/query/query-executor.service';

describe('SQL Server Execution Integration Tests', () => {
  it('should execute SQL Server queries and return normalized results', async () => {
    const result = await executeConnectionQuery(
      {
        databaseType: 'sqlserver',
        host: 'localhost',
        port: 1433,
        username: 'sa',
        password: 'password',
        databaseName: 'company_db',
      },
      'SELECT id, name, salary FROM employees WHERE salary > 50000'
    );

    expect(result.columns).toEqual(['id', 'name', 'salary']);
    expect(result.rows).toHaveLength(2);
    expect(result.totalRecords).toEqual(2);
    expect(result.executionTime).toBeGreaterThanOrEqual(0);
  });
});
