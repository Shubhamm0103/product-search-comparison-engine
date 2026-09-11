const request = require('supertest');
const app = require('../src/app');

describe('GET /api/products', () => {
  it('returns a list of products with default pagination', async () => {
    const res = await request(app).get('/api/products');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeLessThanOrEqual(20);
    expect(res.body.pagination).toHaveProperty('total');
    expect(res.body.pagination).toHaveProperty('page', 1);
    expect(res.body.pagination).toHaveProperty('limit', 20);
  });

  it('respects a custom limit', async () => {
    const res = await request(app).get('/api/products?limit=5');
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeLessThanOrEqual(5);
    expect(res.body.pagination.limit).toBe(5);
  });

  it('filters by minRam', async () => {
    const res = await request(app).get('/api/products?minRam=32&limit=50');
    expect(res.status).toBe(200);
    res.body.data.forEach(product => {
      expect(product.ram_gb).toBeGreaterThanOrEqual(32);
    });
  });

  it('sorts by price ascending', async () => {
    const res = await request(app).get('/api/products?sort=price_asc&limit=10');
    expect(res.status).toBe(200);
    const prices = res.body.data.map(p => parseFloat(p.price));
    const sorted = [...prices].sort((a, b) => a - b);
    expect(prices).toEqual(sorted);
  });

  it('rejects an invalid page number', async () => {
    const res = await request(app).get('/api/products?page=-1');
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Invalid query parameters');
    expect(res.body.details).toContain('page must be a positive integer');
  });

  it('rejects minPrice greater than maxPrice', async () => {
    const res = await request(app).get('/api/products?minPrice=100000&maxPrice=50000');
    expect(res.status).toBe(400);
    expect(res.body.details).toContain('minPrice must not be greater than maxPrice');
  });
});

describe('GET /api/products/:id', () => {
  it('returns a single product for a valid id', async () => {
    const res = await request(app).get('/api/products/1');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('id', 1);
    expect(res.body).toHaveProperty('brand');
  });

  it('returns 404 for a non-existent id', async () => {
    const res = await request(app).get('/api/products/999999');
    expect(res.status).toBe(404);
    expect(res.body.error).toBe('Product not found');
  });

  it('returns 400 for a non-numeric id', async () => {
    const res = await request(app).get('/api/products/abc');
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Invalid product id');
  });
});
