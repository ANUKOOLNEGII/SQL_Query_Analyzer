import fs from 'fs';
import path from 'path';
import sqlite3 from 'sqlite3';
import { Client as PGClient } from 'pg';
import mysql from 'mysql2/promise';
import { Connection as TediousConnection, Request as TediousRequest } from 'tedious';
import { parse } from 'csv-parse/sync';
import { uploadDir } from '../../middleware/upload.middleware';
import { DBConfig } from '../database.service';
import { AppError } from '../../middleware/error.middleware';

export interface QueryResult {
  columns: string[];
  rows: any[];
  totalRecords: number;
  executionTime: number;
}

export const executeCSVQuery = (
  fileName: string,
  tableName: string,
  sql: string
): Promise<QueryResult> => {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    const filePath = path.join(uploadDir, fileName);

    if (!fs.existsSync(filePath)) {
      return reject(new AppError(400, 'Dataset file not found'));
    }

    let records: any[] = [];
    try {
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      records = parse(fileContent, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
      });
    } catch (parseErr: any) {
      return reject(new AppError(400, `Failed to parse CSV file: ${parseErr.message}`));
    }

    if (records.length === 0) {
      return reject(new AppError(400, 'CSV dataset has no rows to query'));
    }

    const db = new sqlite3.Database(':memory:', (err) => {
      if (err) {
        return reject(new AppError(500, `Failed to open in-memory SQLite: ${err.message}`));
      }

      const headers = Object.keys(records[0]);
      const createColumns = headers.map((h) => `"${h}" TEXT`).join(', ');
      const createTableSql = `CREATE TABLE "${tableName}" (${createColumns});`;

      db.run(createTableSql, (createErr) => {
        if (createErr) {
          db.close();
          return reject(new AppError(500, `Failed to create in-memory table: ${createErr.message}`));
        }

        const placeholders = headers.map(() => '?').join(', ');
        const insertSql = `INSERT INTO "${tableName}" (${headers.map((h) => `"${h}"`).join(', ')}) VALUES (${placeholders});`;

        db.serialize(() => {
          const stmt = db.prepare(insertSql, (prepErr) => {
            if (prepErr) {
              db.close();
              return reject(new AppError(500, `Failed to prepare insert: ${prepErr.message}`));
            }
          });

          records.forEach((row) => {
            const values = headers.map((h) => row[h]);
            stmt.run(values);
          });

          stmt.finalize((finalizeErr) => {
            if (finalizeErr) {
              db.close();
              return reject(new AppError(500, `Failed to finalize inserts: ${finalizeErr.message}`));
            }

            db.all(sql, [], (queryErr, rows: any[]) => {
              const executionTime = Date.now() - startTime;
              db.close();

              if (queryErr) {
                return reject(new AppError(400, `SQL query execution failed: ${queryErr.message}`));
              }

              const columns = rows.length > 0 ? Object.keys(rows[0]) : [];
              resolve({
                columns,
                rows,
                totalRecords: rows.length,
                executionTime,
              });
            });
          });
        });
      });
    });
  });
};

export const executePostgresQuery = async (config: DBConfig, sql: string): Promise<QueryResult> => {
  const startTime = Date.now();
  const client = new PGClient({
    host: config.host || 'localhost',
    port: config.port || 5432,
    user: config.username || 'postgres',
    password: config.password || '',
    database: config.databaseName,
  });

  try {
    await client.connect();
    const res = await client.query(sql);
    const executionTime = Date.now() - startTime;
    
    // PG result fields or rows
    const rows = Array.isArray(res) ? (res[res.length - 1]?.rows || []) : (res.rows || []);
    const columns = rows.length > 0 ? Object.keys(rows[0]) : [];

    return {
      columns,
      rows,
      totalRecords: rows.length,
      executionTime,
    };
  } catch (err: any) {
    throw new AppError(400, `PostgreSQL query failed: ${err.message}`);
  } finally {
    try {
      await client.end();
    } catch (closeErr: any) {
      console.warn('Failed to close PostgreSQL client:', closeErr);
    }
  }
};

export const executeMySQLQuery = async (config: DBConfig, sql: string): Promise<QueryResult> => {
  const startTime = Date.now();
  try {
    const connection = await mysql.createConnection({
      host: config.host || 'localhost',
      port: config.port || 3306,
      user: config.username || 'root',
      password: config.password || '',
      database: config.databaseName,
    });

    const [rows] = await connection.query(sql);
    const executionTime = Date.now() - startTime;
    await connection.end();

    const formattedRows = Array.isArray(rows) ? (rows as any[]) : [];
    const columns = formattedRows.length > 0 ? Object.keys(formattedRows[0]) : [];

    return {
      columns,
      rows: formattedRows,
      totalRecords: formattedRows.length,
      executionTime,
    };
  } catch (err: any) {
    throw new AppError(400, `MySQL query failed: ${err.message}`);
  }
};

export const executeSQLiteQuery = (config: DBConfig, sql: string): Promise<QueryResult> => {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    const db = new sqlite3.Database(config.databaseName, sqlite3.OPEN_READONLY, (err) => {
      if (err) {
        return reject(new AppError(400, `Failed to open SQLite: ${err.message}`));
      }

      db.all(sql, [], (queryErr, rows: any) => {
        const executionTime = Date.now() - startTime;
        db.close();

        if (queryErr) {
          return reject(new AppError(400, `SQLite query failed: ${queryErr.message}`));
        }

        const columns = rows.length > 0 ? Object.keys(rows[0] as Record<string, any>) : [];
        resolve({
          columns,
          rows,
          totalRecords: rows.length,
          executionTime,
        });
      });
    });
  });
};

export const executeSQLServerQuery = async (config: DBConfig, sql: string): Promise<QueryResult> => {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    const connection = new TediousConnection({
      server: config.host || 'localhost',
      authentication: {
        type: 'default',
        options: {
          userName: config.username || 'sa',
          password: config.password || '',
        },
      },
      options: {
        port: config.port || 1433,
        database: config.databaseName,
        encrypt: true,
        trustServerCertificate: true,
        connectTimeout: 5000,
        rowCollectionOnRequestCompletion: true,
        useColumnNames: false,
      },
    });

    const request = new TediousRequest(sql, (err, _rowCount, rows) => {
      if (err) {
        connection.close();
        return reject(new AppError(400, `SQL Server query failed: ${err.message}`));
      }

      const executionTime = Date.now() - startTime;
      const formattedRows: any[] = [];

      if (rows) {
        rows.forEach((row: any) => {
          const rowData: any = {};
          row.forEach((column: any) => {
            rowData[column.metadata.colName] = column.value;
          });
          formattedRows.push(rowData);
        });
      }

      const columns = formattedRows.length > 0 ? Object.keys(formattedRows[0] as Record<string, any>) : [];
      connection.close();
      resolve({
        columns,
        rows: formattedRows,
        totalRecords: formattedRows.length,
        executionTime,
      });
    });

    connection.on('connect', (err) => {
      if (err) {
        connection.close();
        return reject(new AppError(400, `SQL Server connection failed: ${err.message}`));
      }
      connection.execSql(request);
    });

    connection.connect();
  });
};

export const executeConnectionQuery = async (config: DBConfig, sql: string): Promise<QueryResult> => {
  switch (config.databaseType) {
    case 'postgresql':
      return executePostgresQuery(config, sql);
    case 'mysql':
      return executeMySQLQuery(config, sql);
    case 'sqlite':
      return executeSQLiteQuery(config, sql);
    case 'sqlserver':
      return executeSQLServerQuery(config, sql);
    default:
      throw new AppError(400, 'Unsupported database type');
  }
};
