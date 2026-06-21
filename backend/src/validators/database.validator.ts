import { z } from 'zod';

export const dbConnectionSchema = z.object({
  databaseType: z.enum(['postgresql', 'mysql', 'sqlserver', 'sqlite']),
  host: z.string().default('localhost').optional(),
  port: z.coerce.number().int().positive().default(5432).optional(),
  username: z.string().default('postgres').optional(),
  password: z.string().default('').optional(),
  databaseName: z.string().min(1, 'Database name or path is required'),
});

export const testConnectionSchema = dbConnectionSchema;
export const schemaDetectionSchema = z.object({
  connectionId: z.string(),
});
