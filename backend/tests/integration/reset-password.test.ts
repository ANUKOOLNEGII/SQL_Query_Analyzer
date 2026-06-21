import request from 'supertest';
import crypto from 'crypto';
import bcrypt from 'bcrypt';
import app from '../../src/app';
import { prisma } from '../../src/config/database';

describe('Reset Password Integration Tests', () => {
  const email = `reset-${Date.now()}@example.com`;
  let validToken = '';
  let expiredToken = '';
  let userId = '';

  beforeAll(async () => {
    validToken = crypto.randomBytes(32).toString('hex');
    expiredToken = crypto.randomBytes(32).toString('hex');

    const user = await prisma.user.create({
      data: {
        fullName: 'Reset User',
        email,
        password: await bcrypt.hash('oldpassword123', 12),
        isVerified: true,
        resetToken: validToken,
        resetTokenExpiresAt: new Date(Date.now() + 60 * 60 * 1000),
      },
    });
    userId = user.id;

    await prisma.user.create({
      data: {
        fullName: 'Expired Reset User',
        email: `expired-${Date.now()}@example.com`,
        password: await bcrypt.hash('oldpassword123', 12),
        isVerified: true,
        resetToken: expiredToken,
        resetTokenExpiresAt: new Date(Date.now() - 60 * 60 * 1000),
      },
    });
  });

  afterAll(async () => {
    await prisma.user.deleteMany({
      where: { email: { contains: 'reset-' } },
    });
    await prisma.$disconnect();
  });

  it('should reset password with a valid token', async () => {
    const res = await request(app)
      .post('/api/v1/auth/reset-password')
      .send({
        token: validToken,
        newPassword: 'newpassword123',
      });

    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBe(true);

    const user = await prisma.user.findUnique({ where: { id: userId } });
    expect(user?.resetToken).toBeNull();
    expect(user?.resetTokenExpiresAt).toBeNull();

    const loginRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ email, password: 'newpassword123' });

    expect(loginRes.statusCode).toEqual(200);
  });

  it('should reject expired token', async () => {
    const res = await request(app)
      .post('/api/v1/auth/reset-password')
      .send({
        token: expiredToken,
        newPassword: 'anotherpassword123',
      });

    expect(res.statusCode).toEqual(400);
    expect(res.body.success).toBe(false);
  });

  it('should reject invalid token', async () => {
    const res = await request(app)
      .post('/api/v1/auth/reset-password')
      .send({
        token: 'invalid-token-value',
        newPassword: 'anotherpassword123',
      });

    expect(res.statusCode).toEqual(400);
    expect(res.body.success).toBe(false);
  });
});
