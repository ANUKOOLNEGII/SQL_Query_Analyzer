import request from 'supertest';
import app from '../../src/app';
import { prisma } from '../../src/config/database';
import { createVerifiedUser } from '../helpers/test-utils';
import fs from 'fs';
import path from 'path';

describe('Query Suggestions Integration Tests', () => {
  let token = '';
  let userId = '';
  let datasetId = '';

  beforeAll(async () => {
    const created = await createVerifiedUser('query-suggestions');
    token = created.token;
    userId = created.user.id;

    // Upload a dataset
    const csvContent = 'id,name,salary,department,joining_date\n1,Alice,50000,Engineering,2023-01-15\n2,Bob,60000,Sales,2023-02-20\n3,Charlie,70000,Engineering,2023-03-10';
    const filePath = path.join(__dirname, '../../uploads/test-suggestions-dataset.csv');
    fs.writeFileSync(filePath, csvContent);

    const uploadRes = await request(app)
      .post('/api/v1/dataset/upload')
      .set('Authorization', `Bearer ${token}`)
      .attach('file', filePath)
      .field('datasetName', 'Employees Dataset');

    datasetId = uploadRes.body.data.id;
    fs.unlinkSync(filePath);
  });

  afterAll(async () => {
    if (datasetId) {
      await prisma.dataset.delete({ where: { id: datasetId } });
    }
    await prisma.user.delete({ where: { id: userId } });
    await prisma.$disconnect();
  });

  it('should generate query with AI suggestions', async () => {
    const res = await request(app)
      .post('/api/v1/query/generate')
      .set('Authorization', `Bearer ${token}`)
      .send({
        datasetId,
        query: 'Show employees earning more than 50000',
      });

    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('sql');
    expect(res.body.data).toHaveProperty('explanation');
    expect(res.body.data).toHaveProperty('suggestions');
    expect(Array.isArray(res.body.data.suggestions)).toBe(true);
    expect(res.body.data.suggestions.length).toBeGreaterThan(0);
  });

  it('should return natural language suggestions, not SQL', async () => {
    const res = await request(app)
      .post('/api/v1/query/generate')
      .set('Authorization', `Bearer ${token}`)
      .send({
        datasetId,
        query: 'List all employees',
      });

    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.suggestions).toBeDefined();
    
    // Verify suggestions are natural language, not SQL
    res.body.data.suggestions.forEach((suggestion: string) => {
      expect(suggestion).not.toMatch(/^SELECT/i);
      expect(suggestion).not.toMatch(/^INSERT/i);
      expect(suggestion).not.toMatch(/^UPDATE/i);
      expect(suggestion).not.toMatch(/^DELETE/i);
    });
  });

  it('should include suggestion source in query history', async () => {
    const res = await request(app)
      .post('/api/v1/query/generate')
      .set('Authorization', `Bearer ${token}`)
      .send({
        datasetId,
        query: 'Show top employees by salary',
      });

    expect(res.statusCode).toEqual(200);

    // Check query history
    const historyRes = await request(app)
      .get('/api/v1/query/history')
      .set('Authorization', `Bearer ${token}`);

    expect(historyRes.statusCode).toEqual(200);
    const latestQuery = historyRes.body.data[0];
    expect(latestQuery).toHaveProperty('suggestions');
    expect(Array.isArray(latestQuery.suggestions)).toBe(true);
  });

  it('should return exactly 3 unique suggestions', async () => {
    const res = await request(app)
      .post('/api/v1/query/generate')
      .set('Authorization', `Bearer ${token}`)
      .send({
        datasetId,
        query: 'Analyze employee data',
      });

    expect(res.statusCode).toEqual(200);
    expect(res.body.data.suggestions).toBeDefined();
    expect(res.body.data.suggestions.length).toBeLessThanOrEqual(3);
    
    // Check for uniqueness
    const uniqueSuggestions = new Set(res.body.data.suggestions);
    expect(uniqueSuggestions.size).toBe(res.body.data.suggestions.length);
  });

  it('should return 401 when generating query without token', async () => {
    const res = await request(app)
      .post('/api/v1/query/generate')
      .send({
        datasetId,
        query: 'Show employees',
      });

    expect(res.statusCode).toEqual(401);
  });

  it('should return 404 when dataset not found', async () => {
    const res = await request(app)
      .post('/api/v1/query/generate')
      .set('Authorization', `Bearer ${token}`)
      .send({
        datasetId: 'non-existent-id',
        query: 'Show employees',
      });

    expect(res.statusCode).toEqual(404);
  });
});
