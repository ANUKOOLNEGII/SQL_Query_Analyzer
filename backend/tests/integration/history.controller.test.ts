import request from 'supertest';
import app from '../../src/app';
import { prisma } from '../../src/config/database';
import { createVerifiedUser } from '../helpers/test-utils';

describe('History Controller Integration Tests', () => {
  let token = '';
  let userId = '';
  let historyId = '';

  beforeAll(async () => {
    const created = await createVerifiedUser('history-controller');
    token = created.token;
    userId = created.user.id;

    // Create some history items
    const historyItem = await prisma.queryHistory.create({
      data: {
        userId,
        naturalQuery: 'Test query',
        generatedSQL: 'SELECT * FROM test',
        explanation: 'Test explanation',
        executionTime: 100,
        status: 'SUCCESS',
      },
    });
    historyId = historyItem.id;
  });

  afterAll(async () => {
    await prisma.queryHistory.deleteMany({ where: { userId } });
    await prisma.user.delete({ where: { id: userId } });
    await prisma.$disconnect();
  });

  it('should get history item by id successfully', async () => {
    const res = await request(app)
      .get(`/api/v1/history/${historyId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toEqual(historyId);
  });

  it('should return 404 for non-existent history item', async () => {
    const res = await request(app)
      .get('/api/v1/history/non-existent-id')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toEqual(404);
  });

  it('should delete history item successfully', async () => {
    // Create a history item to delete
    const deleteItem = await prisma.queryHistory.create({
      data: {
        userId,
        naturalQuery: 'Delete test',
        generatedSQL: 'SELECT * FROM delete_test',
        explanation: 'Delete explanation',
        executionTime: 50,
        status: 'SUCCESS',
      },
    });

    const res = await request(app)
      .delete(`/api/v1/history/${deleteItem.id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toContain('deleted successfully');

    // Verify it's deleted
    const getRes = await request(app)
      .get(`/api/v1/history/${deleteItem.id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(getRes.statusCode).toEqual(404);
  });

  it('should return 404 when deleting non-existent history item', async () => {
    const res = await request(app)
      .delete('/api/v1/history/non-existent-id')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toEqual(404);
  });

  it('should return 401 when accessing history without token', async () => {
    const res = await request(app)
      .get(`/api/v1/history/${historyId}`);

    expect(res.statusCode).toEqual(401);
  });

  it('should return 401 when deleting history without token', async () => {
    const res = await request(app)
      .delete(`/api/v1/history/${historyId}`);

    expect(res.statusCode).toEqual(401);
  });

  it('should handle invalid page parameter', async () => {
    const res = await request(app)
      .get('/api/v1/history?page=invalid')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body.pagination.page).toBe(1); // Should default to 1
  });

  it('should handle invalid limit parameter', async () => {
    const res = await request(app)
      .get('/api/v1/history?limit=invalid')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body.pagination.limit).toBe(10); // Should default to 10
  });

  it('should cap limit at 100', async () => {
    const res = await request(app)
      .get('/api/v1/history?limit=200')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body.pagination.limit).toBe(100);
  });

  it('should handle invalid sortBy parameter', async () => {
    const res = await request(app)
      .get('/api/v1/history?sortBy=invalid')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toEqual(200);
    // Should default to createdAt
  });

  it('should handle invalid sortOrder parameter', async () => {
    const res = await request(app)
      .get('/api/v1/history?sortOrder=invalid')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toEqual(200);
    // Should default to desc
  });
});
