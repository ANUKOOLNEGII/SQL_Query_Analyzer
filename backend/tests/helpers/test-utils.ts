import { prisma } from '../../src/config/database';
import { generateAccessToken } from '../../src/services/auth.service';

export const createVerifiedUser = async (prefix = 'test') => {
  const email = `${prefix}-${Date.now()}@example.com`;
  const user = await prisma.user.create({
    data: {
      fullName: 'Test User',
      email,
      password: 'hashed-password-placeholder',
      isVerified: true,
    },
  });

  return {
    user,
    email,
    token: generateAccessToken(user.id, user.email),
  };
};

export const getLatestOtp = async (email: string) => {
  const user = await prisma.user.findUnique({ where: { email } });
  const otpRecord = await prisma.otpVerification.findFirst({
    where: { userId: user!.id },
    orderBy: { createdAt: 'desc' },
  });
  return otpRecord?.otp || '';
};
