const pool = require('../db/pool');
const redisClient = require('../db/redisClient');

const ALLOWED_SORTS = {
  price_asc: 'price ASC, id ASC',
  price_desc: 'price DESC, id ASC',
  rating_desc: 'rating DESC, id ASC',
  newest: 'created_at DESC, id DESC',
};

const CACHE_TTL_SECONDS = 60;
const MAX_COMPARE_IDS = 4;

function buildCacheKey(filters) {
  const sortedEntries = Object.entries(filters)
    .filter(([, v]) => v !== undefined && v !== null && v !== '')
    .sort(([a], [b]) => a.localeCompare(b));
  const normalized = sortedEntries.map(([k, v]) => `${k}=${v}`).join('&');
  return `products:list:${normalized || 'all'}`;
}

async function getProducts(filters) {
  const cacheKey = buildCacheKey(filters);

  try {
    const cached = await redisClient.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }
  } catch (err) {
    console.error('Redis read error (falling back to DB):', err);
  }

  const {
    q, brand, category, minPrice, maxPrice, minRam, sort, page, limit,
  } = filters;

  const conditions = [];
  const values = [];
  let paramIndex = 1;

  if (q) {
    conditions.push(`(brand ILIKE $${paramIndex} OR model ILIKE $${paramIndex} OR category ILIKE $${paramIndex})`);
    values.push(`%${q}%`);
    paramIndex++;
  }
  if (brand) {
    conditions.push(`brand = $${paramIndex}`);
    values.push(brand);
    paramIndex++;
  }
  if (category) {
    conditions.push(`category ILIKE $${paramIndex}`);
    values.push(`%${category}%`);
    paramIndex++;
  }
  if (minPrice !== undefined) {
    conditions.push(`price >= $${paramIndex}`);
    values.push(minPrice);
    paramIndex++;
  }
  if (maxPrice !== undefined) {
    conditions.push(`price <= $${paramIndex}`);
    values.push(maxPrice);
    paramIndex++;
  }
  if (minRam !== undefined) {
    conditions.push(`ram_gb >= $${paramIndex}`);
    values.push(minRam);
    paramIndex++;
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  const orderClause = `ORDER BY ${ALLOWED_SORTS[sort] || ALLOWED_SORTS.newest}`;
  const offset = (page - 1) * limit;

  const dataQuery = `
    SELECT id, brand, model, category, price, rating, review_count,
           processor, ram_gb, storage_gb, storage_type, gpu,
           screen_size, resolution, operating_system,
           battery_life_hours, weight_kg, stock_quantity, created_at
    FROM products
    ${whereClause}
    ${orderClause}
    LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
  `;
  const dataValues = [...values, limit, offset];

  const countQuery = `SELECT COUNT(*) FROM products ${whereClause}`;
  const countValues = values;

  const [dataResult, countResult] = await Promise.all([
    pool.query(dataQuery, dataValues),
    pool.query(countQuery, countValues),
  ]);

  const total = parseInt(countResult.rows[0].count, 10);

  const result = {
    data: dataResult.rows,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };

  try {
    await redisClient.setEx(cacheKey, CACHE_TTL_SECONDS, JSON.stringify(result));
  } catch (err) {
    console.error('Redis write error (continuing without cache):', err);
  }

  return result;
}

async function getProductById(id) {
  const result = await pool.query('SELECT * FROM products WHERE id = $1', [id]);
  return result.rows[0] || null;
}

async function getProductsByIds(ids) {
  if (!Array.isArray(ids) || ids.length === 0) return [];

  const limitedIds = ids.slice(0, MAX_COMPARE_IDS);

  const result = await pool.query(
    'SELECT * FROM products WHERE id = ANY($1::int[])',
    [limitedIds]
  );
  return result.rows;
}

module.exports = { getProducts, getProductById, getProductsByIds };
