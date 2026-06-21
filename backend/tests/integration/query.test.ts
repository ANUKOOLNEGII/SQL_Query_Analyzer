import request from 'supertest';
import path from 'path';
import fs from 'fs';
import app from '../../src/app';
import { prisma } from '../../src/config/database';
import { generateAccessToken } from '../../src/services/auth.service';

describe('End-to-End Query, Connection, & Export Integration Tests', () => {
  let user: any;
  let token = '';
  let datasetId = '';
  let connectionId = '';
  const fixturesDir = path.join(__dirname, '../fixtures');
  const testCSVPath = path.join(fixturesDir, 'query_test.csv');

  beforeAll(async () => {
    user = await prisma.user.create({
      data: {
        fullName: 'Query User',
        email: `queryuser-${Date.now()}@example.com`,
        password: 'password123',
        isVerified: true,
      },
    });
    token = generateAccessToken(user.id, user.email);

    if (!fs.existsSync(fixturesDir)) {
      fs.mkdirSync(fixturesDir, { recursive: true });
    }
    const csvContent = 'id,name,salary\n1,John,50000\n2,Alice,70000\n3,Bob,45000\n';
    fs.writeFileSync(testCSVPath, csvContent, 'utf-8');

    const uploadRes = await request(app)
      .post('/api/v1/dataset/upload')
      .set('Authorization', `Bearer ${token}`)
      .attach('file', testCSVPath);
    datasetId = uploadRes.body.data.id;
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

  describe('Database Connection Module', () => {
    it('should test a connection successfully', async () => {
      const res = await request(app)
        .post('/api/v1/database/test')
        .set('Authorization', `Bearer ${token}`)
        .send({
          databaseType: 'postgresql',
          host: 'localhost',
          port: 5432,
          username: 'postgres',
          password: '0745',
          databaseName: 'ai_sql_generator',
        });

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
    });

    it('should connect/save database connection details', async () => {
      const res = await request(app)
        .post('/api/v1/database/connect')
        .set('Authorization', `Bearer ${token}`)
        .send({
          databaseType: 'postgresql',
          host: 'localhost',
          port: 5432,
          username: 'postgres',
          password: '0745',
          databaseName: 'ai_sql_generator',
        });

      expect(res.statusCode).toEqual(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('id');
      connectionId = res.body.data.id;
    });

    it('should retrieve schema detection snapshot', async () => {
      const res = await request(app)
        .get(`/api/v1/database/schema/${connectionId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('tables');
    });
  });

  describe('SQL Generation & Execution Module', () => {
    it('should generate SQL query using AI prompt', async () => {
      const res = await request(app)
        .post('/api/v1/query/generate')
        .set('Authorization', `Bearer ${token}`)
        .send({
          datasetId,
          query: 'Show employees with salary above 50000',
        });

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('sql');
      expect(res.body.data).toHaveProperty('explanation');
      expect(res.body.data).toHaveProperty('suggestions');
    });

    it('should execute SQL query on dataset (in-memory SQLite)', async () => {
      const tableName = 'query_test';
      const sql = `SELECT * FROM "${tableName}" WHERE salary > 45000;`;
      const res = await request(app)
        .post('/api/v1/query/execute')
        .set('Authorization', `Bearer ${token}`)
        .send({
          datasetId,
          sql,
          query: 'Show employees with salary above 45000',
        });

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.totalRecords).toEqual(2); // John and Alice
      expect(res.body.data.columns).toEqual(['id', 'name', 'salary']);
    });

    it('should fail to execute unsafe/injection queries', async () => {
      const res = await request(app)
        .post('/api/v1/query/execute')
        .set('Authorization', `Bearer ${token}`)
        .send({
          datasetId,
          sql: 'DROP TABLE users;',
        });

      expect(res.statusCode).toEqual(403);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('strictly prohibited');
    });
  });

  describe('Export & History Module', () => {
    let csvDownloadUrl = '';

    it('should retrieve query history', async () => {
      const res = await request(app)
        .get('/api/v1/history')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
    });

    it('should export results to CSV', async () => {
      const res = await request(app)
        .post('/api/v1/export/csv')
        .set('Authorization', `Bearer ${token}`)
        .send({
          columns: ['id', 'name', 'salary'],
          rows: [
            { id: '1', name: 'John', salary: '50000' },
            { id: '2', name: 'Alice', salary: '70000' },
          ],
        });

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('downloadUrl');
      csvDownloadUrl = res.body.data.downloadUrl;
    });

    it('should download the exported CSV file', async () => {
      const fileName = csvDownloadUrl.split('/').pop();
      const res = await request(app).get(`/api/v1/export/download/${fileName}`);

      expect(res.statusCode).toEqual(200);
      expect(res.text).toContain('John');
      expect(res.text).toContain('50000');
    });

    it('should export results to Excel', async () => {
      const res = await request(app)
        .post('/api/v1/export/excel')
        .set('Authorization', `Bearer ${token}`)
        .send({
          columns: ['id', 'name'],
          rows: [{ id: '1', name: 'John' }],
        });

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
    });

    it('should export results to PDF', async () => {
      const res = await request(app)
        .post('/api/v1/export/pdf')
        .set('Authorization', `Bearer ${token}`)
        .send({
          columns: ['id', 'name'],
          rows: [{ id: '1', name: 'John' }],
        });

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
    });
  });
});
