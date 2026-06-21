import request from 'supertest';
import app from '../../src/app';
import { prisma } from '../../src/config/database';
import { createVerifiedUser } from '../helpers/test-utils';

describe('Export History Integration Tests', () => {
  let token = '';
  let userId = '';

  beforeAll(async () => {
    const created = await createVerifiedUser('export-history');
    token = created.token;
    userId = created.user.id;

    await prisma.exportHistory.createMany({
      data: [
        { userId, exportType: 'CSV', fileName: 'export-1.csv' },
        { userId, exportType: 'CSV', fileName: 'export-2.csv' },
        { userId, exportType: 'EXCEL', fileName: 'export-3.xlsx' },
        { userId, exportType: 'PDF', fileName: 'export-4.pdf' },
      ],
    });
  });

  afterAll(async () => {
    await prisma.exportHistory.deleteMany({ where: { userId } });
    await prisma.user.delete({ where: { id: userId } });
    await prisma.$disconnect();
  });

  it('should return paginated export history', async () => {
    const res = await request(app)
      .get('/api/v1/export/history?page=1&limit=2')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(2);
    expect(res.body.pagination).toEqual(
      expect.objectContaining({
        page: 1,
        limit: 2,
        total: 4,
        totalPages: 2,
      })
    );
    expect(res.body.data[0]).toHaveProperty('downloadUrl');
  });

  it('should sort export history', async () => {
    const res = await request(app)
      .get('/api/v1/export/history?sortBy=exportType&sortOrder=asc')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body.data[0].exportType).toEqual('CSV');
  });

  it('should filter export history by type', async () => {
    const res = await request(app)
      .get('/api/v1/export/history?exportType=PDF')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body.data.every((item: { exportType: string }) => item.exportType === 'PDF')).toBe(true);
  });
});
