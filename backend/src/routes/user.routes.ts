import { Router } from 'express';
import { getProfile, updateProfile } from '../controllers/user.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

// Apply auth middleware to all user routes
router.use(authMiddleware as any);

router.get('/profile', getProfile as any);
router.put('/profile', updateProfile as any);

export default router;
