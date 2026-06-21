import { prisma } from '../config/database';
import { logger } from '../config/logger';

export const createAuditLog = async (
  userId: string | null,
  action: string,
  metadata: any
): Promise<void> => {
  try {
    await prisma.auditLog.create({
      data: {
        userId,
        action,
        metadata: metadata ? JSON.parse(JSON.stringify(metadata)) : null,
      },
    });
  } catch (error) {
    logger.error('❌ Failed to create audit log:', error);
  }
};
