const pool = require('../db/pool');

const ALLOWED_SORTS = {
  price_asc: 'price ASC',
  price_desc: 'price DESC',
  rating_desc: 'rating DESC',
  newest: 'created_at DESC',
};

async function getProducts(filters) {
  const { q, brand, category, minPrice, maxPrice, minRam, sort, page, limit } = filters;
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

  return {
    data: dataResult.rows,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

async function getProductById(id) {
  const result = await pool.query('SELECT * FROM products WHERE id = $1', [id]);
  return result.rows[0] || null;
}

module.exports = { getProducts, getProductById };
