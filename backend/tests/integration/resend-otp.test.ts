import request from 'supertest';
import app from '../../src/app';
import { prisma } from '../../src/config/database';
import { getLatestOtp } from '../helpers/test-utils';

describe('Resend OTP Integration Tests', () => {
  const email = `resend-${Date.now()}@example.com`;
  let otpCode = '';

  afterAll(async () => {
    await prisma.user.deleteMany({ where: { email } });
    await prisma.$disconnect();
  });

  it('should register a user successfully', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({
        fullName: 'Resend User',
        email,
        password: 'password123',
      });

    expect(res.statusCode).toEqual(201);
    otpCode = await getLatestOtp(email);
    expect(otpCode).toHaveLength(6);
  });

  it('should verify OTP successfully', async () => {
    const res = await request(app)
      .post('/api/v1/auth/verify-otp')
      .send({ email, otp: otpCode });

    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBe(true);
  });

  it('should resend OTP successfully', async () => {
    const res = await request(app)
      .post('/api/v1/auth/resend-otp')
      .send({ email });

    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toContain('OTP sent successfully');

    const newOtp = await getLatestOtp(email);
    expect(newOtp).toHaveLength(6);
  });

  it('should return 404 when user is not found', async () => {
    const res = await request(app)
      .post('/api/v1/auth/resend-otp')
      .send({ email: 'missing-user@example.com' });

    expect(res.statusCode).toEqual(404);
    expect(res.body.success).toBe(false);
  });

  it('should return 429 when rate limited', async () => {
    const rateEmail = `rate-resend-${Date.now()}@example.com`;
    await request(app)
      .post('/api/v1/auth/register')
      .send({ fullName: 'Rate User', email: rateEmail, password: 'password123' });

    let lastStatus = 200;
    for (let attempt = 0; attempt < 6; attempt += 1) {
      const res = await request(app)
        .post('/api/v1/auth/resend-otp')
        .send({ email: rateEmail });
      lastStatus = res.statusCode;
    }

    expect(lastStatus).toEqual(429);
    await prisma.user.deleteMany({ where: { email: rateEmail } });
  });
});
