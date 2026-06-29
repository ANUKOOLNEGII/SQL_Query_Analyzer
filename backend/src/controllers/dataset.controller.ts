import { Response, NextFunction } from 'express';
import fs from 'fs';
import { parse } from 'csv-parse/sync';
import axios from 'axios';
import { prisma } from '../config/database';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { AppError } from '../middleware/error.middleware';
import { analyzeCSVContent, saveDataset } from '../services/dataset.service';
import { createAuditLog } from '../services/audit.service';
import cloudinary from '../config/cloudinary';

// Helper: extract the Cloudinary public_id from a secure_url
const getPublicIdFromUrl = (url: string): string => {
  // e.g. https://res.cloudinary.com/<cloud>/raw/upload/v123/csv_datasets/<publicId>.csv
  try {
    const urlObj = new URL(url);
    const parts = urlObj.pathname.split('/');
    // Find the upload segment and get everything after the version
    const uploadIdx = parts.indexOf('upload');
    if (uploadIdx === -1) return '';
    // Skip version segment (starts with 'v')
    const afterVersion = parts.slice(uploadIdx + 2);
    // Join and strip extension
    const withExt = afterVersion.join('/');
    return withExt.replace(/\.[^/.]+$/, '');
  } catch {
    return '';
  }
};

export const uploadDataset = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  let localFilePath: string | undefined;
  try {
    if (!req.file) {
      return next(new AppError(400, 'Please upload a CSV file'));
    }
    const userId = req.user!.id;
    localFilePath = req.file.path;

    // 1. Read the local file content for analysis
    const fileContent = fs.readFileSync(localFilePath, 'utf-8');
    const analysis = analyzeCSVContent(fileContent, req.file.originalname);

    // 2. Upload to Cloudinary as a raw file (CSV)
    const uploadResult = await cloudinary.uploader.upload(localFilePath, {
      resource_type: 'raw',
      folder: 'csv_datasets',
      public_id: `${userId}_${Date.now()}_${req.file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_')}`,
      overwrite: false,
    });

    // 3. Store the Cloudinary secure_url in the fileName field
    analysis.fileName = uploadResult.secure_url;

    // 4. Save the dataset record in DB
    const dataset = await saveDataset(userId, analysis);

    await createAuditLog(userId, 'DATASET_UPLOADED', { datasetId: dataset.id, name: dataset.datasetName });

    res.status(201).json({
      success: true,
      data: dataset,
    });
  } catch (error) {
    next(error);
  } finally {
    // Always clean up local temp file
    if (localFilePath && fs.existsSync(localFilePath)) {
      try { fs.unlinkSync(localFilePath); } catch { /* ignore */ }
    }
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

    let preview: any[] = [];
    // fileName now holds a Cloudinary URL — fetch it remotely
    if (dataset.fileName && dataset.fileName.startsWith('http')) {
      try {
        const response = await axios.get<string>(dataset.fileName, { responseType: 'text', timeout: 10000 });
        preview = parse(response.data, {
          columns: true,
          skip_empty_lines: true,
          trim: true,
          to: 10, // Preview up to 10 rows
        });
      } catch (err) {
        console.error('Failed to fetch CSV preview from Cloudinary:', err);
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

    // Delete from Cloudinary if it's a Cloudinary URL
    if (dataset.fileName && dataset.fileName.startsWith('http')) {
      const publicId = getPublicIdFromUrl(dataset.fileName);
      if (publicId) {
        try {
          await cloudinary.uploader.destroy(publicId, { resource_type: 'raw' });
        } catch (err) {
          console.warn('Failed to delete file from Cloudinary:', err);
        }
      }
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
