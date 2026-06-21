import { prisma } from './config/database';
import request from 'supertest';
import app from './app';

const runVerification = async () => {
  console.log('🔄 Starting Verification...');

  // 1. Check Prisma connection
  console.log('1. Connecting to PostgreSQL...');
  await prisma.$connect();
  console.log('✅ Connected to database!');

  // Clean older test users if any
  await prisma.user.deleteMany({
    where: { email: 'verifytest@example.com' },
  });

  // 2. Test User Registration via Supertest
  console.log('2. Testing user registration API...');
  const regRes = await request(app)
    .post('/api/v1/auth/register')
    .send({
      fullName: 'Verification Test',
      email: 'verifytest@example.com',
      password: 'password123',
    });

  console.log('Registration Response Status:', regRes.statusCode);
  console.log('Registration Response Body:', JSON.stringify(regRes.body, null, 2));

  if (regRes.statusCode !== 201 || !regRes.body.success) {
    throw new Error('User registration failed!');
  }
  console.log('✅ User registration API verified successfully!');

  // Retrieve OTP
  const user = await prisma.user.findUnique({
    where: { email: 'verifytest@example.com' },
  });
  const otpRecord = await prisma.otpVerification.findFirst({
    where: { userId: user!.id },
  });
  const otp = otpRecord!.otp;
  console.log(`Retrieved OTP from database: ${otp}`);

  // 3. Test OTP Verification
  console.log('3. Testing OTP verification API...');
  const verifyRes = await request(app)
    .post('/api/v1/auth/verify-otp')
    .send({
      email: 'verifytest@example.com',
      otp,
    });

  console.log('Verification Response Status:', verifyRes.statusCode);
  console.log('Verification Response Body:', JSON.stringify(verifyRes.body, null, 2));

  if (verifyRes.statusCode !== 200 || !verifyRes.body.success) {
    throw new Error('OTP verification failed!');
  }
  console.log('✅ OTP verification API verified successfully!');

  // Clean up
  console.log('🧹 Cleaning up test user...');
  await prisma.user.delete({
    where: { email: 'verifytest@example.com' },
  });
  console.log('✅ Test user cleaned up!');
};

runVerification()
  .then(() => {
    console.log('🎉 ALL TESTS VERIFIED SUCCESSFULLY!');
    process.exit(0);
  })
  .catch((err) => {
    console.error('❌ Verification failed:', err);
    process.exit(1);
  });
