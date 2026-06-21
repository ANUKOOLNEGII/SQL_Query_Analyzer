import { Client as PGClient } from 'pg';
import mysql from 'mysql2/promise';
import sqlite3 from 'sqlite3';
import { Connection as TediousConnection, Request as TediousRequest, TYPES } from 'tedious';
import { DBConfig } from './database.service';
import { AppError } from '../middleware/error.middleware';

export interface ColumnSchema {
  name: string;
  type: string;
  primaryKey: boolean;
}

export interface TableSchema {
  name: string;
  columns: ColumnSchema[];
}

export interface RelationshipSchema {
  sourceTable: string;
  sourceColumn: string;
  targetTable: string;
  targetColumn: string;
}

export interface DatabaseSchemaSnapshot {
  tables: TableSchema[];
  relationships: RelationshipSchema[];
}

// PostgreSQL Schema Extractor
export const getPostgresSchema = async (config: DBConfig): Promise<DatabaseSchemaSnapshot> => {
  const client = new PGClient({
    host: config.host || 'localhost',
    port: config.port || 5432,
    user: config.username || 'postgres',
    password: config.password || '',
    database: config.databaseName,
  });

  try {
    await client.connect();

    // 1. Get columns
    const columnsQuery = `
      SELECT 
        table_name, 
        column_name, 
        data_type
      FROM information_schema.columns 
      WHERE table_schema = 'public'
      ORDER BY table_name, ordinal_position;
    `;
    const colRes = await client.query(columnsQuery);

    // 2. Get primary keys
    const pkQuery = `
      SELECT 
        kcu.table_name, 
        kcu.column_name 
      FROM information_schema.table_constraints tc 
      JOIN information_schema.key_column_usage kcu 
        ON tc.constraint_name = kcu.constraint_name 
        AND tc.table_schema = kcu.table_schema
      WHERE tc.constraint_type = 'PRIMARY KEY' 
        AND tc.table_schema = 'public';
    `;
    const pkRes = await client.query(pkQuery);
    const pkSet = new Set(pkRes.rows.map((r: any) => `${r.table_name}.${r.column_name}`));

    // 3. Get relationships (foreign keys)
    const fkQuery = `
      SELECT
        kcu.table_name AS source_table,
        kcu.column_name AS source_column,
        ccu.table_name AS target_table,
        ccu.column_name AS target_column
      FROM information_schema.table_constraints tc
      JOIN information_schema.key_column_usage kcu
        ON tc.constraint_name = kcu.constraint_name
        AND tc.table_schema = kcu.table_schema
      JOIN information_schema.constraint_column_usage ccu
        ON ccu.constraint_name = tc.constraint_name
        AND ccu.table_schema = tc.table_schema
      WHERE tc.constraint_type = 'FOREIGN KEY'
        AND tc.table_schema = 'public';
    `;
    const fkRes = await client.query(fkQuery);

    // Group tables
    const tableMap = new Map<string, ColumnSchema[]>();
    colRes.rows.forEach((row: any) => {
      const tableName = row.table_name;
      const columnName = row.column_name;
      const dataType = row.data_type;
      const isPk = pkSet.has(`${tableName}.${columnName}`);

      if (!tableMap.has(tableName)) {
        tableMap.set(tableName, []);
      }
      tableMap.get(tableName)!.push({
        name: columnName,
        type: dataType.toUpperCase(),
        primaryKey: isPk,
      });
    });

    const tables: TableSchema[] = Array.from(tableMap.entries()).map(([name, columns]) => ({
      name,
      columns,
    }));

    const relationships: RelationshipSchema[] = fkRes.rows.map((row: any) => ({
      sourceTable: row.source_table,
      sourceColumn: row.source_column,
      targetTable: row.target_table,
      targetColumn: row.target_column,
    }));

    return { tables, relationships };
  } catch (err: any) {
    throw new AppError(500, `Failed to extract PostgreSQL schema: ${err.message}`);
  } finally {
    try {
      await client.end();
    } catch (closeErr: any) {
      console.warn('Failed to close PostgreSQL client:', closeErr);
    }
  }
};

