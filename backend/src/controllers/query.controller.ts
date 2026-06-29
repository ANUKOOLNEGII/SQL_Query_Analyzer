import { Response, NextFunction } from 'express';
import { prisma } from '../config/database';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { AppError } from '../middleware/error.middleware';
import { generateSQLQuery } from '../services/ai/sql-generator.service';
import { validateSQLQuery } from '../services/ai/validation.service';
import { executeCSVQuery, executeConnectionQuery } from '../services/query/query-executor.service';
import { getDatabaseSchema, DatabaseSchemaSnapshot } from '../services/schema.service';
import { decrypt } from '../utils/crypto';
import { createAuditLog } from '../services/audit.service';
import { logger } from '../config/logger';
import { explainSQL } from '../services/ai/explanation.service';

export const generateQuery = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { datasetId, connectionId, query } = req.body;
    const userId = req.user!.id;

    let schema: DatabaseSchemaSnapshot = { tables: [], relationships: [] };
    let dbType = 'SQL';

    if (datasetId) {
      const dataset = await prisma.dataset.findFirst({
        where: { id: datasetId, userId },
        include: { columns: true },
      });
      if (!dataset) return next(new AppError(404, 'Dataset not found'));

      schema = {
        tables: [
          {
            name: dataset.datasetName,
            columns: dataset.columns.map((c: { columnName: string; dataType: string }) => ({
              name: c.columnName,
              type: c.dataType,
              primaryKey: false,
            })),
          },
        ],
        relationships: [],
      };
      dbType = 'SQLite';
    } else if (connectionId) {
      const connection = await prisma.databaseConnection.findFirst({
        where: { id: connectionId, userId },
      });
      if (!connection) return next(new AppError(404, 'Database connection not found'));

      const decryptedPassword = decrypt(connection.encryptedPassword);
      schema = await getDatabaseSchema({
        databaseType: connection.databaseType as any,
        host: connection.host,
        port: connection.port,
        username: connection.username,
        password: decryptedPassword,
        databaseName: connection.databaseName,
      });
      dbType = connection.databaseType;
    }

    const aiResponse = await generateSQLQuery(schema, query, dbType);
    logger.info('Query suggestions persisted', {
      source: aiResponse.suggestionSource,
      count: aiResponse.suggestions.length,
    });

    let validation = { isValid: true, errors: [] as string[] };
    try {
      validateSQLQuery(aiResponse.sql, schema);
    } catch (e: any) {
      validation.isValid = false;
      validation.errors.push(e.message);
    }

    const finalResponse = { ...aiResponse, validation };

    await prisma.queryHistory.create({
      data: {
        userId,
        naturalQuery: query,
        generatedSQL: aiResponse.sql,
        explanation: aiResponse.explanation,
        executionTime: 0,
        status: 'GENERATED',
        suggestions: {
          create: aiResponse.suggestions.map((suggestion: any) => ({ suggestionText: suggestion })),
        },
      },
      include: { suggestions: true },
    });

    res.status(200).json({
      success: true,
      data: finalResponse,
    });
  } catch (error) {
    next(error);
  }
};

export const executeQuery = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  const { datasetId, connectionId, sql } = req.body;
  const userId = req.user!.id;

  let schema: DatabaseSchemaSnapshot = { tables: [], relationships: [] };
  let result;

  try {
    if (datasetId) {
      const dataset = await prisma.dataset.findFirst({
        where: { id: datasetId, userId },
        include: { columns: true },
      });
      if (!dataset) return next(new AppError(404, 'Dataset not found'));

      schema = {
        tables: [
          {
            name: dataset.datasetName,
            columns: dataset.columns.map((c: { columnName: string; dataType: string }) => ({
              name: c.columnName,
              type: c.dataType,
              primaryKey: false,
            })),
          },
        ],
        relationships: [],
      };

      validateSQLQuery(sql, schema);
      result = await executeCSVQuery(dataset.fileName, dataset.datasetName, sql);
    } else if (connectionId) {
      const connection = await prisma.databaseConnection.findFirst({
        where: { id: connectionId, userId },
      });
      if (!connection) return next(new AppError(404, 'Database connection not found'));

      const decryptedPassword = decrypt(connection.encryptedPassword);
      const dbConfig = {
        databaseType: connection.databaseType as any,
        host: connection.host,
        port: connection.port,
        username: connection.username,
        password: decryptedPassword,
        databaseName: connection.databaseName,
      };

      schema = await getDatabaseSchema(dbConfig);
      validateSQLQuery(sql, schema);
      result = await executeConnectionQuery(dbConfig, sql);
    }

    if (!result) {
      return next(new AppError(500, 'Query execution returned no results.'));
    }

    const explanation = await explainSQL(sql, datasetId ? 'SQLite' : 'SQL');

    // Store in query history
    const queryHistory = await prisma.queryHistory.create({
      data: {
        userId,
        naturalQuery: req.body.query || 'Executed SQL Query',
        generatedSQL: sql,
        explanation,
        executionTime: result.executionTime,
        status: 'SUCCESS',
        suggestions: req.body.suggestions
          ? {
              create: (req.body.suggestions as string[]).map((suggestion) => ({
                suggestionText: suggestion,
              })),
            }
          : undefined,
      },
    });

    await createAuditLog(userId, 'QUERY_EXECUTED', { queryHistoryId: queryHistory.id, executionTime: result.executionTime });

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    try {
      await prisma.queryHistory.create({
        data: {
          userId,
          naturalQuery: req.body.query || 'Executed SQL Query',
          generatedSQL: sql,
          explanation: 'Query execution failed.',
          executionTime: 0,
          status: 'FAILED',
        },
      });
    } catch (innerError) {
      // Ignore secondary write failures while reporting the original execution error.
      logger.warn(`Failed to record failed query history: ${innerError}`);
    }
    next(error);
  }
};
