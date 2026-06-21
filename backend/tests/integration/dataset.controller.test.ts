import request from 'supertest';
import app from '../../src/app';
import { prisma } from '../../src/config/database';
import { createVerifiedUser } from '../helpers/test-utils';
import fs from 'fs';
import path from 'path';

describe('Dataset Controller Integration Tests', () => {
  let token = '';
  let userId = '';
  let datasetId = '';

  beforeAll(async () => {
    const created = await createVerifiedUser('dataset-controller');
    token = created.token;
    userId = created.user.id;
  });

  afterAll(async () => {
    if (datasetId) {
      await prisma.dataset.delete({ where: { id: datasetId } });
    }
    await prisma.user.delete({ where: { id: userId } });
    await prisma.$disconnect();
  });

  it('should upload a dataset successfully', async () => {
    const csvContent = 'id,name,salary\n1,Alice,50000\n2,Bob,60000';
    const filePath = path.join(__dirname, '../../uploads/test-dataset.csv');
    fs.writeFileSync(filePath, csvContent);

    const res = await request(app)
      .post('/api/v1/dataset/upload')
      .set('Authorization', `Bearer ${token}`)
      .attach('file', filePath)
      .field('datasetName', 'Test Dataset');

    expect(res.statusCode).toEqual(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('id');
    datasetId = res.body.data.id;

    fs.unlinkSync(filePath);
  });

  it('should list datasets successfully', async () => {
    const res = await request(app)
      .get('/api/v1/dataset')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('should get dataset by id successfully', async () => {
    if (!datasetId) {
      // Upload a dataset first
      const csvContent = 'id,name,salary\n1,Alice,50000\n2,Bob,60000';
      const filePath = path.join(__dirname, '../../uploads/test-dataset-2.csv');
      fs.writeFileSync(filePath, csvContent);

      const uploadRes = await request(app)
        .post('/api/v1/dataset/upload')
        .set('Authorization', `Bearer ${token}`)
        .attach('file', filePath)
        .field('datasetName', 'Test Dataset 2');

      datasetId = uploadRes.body.data.id;
      fs.unlinkSync(filePath);
    }

    const res = await request(app)
      .get(`/api/v1/dataset/${datasetId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toEqual(datasetId);
  });

  it('should delete dataset successfully', async () => {
    // Upload a dataset to delete
    const csvContent = 'id,name,salary\n1,Charlie,70000';
    const filePath = path.join(__dirname, '../../uploads/test-dataset-delete.csv');
    fs.writeFileSync(filePath, csvContent);

    const uploadRes = await request(app)
      .post('/api/v1/dataset/upload')
      .set('Authorization', `Bearer ${token}`)
      .attach('file', filePath)
      .field('datasetName', 'Delete Dataset');

    const deleteDatasetId = uploadRes.body.data.id;
    fs.unlinkSync(filePath);

    const res = await request(app)
      .delete(`/api/v1/dataset/${deleteDatasetId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBe(true);
  });

  it('should return 401 when accessing datasets without token', async () => {
    const res = await request(app)
      .get('/api/v1/dataset');

    expect(res.statusCode).toEqual(401);
  });

  it('should return 404 when getting non-existent dataset', async () => {
    const res = await request(app)
      .get('/api/v1/dataset/non-existent-id')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toEqual(404);
  });
});
