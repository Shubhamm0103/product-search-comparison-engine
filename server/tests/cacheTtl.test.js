const request = require('supertest');
const app = require('../src/app');
const pool = require('../src/db/pool');
const redisClient = require('../src/db/redisClient');

describe('Cache TTL behavior', () => {
  const testKey = 'products:list:brand=Samsung&limit=2&page=1';

  beforeAll(async () => {
    await redisClient.del(testKey);
  });

  it('sets a TTL of approximately 60 seconds on a fresh cache entry', async () => {
    await request(app).get('/api/products?brand=Samsung&limit=2');

    const ttl = await redisClient.ttl(testKey);
    // ttl should be a positive number close to 60 (allow some slack for execution time)
    expect(ttl).toBeGreaterThan(0);
    expect(ttl).toBeLessThanOrEqual(60);
  });

  afterAll(async () => {
    await redisClient.quit();
    await pool.end();
  });
});
