import { z } from 'zod';

export const generateQuerySchema = z.object({
  datasetId: z.string().optional(),
  connectionId: z.string().optional(),
  query: z.string().min(3, 'Query must be at least 3 characters long'),
}).refine(data => data.datasetId || data.connectionId, {
  message: 'Either datasetId or connectionId must be provided',
  path: ['datasetId'],
});

export const executeQuerySchema = z.object({
  datasetId: z.string().optional(),
  connectionId: z.string().optional(),
  sql: z.string().min(5, 'SQL must be at least 5 characters long'),
}).refine(data => data.datasetId || data.connectionId, {
  message: 'Either datasetId or connectionId must be provided',
  path: ['datasetId'],
});
