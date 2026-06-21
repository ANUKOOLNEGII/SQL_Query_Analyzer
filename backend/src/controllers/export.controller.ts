import { Request, Response, NextFunction } from 'express';
import fs from 'fs';
import path from 'path';
import ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit';
import { prisma } from '../config/database';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { AppError } from '../middleware/error.middleware';
import { createAuditLog } from '../services/audit.service';

const exportDir = path.join(__dirname, '../uploads/exports');
if (!fs.existsSync(exportDir)) {
  fs.mkdirSync(exportDir, { recursive: true });
}

export const exportCSV = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { columns, rows } = req.body;
    const userId = req.user!.id;

    if (!columns || !rows) {
      return next(new AppError(400, 'Columns and rows are required for export'));
    }

    const fileName = `export-${Date.now()}.csv`;
    const filePath = path.join(exportDir, fileName);

    const headerLine = columns.map((c: string) => `"${c.replace(/"/g, '""')}"`).join(',');
    const dataLines = (rows as any[]).map((row: any) => 
      columns.map((col: string) => {
        const val = row[col] === null || row[col] === undefined ? '' : String(row[col]);
        return `"${val.replace(/"/g, '""')}"`;
      }).join(',')
    );
    const content = [headerLine, ...dataLines].join('\n');

    fs.writeFileSync(filePath, content, 'utf-8');

    await prisma.exportHistory.create({
      data: {
        userId,
        exportType: 'CSV',
        fileName,
      },
    });

    await createAuditLog(userId, 'EXPORT_CSV', { fileName });

    res.status(200).json({
      success: true,
      data: {
        downloadUrl: `/api/v1/export/download/${fileName}`,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const exportExcel = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { columns, rows } = req.body;
    const userId = req.user!.id;

    if (!columns || !rows) {
      return next(new AppError(400, 'Columns and rows are required for export'));
    }

    const fileName = `export-${Date.now()}.xlsx`;
    const filePath = path.join(exportDir, fileName);

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Query Results');
    worksheet.columns = columns.map((col: string) => ({ header: col, key: col }));
    worksheet.addRows(rows);

    await workbook.xlsx.writeFile(filePath);

    await prisma.exportHistory.create({
      data: {
        userId,
        exportType: 'EXCEL',
        fileName,
      },
    });

    await createAuditLog(userId, 'EXPORT_EXCEL', { fileName });

    res.status(200).json({
      success: true,
      data: {
        downloadUrl: `/api/v1/export/download/${fileName}`,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const exportPDF = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { columns, rows } = req.body;
    const userId = req.user!.id;

    if (!columns || !rows) {
      return next(new AppError(400, 'Columns and rows are required for export'));
    }

    const fileName = `export-${Date.now()}.pdf`;
    const filePath = path.join(exportDir, fileName);

    const doc = new PDFDocument({ margin: 30 });
    const writeStream = fs.createWriteStream(filePath);
    doc.pipe(writeStream);

    doc.fontSize(16).text('AI SQL Generator - Query Results', { align: 'center' });
    doc.moveDown();

    doc.fontSize(9);
    let y = doc.y;

    const colWidth = (doc.page.width - 60) / columns.length;
    columns.forEach((col: string, idx: number) => {
      doc.text(col, 30 + idx * colWidth, y, { width: colWidth, ellipsis: true } as any);
    });

    doc.moveDown();
    y = doc.y;
    doc.moveTo(30, y).lineTo(doc.page.width - 30, y).stroke();
    y += 10;

    (rows as any[]).slice(0, 100).forEach((row: any) => {
      if (y > doc.page.height - 50) {
        doc.addPage();
        y = 30;
      }
      columns.forEach((col: string, idx: number) => {
        const val = row[col] === null || row[col] === undefined ? '' : String(row[col]);
        doc.text(val, 30 + idx * colWidth, y, { width: colWidth, ellipsis: true } as any);
      });
      y += 18;
    });

    doc.end();

    await new Promise<void>((resolve) => writeStream.on('finish', () => resolve()));

    await prisma.exportHistory.create({
      data: {
        userId,
        exportType: 'PDF',
        fileName,
      },
    });

    await createAuditLog(userId, 'EXPORT_PDF', { fileName });

    res.status(200).json({
      success: true,
      data: {
        downloadUrl: `/api/v1/export/download/${fileName}`,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const listExportHistory = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.id;
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 10));
    const sortBy = ['createdAt', 'exportType'].includes(String(req.query.sortBy)) ? String(req.query.sortBy) : 'createdAt';
    const sortOrder = String(req.query.sortOrder).toLowerCase() === 'asc' ? 'asc' : 'desc';
    const exportType = String(req.query.exportType || '').toUpperCase();

    const whereClause = exportType ? { userId, exportType } : { userId };
    const total = await prisma.exportHistory.count({ where: whereClause });
    const history = await prisma.exportHistory.findMany({
      where: whereClause,
      orderBy: { [sortBy]: sortOrder },
      skip: (page - 1) * limit,
      take: limit,
    });

    res.status(200).json({
      success: true,
      data: history.map((item: any) => ({
        ...item,
        downloadUrl: `/api/v1/export/download/${item.fileName}`,
      })),
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

export const downloadExport = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { fileName } = req.params;
    const filePath = path.join(exportDir, fileName);

    if (!fs.existsSync(filePath)) {
      return next(new AppError(404, 'File not found or expired'));
    }

    res.download(filePath);
  } catch (error) {
    next(error);
  }
};
export { exportDir };
