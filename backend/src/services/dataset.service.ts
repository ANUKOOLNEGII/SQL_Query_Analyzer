import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';
import { prisma } from '../config/database';
import { AppError } from '../middleware/error.middleware';

export interface CSVAnalysisResult {
  datasetName: string;
  fileName: string;
  totalRows: number;
  totalColumns: number;
  columns: { columnName: string; dataType: string }[];
}

export const analyzeCSV = (filePath: string, originalName: string): CSVAnalysisResult => {
  if (!fs.existsSync(filePath)) {
    throw new AppError(400, 'Uploaded file does not exist');
  }

  const fileContent = fs.readFileSync(filePath, 'utf-8');
  if (!fileContent.trim()) {
    throw new AppError(400, 'Uploaded file is empty');
  }

  let records: any[];
  try {
    records = parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    });
  } catch (error: any) {
    throw new AppError(400, `Failed to parse CSV: ${error.message}`);
  }

  if (records.length === 0) {
    throw new AppError(400, 'CSV must contain at least one data row');
  }

  const headers = Object.keys(records[0]);
  const totalColumns = headers.length;
  const totalRows = records.length;

  const columnsAnalysis = headers.map((header) => {
    const sampleValues = records
      .slice(0, 100)
      .map((r) => r[header])
      .filter((v) => v !== undefined && v !== null && v !== '');

    let dataType = 'TEXT';
    if (sampleValues.length > 0) {
      const isInteger = sampleValues.every((val) => /^-?\d+$/.test(val));
      const isFloat = !isInteger && sampleValues.every((val) => /^-?\d*\.\d+$/.test(val) || /^-?\d+$/.test(val));
      const isBoolean = sampleValues.every((val) => /^(true|false|1|0|yes|no)$/i.test(val));
      
      // Strict check for Date. Avoid parsing simple numbers as dates.
      const isDate = sampleValues.every((val) => {
        const parsed = Date.parse(val);
        return !isNaN(parsed) && isNaN(Number(val)) && val.length > 5;
      });

      if (isInteger) {
        dataType = 'INTEGER';
      } else if (isFloat) {
        dataType = 'FLOAT';
      } else if (isBoolean) {
        dataType = 'BOOLEAN';
      } else if (isDate) {
        dataType = 'DATE';
      }
    }

    return {
      columnName: header,
      dataType,
    };
  });

  const datasetName = path.basename(originalName, path.extname(originalName));

  return {
    datasetName,
    fileName: path.basename(filePath),
    totalRows,
    totalColumns,
    columns: columnsAnalysis,
  };
};

export const saveDataset = async (
  userId: string,
  analysis: CSVAnalysisResult
) => {
  return prisma.$transaction(async (tx: any) => {
    const dataset = await tx.dataset.create({
      data: {
        userId,
        datasetName: analysis.datasetName,
        fileName: analysis.fileName,
        totalRows: analysis.totalRows,
        totalColumns: analysis.totalColumns,
      },
    });

    await tx.datasetColumn.createMany({
      data: analysis.columns.map((col) => ({
        datasetId: dataset.id,
        columnName: col.columnName,
        dataType: col.dataType,
      })),
    });

    return dataset;
  });
};
