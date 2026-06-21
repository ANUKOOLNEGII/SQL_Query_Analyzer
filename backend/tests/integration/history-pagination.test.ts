import request from 'supertest';
import app from '../../src/app';
import { prisma } from '../../src/config/database';
import { createVerifiedUser } from '../helpers/test-utils';

describe('Query History Pagination Integration Tests', () => {
  let token = '';
  let userId = '';

  beforeAll(async () => {
    const created = await createVerifiedUser('history-page');
    token = created.token;
    userId = created.user.id;

    const records = Array.from({ length: 12 }, (_, index) => ({
      userId,
      naturalQuery: `Query ${index + 1}`,
      generatedSQL: `SELECT ${index + 1};`,
      explanation: `Explanation ${index + 1}`,
      executionTime: index,
      status: index % 2 === 0 ? 'SUCCESS' : 'GENERATED',
    }));

    await prisma.queryHistory.createMany({ data: records });
  });

  afterAll(async () => {
    await prisma.queryHistory.deleteMany({ where: { userId } });
    await prisma.user.delete({ where: { id: userId } });
    await prisma.$disconnect();
  });

  it('should paginate query history on primary route', async () => {
    const res = await request(app)
      .get('/api/v1/query/history?page=1&limit=10')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(10);
    expect(res.body.pagination).toEqual({
      page: 1,
      limit: 10,
      total: 12,
      totalPages: 2,
    });
  });

  it('should paginate query history on legacy route', async () => {
    const res = await request(app)
      .get('/api/v1/history?page=2&limit=5')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body.data).toHaveLength(5);
    expect(res.body.pagination.page).toEqual(2);
    expect(res.body.pagination.limit).toEqual(5);
  });

  it('should sort query history', async () => {
    const ascRes = await request(app)
      .get('/api/v1/query/history?sortBy=executionTime&sortOrder=asc&limit=1')
      .set('Authorization', `Bearer ${token}`);

    const descRes = await request(app)
      .get('/api/v1/query/history?sortBy=executionTime&sortOrder=desc&limit=1')
      .set('Authorization', `Bearer ${token}`);

    expect(ascRes.body.data[0].executionTime).toBeLessThan(descRes.body.data[0].executionTime);
  });
});
