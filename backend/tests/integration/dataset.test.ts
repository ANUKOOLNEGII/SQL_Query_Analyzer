import request from 'supertest';
import path from 'path';
import fs from 'fs';
import app from '../../src/app';
import { prisma } from '../../src/config/database';
import { generateAccessToken } from '../../src/services/auth.service';

describe('Dataset Integration Tests', () => {
  let user: any;
  let token = '';
  let datasetId = '';
  const fixturesDir = path.join(__dirname, '../fixtures');
  const testCSVPath = path.join(fixturesDir, 'test.csv');

  beforeAll(async () => {
    user = await prisma.user.create({
      data: {
        fullName: 'Dataset User',
        email: `datasetuser-${Date.now()}@example.com`,
        password: 'password123',
        isVerified: true,
      },
    });
    token = generateAccessToken(user.id, user.email);

    if (!fs.existsSync(fixturesDir)) {
      fs.mkdirSync(fixturesDir, { recursive: true });
    }
    const csvContent = 'id,name,department,salary\n1,John,HR,50000\n2,Alice,IT,70000\n3,Bob,Sales,45000\n';
    fs.writeFileSync(testCSVPath, csvContent, 'utf-8');
  });

  afterAll(async () => {
    if (fs.existsSync(testCSVPath)) {
      fs.unlinkSync(testCSVPath);
    }
    try {
      await prisma.user.delete({ where: { id: user.id } });
    } catch (cleanupError) {
      console.warn('Cleanup error ignored:', cleanupError);
    }
    await prisma.$disconnect();
  });

  it('should upload a CSV dataset successfully', async () => {
    const res = await request(app)
      .post('/api/v1/dataset/upload')
      .set('Authorization', `Bearer ${token}`)
      .attach('file', testCSVPath);

    expect(res.statusCode).toEqual(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('id');
    expect(res.body.data.datasetName).toBe('test');
    expect(res.body.data.totalRows).toBe(3);
    expect(res.body.data.totalColumns).toBe(4);
    datasetId = res.body.data.id;
  });

  it('should list all datasets for user', async () => {
    const res = await request(app)
      .get('/api/v1/dataset')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  it('should get dataset details and preview', async () => {
    const res = await request(app)
      .get(`/api/v1/dataset/${datasetId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.preview.length).toEqual(3);
    expect(res.body.data.columns.length).toEqual(4);
  });

  it('should delete dataset successfully', async () => {
    const res = await request(app)
      .delete(`/api/v1/dataset/${datasetId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBe(true);
  });
});
