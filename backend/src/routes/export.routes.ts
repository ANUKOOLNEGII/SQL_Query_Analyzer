import { Router } from 'express';
import { exportCSV, exportExcel, exportPDF, downloadExport, listExportHistory } from '../controllers/export.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

// Secure export generation routes
router.post('/csv', authMiddleware as any, exportCSV as any);
router.post('/excel', authMiddleware as any, exportExcel as any);
router.post('/pdf', authMiddleware as any, exportPDF as any);
router.get('/history', authMiddleware as any, listExportHistory as any);

// Public file download route
router.get('/download/:fileName', downloadExport as any);

export default router;
