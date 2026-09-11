const request = require('supertest');
const app = require('../src/app');
const pool = require('../src/db/pool');
const redisClient = require('../src/db/redisClient');

describe('Redis caching behavior for GET /api/products', () => {
  const testQuery = '/api/products?brand=Acer&limit=3';

  beforeAll(async () => {
    // Ensure a clean slate for this specific cache key before testing
    await redisClient.del('products:list:brand=Acer&limit=3');
  });

  it('returns identical data on repeated identical requests (cache correctness)', async () => {
    const first = await request(app).get(testQuery);
    const second = await request(app).get(testQuery);

    expect(first.status).toBe(200);
    expect(second.status).toBe(200);
    expect(second.body).toEqual(first.body);
  });

  it('serves the second identical request from cache, not the database', async () => {
    await redisClient.del('products:list:brand=Acer&limit=3');

    const querySpy = jest.spyOn(pool, 'query');

    await request(app).get(testQuery); // miss — hits DB, populates cache
    const dbCallsAfterFirst = querySpy.mock.calls.length;

    await request(app).get(testQuery); // should be a hit — no new DB calls
    const dbCallsAfterSecond = querySpy.mock.calls.length;

    expect(dbCallsAfterSecond).toBe(dbCallsAfterFirst);

    querySpy.mockRestore();
  });

  it('uses different cache keys for different query params', async () => {
    const resA = await request(app).get('/api/products?brand=Asus&limit=3');
    const resB = await request(app).get('/api/products?brand=MSI&limit=3');

    expect(resA.body.data).not.toEqual(resB.body.data);
  });

  afterAll(async () => {
    await redisClient.quit();
    await pool.end();
  });
});
