import { Client as PGClient } from 'pg';
import mysql from 'mysql2/promise';
import { Connection as TediousConnection } from 'tedious';
import sqlite3 from 'sqlite3';
import { AppError } from '../middleware/error.middleware';

export interface DBConfig {
  databaseType: 'postgresql' | 'mysql' | 'sqlserver' | 'sqlite';
  host?: string;
  port?: number;
  username?: string;
  password?: string;
  databaseName: string; // SQLite uses this as file path
}

export const testPostgreSQL = async (config: DBConfig): Promise<void> => {
  const client = new PGClient({
    host: config.host || 'localhost',
    port: config.port || 5432,
    user: config.username || 'postgres',
    password: config.password || '',
    database: config.databaseName,
    connectionTimeoutMillis: 5000,
  });
  
  try {
    await client.connect();
    await client.query('SELECT 1;');
  } catch (err: any) {
    throw new AppError(400, `PostgreSQL connection failed: ${err.message}`);
  } finally {
    try {
      await client.end();
    } catch {
      // Ignored
    }
  }
};

export const testMySQL = async (config: DBConfig): Promise<void> => {
  try {
    const connection = await mysql.createConnection({
      host: config.host || 'localhost',
      port: config.port || 3306,
      user: config.username || 'root',
      password: config.password || '',
      database: config.databaseName,
      connectTimeout: 5000,
    });
    await connection.query('SELECT 1;');
    await connection.end();
  } catch (err: any) {
    throw new AppError(400, `MySQL connection failed: ${err.message}`);
  }
};

export const testSQLServer = (config: DBConfig): Promise<void> => {
  return new Promise((resolve, reject) => {
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
      },
    });

    connection.on('connect', (err) => {
      if (err) {
        reject(new AppError(400, `SQL Server connection failed: ${err.message}`));
      } else {
        connection.close();
        resolve();
      }
    });

    connection.connect();
  });
};

export const testSQLite = (config: DBConfig): Promise<void> => {
  return new Promise((resolve, reject) => {
    const dbPath = config.databaseName;
    const db = new sqlite3.Database(
      dbPath,
      sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE,
      (err) => {
        if (err) {
          reject(new AppError(400, `SQLite connection failed: ${err.message}`));
        } else {
          db.close((closeErr) => {
            if (closeErr) {
              reject(new AppError(400, `SQLite close failed: ${closeErr.message}`));
            } else {
              resolve();
            }
          });
        }
      }
    );
  });
};

export const testConnection = async (config: DBConfig): Promise<void> => {
  switch (config.databaseType) {
    case 'postgresql':
      await testPostgreSQL(config);
      break;
    case 'mysql':
      await testMySQL(config);
      break;
    case 'sqlserver':
      await testSQLServer(config);
      break;
    case 'sqlite':
      await testSQLite(config);
      break;
    default:
      throw new AppError(400, 'Unsupported database type');
  }
};
