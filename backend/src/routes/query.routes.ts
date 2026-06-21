import { Router } from 'express';
import { generateQuery, executeQuery } from '../controllers/query.controller';
import { listHistory } from '../controllers/history.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validate.middleware';
import { generateQuerySchema, executeQuerySchema } from '../validators/query.validator';

const router = Router();

// Apply auth middleware to all query routes
router.use(authMiddleware as any);

router.post('/generate', validateRequest(generateQuerySchema), generateQuery as any);
router.post('/execute', validateRequest(executeQuerySchema), executeQuery as any);
router.get('/history', listHistory as any);

export default router;
