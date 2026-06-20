import axios from 'axios';
import type { AxiosRequestConfig } from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';
const USE_MOCK = import.meta.env.VITE_USE_MOCK_API === 'true';

export const axiosClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach JWT Token
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Handle auth errors
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
      // Optional: Redirect to login or dispatch clearCredentials
    }
    return Promise.reject(error);
  }
);

// --------------------------------------------------
// MOCK API SIMULATION LAYER (Axios Adapter)
// --------------------------------------------------

interface MockDb {
  datasets: any[];
  connections: any[];
  history: any[];
}

const mockDb: MockDb = {
  datasets: [
    {
      id: 'ds-employees',
      name: 'employees_data.csv',
      rowCount: 125,
      columnCount: 5,
      createdAt: '2026-06-19T10:30:00.000Z',
      status: 'available',
      columns: [
        { name: 'id', type: 'INTEGER', isNullable: false, isPrimaryKey: true, isForeignKey: false },
        { name: 'name', type: 'VARCHAR(100)', isNullable: false, isPrimaryKey: false, isForeignKey: false },
        { name: 'department', type: 'VARCHAR(50)', isNullable: true, isPrimaryKey: false, isForeignKey: false },
        { name: 'salary', type: 'NUMERIC', isNullable: true, isPrimaryKey: false, isForeignKey: false },
        { name: 'hire_date', type: 'DATE', isNullable: true, isPrimaryKey: false, isForeignKey: false },
      ]
    },
    {
      id: 'ds-sales',
      name: 'q1_sales_2026.csv',
      rowCount: 840,
      columnCount: 4,
      createdAt: '2026-06-20T08:15:00.000Z',
      status: 'available',
      columns: [
        { name: 'order_id', type: 'INTEGER', isNullable: false, isPrimaryKey: true, isForeignKey: false },
        { name: 'product_name', type: 'VARCHAR(150)', isNullable: false, isPrimaryKey: false, isForeignKey: false },
        { name: 'amount', type: 'NUMERIC', isNullable: false, isPrimaryKey: false, isForeignKey: false },
        { name: 'order_date', type: 'DATE', isNullable: false, isPrimaryKey: false, isForeignKey: false },
      ]
    }
  ],
  connections: [
    {
      id: 'conn-pg-prod',
      name: 'Production Postgres',
      type: 'postgresql',
      host: 'localhost',
      port: 5432,
      databaseName: 'company_analytics',
      username: 'db_admin',
      createdAt: '2026-06-18T14:20:00.000Z',
    }
  ],
  history: [
    {
      id: 'hist-1',
      createdAt: '2026-06-20T11:05:00.000Z',
      naturalQuery: 'Show all employees in the IT department with salary over 60000',
      generatedSQL: 'SELECT * FROM employees WHERE department = \'IT\' AND salary > 60000;',
      explanation: 'This query filters the employees table to retrieve all records where the department is exactly \'IT\' and the salary is greater than 60,000.',
      status: 'success',
      executionTime: 42
    },
    {
      id: 'hist-2',
      createdAt: '2026-06-20T11:45:00.000Z',
      naturalQuery: 'List total sales amount by product ordered by sales descending',
      generatedSQL: 'SELECT product_name, SUM(amount) AS total_sales FROM sales GROUP BY product_name ORDER BY total_sales DESC;',
      explanation: 'This query aggregates the sales table by product name, calculates the total order amount for each product, and sorts the results from highest sales to lowest.',
      status: 'success',
      executionTime: 85
    }
  ]
};

