import fs from 'fs';
import multer from 'multer';
import path from 'path';
import { AppError } from './error.middleware';

const uploadDir = path.join(__dirname, '../uploads');

// Ensure directory exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const fileFilter = (_req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const extname = path.extname(file.originalname).toLowerCase();
  
  if (extname !== '.csv' && file.mimetype !== 'text/csv' && file.mimetype !== 'application/vnd.ms-excel') {
    return cb(new AppError(400, 'Only CSV files are allowed!'));
  }
  cb(null, true);
};

export const uploadCSV = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB
  },
});
export { uploadDir };
