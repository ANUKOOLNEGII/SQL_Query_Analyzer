import { Response, NextFunction } from 'express';
import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';
import { prisma } from '../config/database';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { AppError } from '../middleware/error.middleware';
import { analyzeCSV, saveDataset } from '../services/dataset.service';
import { createAuditLog } from '../services/audit.service';
import { uploadDir } from '../middleware/upload.middleware';

export const uploadDataset = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.file) {
      return next(new AppError(400, 'Please upload a CSV file'));
    }
    const userId = req.user!.id;
    const analysis = analyzeCSV(req.file.path, req.file.originalname);
    const dataset = await saveDataset(userId, analysis);

    await createAuditLog(userId, 'DATASET_UPLOADED', { datasetId: dataset.id, name: dataset.datasetName });

    res.status(201).json({
      success: true,
      data: dataset,
    });
  } catch (error) {
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    next(error);
  }
};

export const listDatasets = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.id;
    const datasets = await prisma.dataset.findMany({
      where: { userId },
      include: { columns: true },
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json({
      success: true,
      data: datasets,
    });
  } catch (error) {
    next(error);
  }
};

export const getDataset = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const dataset = await prisma.dataset.findFirst({
      where: { id, userId },
      include: { columns: true },
    });

    if (!dataset) {
      return next(new AppError(404, 'Dataset not found'));
    }

    const filePath = path.join(uploadDir, dataset.fileName);
    let preview: any[] = [];
    if (fs.existsSync(filePath)) {
      try {
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        preview = parse(fileContent, {
          columns: true,
          skip_empty_lines: true,
          trim: true,
          to: 10, // Preview up to 10 rows
        });
      } catch (err) {
        // Log preview read error but don't crash
        console.error('Failed to read CSV preview:', err);
      }
    }

    res.status(200).json({
      success: true,
      data: {
        ...dataset,
        preview,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const deleteDataset = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const dataset = await prisma.dataset.findFirst({
      where: { id, userId },
    });

    if (!dataset) {
      return next(new AppError(404, 'Dataset not found'));
    }

    const filePath = path.join(uploadDir, dataset.fileName);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await prisma.dataset.delete({
      where: { id },
    });

    await createAuditLog(userId, 'DATASET_DELETED', { datasetId: id, name: dataset.datasetName });

    res.status(200).json({
      success: true,
      message: 'Dataset deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
