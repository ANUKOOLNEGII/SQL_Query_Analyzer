import request from 'supertest';
import app from '../../src/app';
import { prisma } from '../../src/config/database';
import { createVerifiedUser } from '../helpers/test-utils';

describe('User Controller Integration Tests', () => {
  let token = '';
  let userId = '';

  beforeAll(async () => {
    const created = await createVerifiedUser('user-controller');
    token = created.token;
    userId = created.user.id;
  });

  afterAll(async () => {
    await prisma.user.delete({ where: { id: userId } });
    await prisma.$disconnect();
  });

  it('should get user profile successfully', async () => {
    const res = await request(app)
      .get('/api/v1/user/profile')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('id');
    expect(res.body.data).toHaveProperty('fullName');
    expect(res.body.data).toHaveProperty('email');
    expect(res.body.data).toHaveProperty('isVerified');
  });

  it('should update user profile successfully', async () => {
    const res = await request(app)
      .put('/api/v1/user/profile')
      .set('Authorization', `Bearer ${token}`)
      .send({ fullName: 'Updated Name' });

    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.fullName).toEqual('Updated Name');
  });

  it('should return 401 when getting profile without token', async () => {
    const res = await request(app)
      .get('/api/v1/user/profile');

    expect(res.statusCode).toEqual(401);
  });

  it('should return 401 when updating profile without token', async () => {
    const res = await request(app)
      .put('/api/v1/user/profile')
      .send({ fullName: 'Updated Name' });

    expect(res.statusCode).toEqual(401);
  });

  it('should return 404 when getting profile for non-existent user', async () => {
    const fakeToken = 'fake.jwt.token';
    const res = await request(app)
      .get('/api/v1/user/profile')
      .set('Authorization', `Bearer ${fakeToken}`);

    expect(res.statusCode).toEqual(401);
  });
});
