import { Response, NextFunction } from 'express';
import { prisma } from '../config/database';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { AppError } from '../middleware/error.middleware';

export const listHistory = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.id;
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 10));
    const sortBy = ['createdAt', 'executionTime', 'status'].includes(String(req.query.sortBy)) ? String(req.query.sortBy) : 'createdAt';
    const sortOrder = String(req.query.sortOrder).toLowerCase() === 'asc' ? 'asc' : 'desc';

    const total = await prisma.queryHistory.count({ where: { userId } });
    const history = await prisma.queryHistory.findMany({
      where: { userId },
      include: { suggestions: true },
      orderBy: { [sortBy]: sortOrder },
      skip: (page - 1) * limit,
      take: limit,
    });

    res.status(200).json({
      success: true,
      data: history,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getHistoryItem = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const item = await prisma.queryHistory.findFirst({
      where: { id, userId },
      include: { suggestions: true },
    });

    if (!item) {
      return next(new AppError(404, 'History item not found'));
    }

    res.status(200).json({
      success: true,
      data: item,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteHistoryItem = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const item = await prisma.queryHistory.findFirst({
      where: { id, userId },
    });

    if (!item) {
      return next(new AppError(404, 'History item not found'));
    }

    await prisma.queryHistory.delete({
      where: { id },
    });

    res.status(200).json({
      success: true,
      message: 'History item deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
