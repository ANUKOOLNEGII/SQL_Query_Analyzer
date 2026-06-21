import { Router } from 'express';
import { uploadDataset, listDatasets, getDataset, deleteDataset } from '../controllers/dataset.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { uploadCSV } from '../middleware/upload.middleware';

const router = Router();

// Apply auth middleware to all dataset routes
router.use(authMiddleware as any);

router.post('/upload', uploadCSV.single('file'), uploadDataset as any);
router.get('/', listDatasets as any);
router.get('/:id', getDataset as any);
router.delete('/:id', deleteDataset as any);

export default router;
