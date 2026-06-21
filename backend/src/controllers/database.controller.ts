import { Response, NextFunction } from 'express';
import { prisma } from '../config/database';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { AppError } from '../middleware/error.middleware';
import { testConnection } from '../services/database.service';
import { getDatabaseSchema } from '../services/schema.service';
import { encrypt, decrypt } from '../utils/crypto';
import { createAuditLog } from '../services/audit.service';

export const testDbConnection = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    await testConnection(req.body);
    res.status(200).json({
      success: true,
      message: 'Connection test succeeded',
    });
  } catch (error) {
    next(error);
  }
};

export const connectDatabase = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { databaseType, host, port, username, password, databaseName } = req.body;

    // Test connection first
    await testConnection(req.body);

    // Encrypt password
    const encryptedPassword = encrypt(password || '');

    const connection = await prisma.databaseConnection.create({
      data: {
        userId,
        databaseType,
        host: host || 'localhost',
        port: Number(port),
        username: username || '',
        encryptedPassword,
        databaseName,
      },
    });

    await createAuditLog(userId, 'DATABASE_CONNECTED', { connectionId: connection.id, type: databaseType, databaseName });

    res.status(201).json({
      success: true,
      data: {
        id: connection.id,
        databaseType: connection.databaseType,
        host: connection.host,
        port: connection.port,
        username: connection.username,
        databaseName: connection.databaseName,
        createdAt: connection.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const listConnections = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.id;
    const connections = await prisma.databaseConnection.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    // Remove sensitive data
    const sanitizedConnections = connections.map((conn: any) => ({
      id: conn.id,
      databaseType: conn.databaseType,
      host: conn.host,
      port: conn.port,
      username: conn.username,
      databaseName: conn.databaseName,
      createdAt: conn.createdAt,
    }));

    res.status(200).json({
      success: true,
      data: sanitizedConnections,
    });
  } catch (error) {
    next(error);
  }
};

export const getDbSchema = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const connection = await prisma.databaseConnection.findFirst({
      where: { id, userId },
    });

    if (!connection) {
      return next(new AppError(404, 'Database connection not found'));
    }

    const decryptedPassword = decrypt(connection.encryptedPassword);

    const schema = await getDatabaseSchema({
      databaseType: connection.databaseType as any,
      host: connection.host,
      port: connection.port,
      username: connection.username,
      password: decryptedPassword,
      databaseName: connection.databaseName,
    });

    res.status(200).json({
      success: true,
      data: schema,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteConnection = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const connection = await prisma.databaseConnection.findFirst({
      where: { id, userId },
    });

    if (!connection) {
      return next(new AppError(404, 'Database connection not found'));
    }

    await prisma.databaseConnection.delete({
      where: { id },
    });

    await createAuditLog(userId, 'DATABASE_CONNECTION_DELETED', { connectionId: id, databaseName: connection.databaseName });

    res.status(200).json({
      success: true,
      message: 'Database connection deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
