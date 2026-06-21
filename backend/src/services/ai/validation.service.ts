import { DatabaseSchemaSnapshot } from '../schema.service';
import { AppError } from '../../middleware/error.middleware';

export const validateSQLQuery = (
  sql: string,
  schema: DatabaseSchemaSnapshot
): void => {
  const sqlUpper = sql.toUpperCase();

  // 1. Block list of dangerous operations
  const blockedKeywords = [
    'DROP DATABASE',
    'DROP TABLE',
    'TRUNCATE',
    'ALTER SYSTEM',
    'GRANT ALL',
    'REVOKE ALL',
    'DELETE',
    'INSERT',
    'UPDATE',
    'ALTER TABLE',
    'CREATE TABLE',
    'CREATE DATABASE',
  ];

  for (const keyword of blockedKeywords) {
    if (sqlUpper.includes(keyword)) {
      throw new AppError(403, `Unsafe SQL query: Operation '${keyword}' is strictly prohibited.`);
    }
  }

  // Check SQL injection attempt or comments
  // Allow semicolon only at the very end
  const trimmed = sql.trim();
  const semicolonIndex = trimmed.indexOf(';');
  if (semicolonIndex !== -1 && semicolonIndex !== trimmed.length - 1) {
    throw new AppError(403, 'Unsafe SQL query: Executing multiple SQL queries via semicolons is blocked.');
  }

  // Block comment characters used in SQL injection
  if (trimmed.includes('--') || trimmed.includes('/*') || trimmed.includes('#')) {
    throw new AppError(403, 'Unsafe SQL query: SQL comments are blocked.');
  }

  // 2. Schema validation: Verify referenced tables exist in active schema (if schema exists)
  if (schema && schema.tables && schema.tables.length > 0) {
    const tableNames = schema.tables.map((t) => t.name.toLowerCase());
    
    // Extract tables referenced after FROM or JOIN
    const matches = sql.match(/\b(from|join)\s+([a-zA-Z0-9_`"]+)/gi);
    if (matches) {
      for (const m of matches) {
        const parts = m.trim().split(/\s+/);
        if (parts.length > 1) {
          const tbl = parts[1].replace(/[`"']/g, '').toLowerCase();
          if (!tableNames.includes(tbl)) {
            throw new AppError(400, `SQL Validation failed: Table '${tbl}' does not exist in the active schema.`);
          }
        }
      }
    }
  }
};
