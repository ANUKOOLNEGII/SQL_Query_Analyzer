import { Router } from 'express';
import {
  register,
  verifyOtp,
  login,
  logout,
  refresh,
  resendOtp,
  forgotPassword,
  resetPassword,
} from '../controllers/auth.controller';
import { validateRequest } from '../middleware/validate.middleware';
import {
  registerSchema,
  loginSchema,
  verifyOTPSchema,
  refreshSchema,
  resendOTPSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from '../validators/auth.validator';
import { authRateLimiter } from '../middleware/rate-limit.middleware';

const router = Router();

router.post('/register', authRateLimiter, validateRequest(registerSchema), register);
router.post('/verify-otp', validateRequest(verifyOTPSchema), verifyOtp);
router.post('/login', authRateLimiter, validateRequest(loginSchema), login);
router.post('/resend-otp', authRateLimiter, validateRequest(resendOTPSchema), resendOtp);
router.post('/forgot-password', authRateLimiter, validateRequest(forgotPasswordSchema), forgotPassword);
router.post('/reset-password', authRateLimiter, validateRequest(resetPasswordSchema), resetPassword);
router.post('/logout', logout);
router.post('/refresh', validateRequest(refreshSchema), refresh);

export default router;
