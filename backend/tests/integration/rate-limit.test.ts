import request from 'supertest';
import app from '../../src/app';
import { prisma } from '../../src/config/database';

describe('Auth Rate Limiting Integration Tests', () => {
  afterAll(async () => {
    await prisma.user.deleteMany({
      where: { email: { startsWith: 'rate-limit-' } },
    });
    await prisma.$disconnect();
  });

  it('should return 429 after exceeding login attempt limit', async () => {
    const email = `rate-limit-${Date.now()}@example.com`;

    await request(app)
      .post('/api/v1/auth/register')
      .send({ fullName: 'Rate Limit User', email, password: 'password123' });

    let lastStatus = 200;
    for (let attempt = 0; attempt < 6; attempt += 1) {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ email, password: 'wrong-password' });
      lastStatus = res.statusCode;
    }

    expect(lastStatus).toEqual(429);
    expect(lastStatus).not.toEqual(200);
  });
});