// MySQL Schema Extractor
export const getMySQLSchema = async (config: DBConfig): Promise<DatabaseSchemaSnapshot> => {
  try {
    const connection = await mysql.createConnection({
      host: config.host || 'localhost',
      port: config.port || 3306,
      user: config.username || 'root',
      password: config.password || '',
      database: config.databaseName,
    });

    // 1. Get columns and check for primary keys via column_key = 'PRI'
    const colQuery = `
      SELECT 
        TABLE_NAME, 
        COLUMN_NAME, 
        DATA_TYPE,
        COLUMN_KEY
      FROM information_schema.columns 
      WHERE TABLE_SCHEMA = ?
      ORDER BY TABLE_NAME, ORDINAL_POSITION;
    `;
    const [cols] = await connection.query(colQuery, [config.databaseName]);

    // 2. Get foreign keys
    const fkQuery = `
      SELECT 
        TABLE_NAME AS source_table, 
        COLUMN_NAME AS source_column, 
        REFERENCED_TABLE_NAME AS target_table, 
        REFERENCED_COLUMN_NAME AS target_column
      FROM information_schema.key_column_usage
      WHERE REFERENCED_TABLE_SCHEMA = ? 
        AND REFERENCED_TABLE_NAME IS NOT NULL;
    `;
    const [fks] = await connection.query(fkQuery, [config.databaseName]);

    await connection.end();

    const tableMap = new Map<string, ColumnSchema[]>();
    (cols as any[]).forEach((row: any) => {
      const tableName = row.TABLE_NAME;
      const columnName = row.COLUMN_NAME;
      const dataType = row.DATA_TYPE;
      const isPk = row.COLUMN_KEY === 'PRI';

      if (!tableMap.has(tableName)) {
        tableMap.set(tableName, []);
      }
      tableMap.get(tableName)!.push({
        name: columnName,
        type: dataType.toUpperCase(),
        primaryKey: isPk,
      });
    });

    const tables: TableSchema[] = Array.from(tableMap.entries()).map(([name, columns]) => ({
      name,
      columns,
    }));

    const relationships: RelationshipSchema[] = (fks as any[]).map((row: any) => ({
      sourceTable: row.source_table,
      sourceColumn: row.source_column,
      targetTable: row.target_table,
      targetColumn: row.target_column,
    }));

    return { tables, relationships };
  } catch (err: any) {
    throw new AppError(500, `Failed to extract MySQL schema: ${err.message}`);
  }
};

// SQLite Schema Extractor
export const getSQLiteSchema = (config: DBConfig): Promise<DatabaseSchemaSnapshot> => {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(config.databaseName, sqlite3.OPEN_READONLY, async (err) => {
      if (err) {
        return reject(new AppError(500, `Failed to open SQLite database: ${err.message}`));
      }

      db.all("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%';", [], async (tableErr, tablesRes: any[]) => {
        if (tableErr) {
          db.close();
          return reject(new AppError(500, `Failed to list SQLite tables: ${tableErr.message}`));
        }

        try {
          const tables: TableSchema[] = [];
          const relationships: RelationshipSchema[] = [];

          for (const tbl of tablesRes) {
            const tableName = tbl.name;
            
            // Get columns info
            const cols: ColumnSchema[] = await new Promise((colRes, colRej) => {
              db.all(`PRAGMA table_info(${tableName});`, [], (colErr, columns: any[]) => {
                if (colErr) colRej(colErr);
                else {
                  colRes(
                    columns.map((c) => ({
                      name: c.name,
                      type: c.type.toUpperCase() || 'TEXT',
                      primaryKey: c.pk > 0,
                    }))
                  );
                }
              });
            });

            tables.push({ name: tableName, columns: cols });

            // Get foreign keys list
            const fks: RelationshipSchema[] = await new Promise((fkRes, fkRej) => {
              db.all(`PRAGMA foreign_key_list(${tableName});`, [], (fkErr, foreignKeys: any[]) => {
                if (fkErr) fkRej(fkErr);
                else {
                  fkRes(
                    foreignKeys.map((fk) => ({
                      sourceTable: tableName,
                      sourceColumn: fk.from,
                      targetTable: fk.table,
                      targetColumn: fk.to,
                    }))
                  );
                }
              });
            });

            relationships.push(...fks);
          }

          db.close();
          resolve({ tables, relationships });
        } catch (innerErr: any) {
          db.close();
          reject(new AppError(500, `Failed to inspect SQLite database: ${innerErr.message}`));
        }
      });
    });
  });
};

