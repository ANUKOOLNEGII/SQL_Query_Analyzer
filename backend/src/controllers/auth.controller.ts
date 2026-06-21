import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { prisma } from '../config/database';
import { env } from '../config/env';
import { AppError } from '../middleware/error.middleware';
import { createAndSendOTP, verifyOTP } from '../services/otp.service';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../services/auth.service';
import { createAuditLog } from '../services/audit.service';

export const register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { fullName, email, password } = req.body;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return next(new AppError(400, 'User with this email already exists'));
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: {
        fullName,
        email,
        password: hashedPassword,
        isVerified: false,
      },
    });

    await createAndSendOTP(user.id, user.email);
    await createAuditLog(user.id, 'USER_REGISTERED', { email: user.email, ip: req.ip });

    res.status(201).json({
      success: true,
      message: 'Registration successful. Verification OTP sent to your email.',
    });
  } catch (error) {
    next(error);
  }
};

export const verifyOtp = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, otp } = req.body;

    const isVerified = await verifyOTP(email, otp);
    if (!isVerified) {
      return next(new AppError(400, 'Invalid or expired OTP'));
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return next(new AppError(404, 'User not found'));
    }

    const accessToken = generateAccessToken(user.id, user.email);
    const refreshToken = generateRefreshToken(user.id, user.email);

    await createAuditLog(user.id, 'USER_OTP_VERIFIED', { email: user.email, ip: req.ip });

    res.status(200).json({
      success: true,
      data: {
        accessToken,
        refreshToken,
        user: {
          id: user.id,
          fullName: user.fullName,
          email: user.email,
          isVerified: user.isVerified,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return next(new AppError(401, 'Invalid email or password'));
    }

    if (!user.isVerified) {
      return next(new AppError(403, 'Please verify your email using OTP first'));
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return next(new AppError(401, 'Invalid email or password'));
    }

    const accessToken = generateAccessToken(user.id, user.email);
    const refreshToken = generateRefreshToken(user.id, user.email);

    await createAuditLog(user.id, 'USER_LOGIN', { email: user.email, ip: req.ip });

    res.status(200).json({
      success: true,
      data: {
        accessToken,
        refreshToken,
        user: {
          id: user.id,
          fullName: user.fullName,
          email: user.email,
          isVerified: user.isVerified,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const logout = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    res.status(200).json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const refresh = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { refreshToken } = req.body;
    const decoded = verifyRefreshToken(refreshToken);

    const user = await prisma.user.findUnique({ where: { id: decoded.id } });
    if (!user) {
      return next(new AppError(401, 'Invalid token session'));
    }

    const newAccessToken = generateAccessToken(user.id, user.email);
    const newRefreshToken = generateRefreshToken(user.id, user.email);

    res.status(200).json({
      success: true,
      data: {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      },
    });
  } catch {
    next(new AppError(401, 'Invalid or expired refresh token'));
  }
};

export const resendOtp = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return next(new AppError(404, 'User not found'));
    }

    await createAndSendOTP(user.id, email);
    await createAuditLog(user.id, 'OTP_RESENT', { email, ip: req.ip });

    res.status(200).json({
      success: true,
      message: 'OTP sent successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const forgotPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return next(new AppError(404, 'User not found'));
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour validity

    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken,
        resetTokenExpiresAt: expiresAt,
      } as any,
    });

    const resetUrl = `${env.CLIENT_URL}/reset-password?token=${resetToken}`;
    const subject = 'Password Reset Request';
    const html = `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
        <h2 style="color: #4F46E5;">Reset Your Password</h2>
        <p>We received a request to reset your password. Click the button below to set a new password. This link will expire in one hour.</p>
        <a href="${resetUrl}" style="display: inline-block; margin-top: 20px; padding: 12px 20px; background: #4F46E5; color: white; border-radius: 6px; text-decoration: none;">Reset Password</a>
        <p style="margin-top: 20px;">If you did not request this change, please ignore this email.</p>
      </div>
    `;

    await createAuditLog(user.id, 'FORGOT_PASSWORD_REQUESTED', { email, ip: req.ip });
    await import('../config/mail').then(({ sendEmail }) => sendEmail(email, subject, html));

    res.status(200).json({
      success: true,
      message: 'Password reset instructions sent to your email',
    });
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { token, newPassword } = req.body;
    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiresAt: { gt: new Date() },
      } as any,
    });

    if (!user) {
      return next(new AppError(400, 'Invalid or expired password reset token'));
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiresAt: null,
      } as any,
    });

    await createAuditLog(user.id, 'PASSWORD_RESET', { email: user.email, ip: req.ip });

    res.status(200).json({
      success: true,
      message: 'Password reset successfully',
    });
  } catch (error) {
    next(error);
  }
};
