import { Router } from 'express';
import { listHistory, getHistoryItem, deleteHistoryItem } from '../controllers/history.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

// Apply auth middleware to all history routes
router.use(authMiddleware as any);

router.get('/', listHistory as any);
router.get('/:id', getHistoryItem as any);
router.delete('/:id', deleteHistoryItem as any);

export default router;