if (USE_MOCK) {
  axiosClient.defaults.adapter = async (config: AxiosRequestConfig): Promise<any> => {
    // Delay helper to simulate network lag (300ms)
    await new Promise((resolve) => setTimeout(resolve, 400));

    const { url = '', method = 'GET', data: rawData } = config;
    const body = rawData ? JSON.parse(rawData) : {};
    const relativeUrl = url.replace(API_URL, '').split('?')[0];

    // Helper for successful response
    const successResponse = (data: any, status = 200): any => ({
      data,
      status,
      statusText: 'OK',
      headers: {},
      config,
    });

    // Helper for error response
    const errorResponse = (message: string, status = 400) => {
      const err = new Error(message) as any;
      err.response = {
        data: { success: false, message },
        status,
        statusText: 'Bad Request',
        headers: {},
        config,
      };
      throw err;
    };

    console.log(`[Mock API Interceptor] ${method} ${relativeUrl}`, body);

    // Auth Endpoints
    if (relativeUrl === '/auth/register') {
      return successResponse({ success: true, message: 'Verification OTP sent to your email' });
    }
    if (relativeUrl === '/auth/login') {
      if (body.email === 'error@example.com') {
        return errorResponse('Invalid email or password', 400);
      }
      return successResponse({
        success: true,
        token: 'mock_jwt_token_xyz_123',
        user: {
          id: 'usr-1',
          name: body.email.split('@')[0].toUpperCase() || 'Admin User',
          email: body.email,
          createdAt: '2026-06-20T10:00:00.000Z',
          queriesCount: mockDb.history.length,
          datasetsCount: mockDb.datasets.length
        }
      });
    }
    if (relativeUrl === '/auth/verify-otp') {
      if (body.otp !== '123456') {
        return errorResponse('Invalid OTP code. Try 123456 for testing.', 400);
      }
      return successResponse({ success: true, message: 'Account verified successfully' });
    }
    if (relativeUrl === '/auth/forgot-password') {
      return successResponse({ success: true, message: 'Password reset link sent to email' });
    }
    if (relativeUrl === '/auth/reset-password') {
      return successResponse({ success: true, message: 'Password reset successfully' });
    }

    // Datasets
    if (relativeUrl === '/datasets') {
      if (method === 'GET') {
        return successResponse(mockDb.datasets);
      }
      if (method === 'POST') {
        // Upload dataset (form data would be parsed, but mock takes config)
        const name = body.name || 'new_dataset.csv';
        const newDataset = {
          id: `ds-${Date.now()}`,
          name,
          rowCount: Math.floor(Math.random() * 500) + 50,
          columnCount: 4,
          createdAt: new Date().toISOString(),
          status: 'available',
          columns: [
            { name: 'id', type: 'INTEGER', isNullable: false, isPrimaryKey: true, isForeignKey: false },
            { name: 'product', type: 'VARCHAR(100)', isNullable: false, isPrimaryKey: false, isForeignKey: false },
            { name: 'price', type: 'NUMERIC', isNullable: true, isPrimaryKey: false, isForeignKey: false },
            { name: 'quantity', type: 'INTEGER', isNullable: true, isPrimaryKey: false, isForeignKey: false },
          ]
        };
        mockDb.datasets.push(newDataset);
        return successResponse(newDataset, 21);
      }
    }
    
    if (relativeUrl.startsWith('/datasets/')) {
      const dsId = relativeUrl.split('/').pop() || '';
      if (method === 'DELETE') {
        mockDb.datasets = mockDb.datasets.filter(d => d.id !== dsId);
        return successResponse({ success: true, message: 'Dataset deleted' });
      }
    }

    // Database Connections
    if (relativeUrl === '/databases/connections') {
      if (method === 'GET') {
        return successResponse(mockDb.connections);
      }
      if (method === 'POST') {
        const newConn = {
          id: `conn-${Date.now()}`,
          name: body.name || 'New DB Connection',
          type: body.type || 'postgresql',
          host: body.host || 'localhost',
          port: body.port || 5432,
          databaseName: body.databaseName || 'test_db',
          username: body.username || 'postgres',
          createdAt: new Date().toISOString(),
        };
        mockDb.connections.push(newConn);
        return successResponse(newConn, 21);
      }
    }
    if (relativeUrl === '/databases/test-connection') {
      if (body.host === 'fail') {
        return errorResponse('Failed to connect: Host unreachable', 400);
      }
      return successResponse({ success: true, message: 'Connection verified successfully!' });
    }

    // Query Actions
    if (relativeUrl === '/query/generate') {
      const q = body.query || '';
      
      // Basic heuristic SQL builder based on user query
      let sql = 'SELECT * FROM employees;';
      let expl = 'This query retrieves all columns from the employees dataset.';
      const sug = [
        'SELECT name, department, salary FROM employees ORDER BY salary DESC;',
        'SELECT department, AVG(salary) AS avg_salary FROM employees GROUP BY department;',
        'SELECT * FROM employees WHERE salary > 50000 LIMIT 10;'
      ];

      if (q.toLowerCase().includes('it')) {
        sql = 'SELECT * FROM employees WHERE department = \'IT\';';
        expl = 'This query retrieves all details for employees who belong to the \'IT\' department.';
      } else if (q.toLowerCase().includes('salary') || q.toLowerCase().includes('earn')) {
        sql = 'SELECT * FROM employees WHERE salary > 50000 ORDER BY salary DESC;';
        expl = 'This query filters employees who earn more than 50,000 and sorts them from highest salary to lowest.';
      } else if (q.toLowerCase().includes('count') || q.toLowerCase().includes('how many')) {
        sql = 'SELECT department, COUNT(*) AS employee_count FROM employees GROUP BY department;';
        expl = 'This query groups the employees by their department and calculates the total number of employees in each department.';
      } else if (q.toLowerCase().includes('top')) {
        sql = 'SELECT * FROM employees ORDER BY salary DESC LIMIT 5;';
        expl = 'This query returns the details of the top 5 highest-earning employees in the dataset.';
      }

      return successResponse({
        sql,
        explanation: expl,
        suggestions: sug,
        validation: {
          isValid: true,
          errors: []
        }
      });
    }

    if (relativeUrl === '/query/execute') {
      const sql = body.sql || '';
      
      // Determine columns and mock rows based on the query structure
      let cols = ['id', 'name', 'department', 'salary', 'hire_date'];
      let rows: any[] = [
        { id: 1, name: 'John Doe', department: 'HR', salary: 52000, hire_date: '2024-01-15' },
        { id: 2, name: 'Alice Smith', department: 'IT', salary: 78000, hire_date: '2023-06-20' },
        { id: 3, name: 'Bob Johnson', department: 'IT', salary: 65000, hire_date: '2024-03-10' },
        { id: 4, name: 'Sarah Connor', department: 'Operations', salary: 59000, hire_date: '2022-11-05' },
        { id: 5, name: 'David Miller', department: 'Sales', salary: 47000, hire_date: '2025-02-18' },
      ];

      if (sql.toLowerCase().includes('count')) {
        cols = ['department', 'employee_count'];
        rows = [
          { department: 'HR', employee_count: 1 },
          { department: 'IT', employee_count: 2 },
          { department: 'Operations', employee_count: 1 },
          { department: 'Sales', employee_count: 1 },
        ];
      } else if (sql.toLowerCase().includes('avg')) {
        cols = ['department', 'avg_salary'];
        rows = [
          { department: 'HR', avg_salary: 52000 },
          { department: 'IT', avg_salary: 71500 },
          { department: 'Operations', avg_salary: 59000 },
          { department: 'Sales', avg_salary: 47000 },
        ];
      } else if (sql.toLowerCase().includes('it')) {
        rows = rows.filter(r => r.department === 'IT');
      }

      // Add audit log record to history
      const newHistItem = {
        id: `hist-${Date.now()}`,
        createdAt: new Date().toISOString(),
        naturalQuery: body.naturalQuery || 'Executed Custom SQL',
        generatedSQL: sql,
        explanation: 'Custom executed SQL statement.',
        status: 'success',
        executionTime: Math.floor(Math.random() * 60) + 15
      };
      mockDb.history.unshift(newHistItem);

      return successResponse({
        columns: cols,
        rows,
        rowCount: rows.length,
        executionTime: newHistItem.executionTime
      });
    }

    // Query History
    if (relativeUrl === '/query/history') {
      if (method === 'GET') {
        return successResponse(mockDb.history);
      }
    }
    
    if (relativeUrl.startsWith('/query/history/')) {
      const histId = relativeUrl.split('/').pop() || '';
      if (method === 'DELETE') {
        mockDb.history = mockDb.history.filter(h => h.id !== histId);
        return successResponse({ success: true, message: 'History record deleted' });
      }
      if (method === 'GET') {
        const item = mockDb.history.find(h => h.id === histId);
        if (!item) return errorResponse('History item not found', 404);
        return successResponse(item);
      }
    }

    return errorResponse(`Mock endpoint not implemented for ${method} ${relativeUrl}`, 404);
  };
}