export const getSQLServerSchema = async (config: DBConfig): Promise<DatabaseSchemaSnapshot> => {
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
        rowCollectionOnRequestCompletion: true,
        useColumnNames: false,
      },
    });

    const tables: Map<string, ColumnSchema[]> = new Map();
    const relationships: RelationshipSchema[] = [];
    const primaryKeys = new Set<string>();

    const fetchColumns = () => {
      return new Promise<void>((resolveColumns, rejectColumns) => {
        const sql = `
          SELECT TABLE_NAME, COLUMN_NAME, DATA_TYPE
          FROM INFORMATION_SCHEMA.COLUMNS
          WHERE TABLE_CATALOG = @databaseName
          ORDER BY TABLE_NAME, ORDINAL_POSITION;
        `;

        const request = new TediousRequest(sql, (err) => {
          if (err) return rejectColumns(err);
          resolveColumns();
        });

        request.addParameter('databaseName', TYPES.NVarChar, config.databaseName);
        request.on('row', (columnsRows) => {
          const row: any = {};
          columnsRows.forEach((column: any) => {
            row[column.metadata.colName] = column.value;
          });
          const tableName = row.TABLE_NAME;
          const columnName = row.COLUMN_NAME;
          const dataType = row.DATA_TYPE;
          if (!tables.has(tableName)) {
            tables.set(tableName, []);
          }
          tables.get(tableName)!.push({
            name: columnName,
            type: (dataType || 'UNKNOWN').toUpperCase(),
            primaryKey: false,
          });
        });

        connection.execSql(request);
      });
    };

    const fetchPrimaryKeys = () => {
      return new Promise<void>((resolvePK, rejectPK) => {
        const sql = `
          SELECT KU.TABLE_NAME, KU.COLUMN_NAME
          FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS AS TC
          INNER JOIN INFORMATION_SCHEMA.KEY_COLUMN_USAGE AS KU
            ON TC.CONSTRAINT_NAME = KU.CONSTRAINT_NAME
          WHERE TC.CONSTRAINT_TYPE = 'PRIMARY KEY'
            AND KU.TABLE_CATALOG = @databaseName;
        `;

        const request = new TediousRequest(sql, (err) => {
          if (err) return rejectPK(err);
          resolvePK();
        });

        request.addParameter('databaseName', TYPES.NVarChar, config.databaseName);
        request.on('row', (pkRows) => {
          const row: any = {};
          pkRows.forEach((column: any) => {
            row[column.metadata.colName] = column.value;
          });
          primaryKeys.add(`${row.TABLE_NAME}.${row.COLUMN_NAME}`);
        });

        connection.execSql(request);
      });
    };

    const fetchRelationships = () => {
      return new Promise<void>((resolveFK, rejectFK) => {
        const sql = `
          SELECT
            KCU.TABLE_NAME AS SOURCE_TABLE,
            KCU.COLUMN_NAME AS SOURCE_COLUMN,
            KCU2.TABLE_NAME AS TARGET_TABLE,
            KCU2.COLUMN_NAME AS TARGET_COLUMN
          FROM INFORMATION_SCHEMA.REFERENTIAL_CONSTRAINTS RC
          INNER JOIN INFORMATION_SCHEMA.KEY_COLUMN_USAGE KCU
            ON RC.CONSTRAINT_NAME = KCU.CONSTRAINT_NAME
          INNER JOIN INFORMATION_SCHEMA.KEY_COLUMN_USAGE KCU2
            ON RC.UNIQUE_CONSTRAINT_NAME = KCU2.CONSTRAINT_NAME
          WHERE KCU.TABLE_CATALOG = @databaseName;
        `;

        const request = new TediousRequest(sql, (err) => {
          if (err) return rejectFK(err);
          resolveFK();
        });

        request.addParameter('databaseName', TYPES.NVarChar, config.databaseName);
        request.on('row', (fkRows) => {
          const row: any = {};
          fkRows.forEach((column: any) => {
            row[column.metadata.colName] = column.value;
          });
          relationships.push({
            sourceTable: row.SOURCE_TABLE,
            sourceColumn: row.SOURCE_COLUMN,
            targetTable: row.TARGET_TABLE,
            targetColumn: row.TARGET_COLUMN,
          });
        });

        connection.execSql(request);
      });
    };

    connection.on('connect', async (err) => {
      if (err) {
        connection.close();
        return reject(new AppError(500, `Failed to connect to SQL Server: ${err.message}`));
      }

      try {
        await fetchColumns();
        await fetchPrimaryKeys();
        await fetchRelationships();

        const resultTables: TableSchema[] = Array.from(tables.entries()).map(([name, cols]) => ({
          name,
          columns: cols.map((col) => ({
            ...col,
            primaryKey: primaryKeys.has(`${name}.${col.name}`),
          })),
        }));

        connection.close();
        resolve({ tables: resultTables, relationships });
      } catch (fetchErr: any) {
        connection.close();
        reject(new AppError(500, `Failed to extract SQL Server schema: ${fetchErr.message}`));
      }
    });

    connection.connect();
  });
};

export const getDatabaseSchema = async (config: DBConfig): Promise<DatabaseSchemaSnapshot> => {
  switch (config.databaseType) {
    case 'postgresql':
      return getPostgresSchema(config);
    case 'mysql':
      return getMySQLSchema(config);
    case 'sqlite':
      return getSQLiteSchema(config);
    case 'sqlserver':
      return getSQLServerSchema(config);
    default:
      throw new AppError(400, 'Unsupported database type');
  }
};
