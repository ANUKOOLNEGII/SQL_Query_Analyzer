import request from 'supertest';
import app from '../../src/app';
import { prisma } from '../../src/config/database';
import { createVerifiedUser } from '../helpers/test-utils';

describe('Forgot Password Integration Tests', () => {
  let email = '';

  beforeAll(async () => {
    const created = await createVerifiedUser('forgot');
    email = created.email;
  });

  afterAll(async () => {
    await prisma.user.deleteMany({ where: { email } });
    await prisma.$disconnect();
  });

  it('should generate reset token and set expiry', async () => {
    const res = await request(app)
      .post('/api/v1/auth/forgot-password')
      .send({ email });

    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toContain('Password reset instructions');

    const user = await prisma.user.findUnique({ where: { email } });
    expect(user?.resetToken).toBeTruthy();
    expect(user?.resetTokenExpiresAt).toBeTruthy();
    expect(user!.resetTokenExpiresAt!.getTime()).toBeGreaterThan(Date.now());
  });

  it('should return 404 for unknown email', async () => {
    const res = await request(app)
      .post('/api/v1/auth/forgot-password')
      .send({ email: 'unknown-forgot@example.com' });

    expect(res.statusCode).toEqual(404);
    expect(res.body.success).toBe(false);
  });
});
