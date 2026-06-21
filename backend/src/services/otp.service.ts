import { prisma } from '../config/database';
import { sendEmail } from '../config/mail';
import { logger } from '../config/logger';

export const generateOTP = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const createAndSendOTP = async (userId: string, email: string): Promise<void> => {
  const otp = generateOTP();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  // Delete previous unverified OTPs for the user
  await prisma.otpVerification.deleteMany({
    where: { userId },
  });

  await prisma.otpVerification.create({
    data: {
      userId,
      otp,
      expiresAt,
    },
  });

  const subject = 'Your Verification OTP';
  const html = `
    <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
      <h2 style="color: #4F46E5;">Verify Your Account</h2>
      <p>Welcome! Use the following 6-digit OTP code to complete your registration. This code will expire in 10 minutes.</p>
      <div style="background: #F3F4F6; padding: 15px; border-radius: 8px; font-size: 24px; font-weight: bold; letter-spacing: 5px; text-align: center; color: #1F2937; margin: 20px 0;">
        ${otp}
      </div>
      <p>If you did not request this, you can safely ignore this email.</p>
    </div>
  `;
  
  await sendEmail(email, subject, html);
  logger.info(`OTP generated and email sent to ${email}`);
};

export const verifyOTP = async (email: string, otp: string): Promise<boolean> => {
  const user = await prisma.user.findUnique({
    where: { email },
  });
  if (!user) return false;

  const verification = await prisma.otpVerification.findFirst({
    where: {
      userId: user.id,
      otp,
      expiresAt: { gt: new Date() },
      verified: false,
    },
  });

  if (!verification) return false;

  // Mark verified
  await prisma.otpVerification.update({
    where: { id: verification.id },
    data: { verified: true },
  });

  // Activate user
  await prisma.user.update({
    where: { id: user.id },
    data: { isVerified: true },
  });

  return true;
};
