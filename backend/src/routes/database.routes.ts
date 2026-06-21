import { Router } from 'express';
import { testDbConnection, connectDatabase, listConnections, getDbSchema, deleteConnection } from '../controllers/database.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validate.middleware';
import { dbConnectionSchema, testConnectionSchema } from '../validators/database.validator';

const router = Router();

// Apply auth middleware to all database routes
router.use(authMiddleware as any);

router.post('/test', validateRequest(testConnectionSchema), testDbConnection as any);
router.post('/connect', validateRequest(dbConnectionSchema), connectDatabase as any);
router.get('/', listConnections as any);
router.get('/schema/:id', getDbSchema as any);
router.delete('/:id', deleteConnection as any);

export default router;
