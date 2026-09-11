const productService = require('../services/productService');

const INTEGER_PATTERN = /^-?\d+$/;
const DECIMAL_PATTERN = /^-?\d+(\.\d+)?$/;

function parseStrictInt(value) {
  if (typeof value !== 'string' || !INTEGER_PATTERN.test(value.trim())) return NaN;
  return parseInt(value, 10);
}

function parseStrictFloat(value) {
  if (typeof value !== 'string' || !DECIMAL_PATTERN.test(value.trim())) return NaN;
  return parseFloat(value);
}

function parseAndValidateQuery(query) {
  const errors = [];

  const page = query.page !== undefined ? parseStrictInt(query.page) : 1;
  const limit = query.limit !== undefined ? parseStrictInt(query.limit) : 20;

  if (isNaN(page) || page < 1) errors.push('page must be a positive integer');
  if (isNaN(limit) || limit < 1 || limit > 100) errors.push('limit must be between 1 and 100');

  let minPrice, maxPrice, minRam;

  if (query.minPrice !== undefined) {
    minPrice = parseStrictFloat(query.minPrice);
    if (isNaN(minPrice) || minPrice < 0) errors.push('minPrice must be a non-negative number');
  }

  if (query.maxPrice !== undefined) {
    maxPrice = parseStrictFloat(query.maxPrice);
    if (isNaN(maxPrice) || maxPrice < 0) errors.push('maxPrice must be a non-negative number');
  }

  if (minPrice !== undefined && maxPrice !== undefined && !isNaN(minPrice) && !isNaN(maxPrice) && minPrice > maxPrice) {
    errors.push('minPrice must not be greater than maxPrice');
  }

  if (query.minRam !== undefined) {
    minRam = parseStrictInt(query.minRam);
    if (isNaN(minRam) || minRam < 0) errors.push('minRam must be a non-negative integer');
  }

  let q = query.q;
  if (q !== undefined) {
    q = String(q).trim();
    if (q.length > 100) errors.push('q must be 100 characters or fewer');
    if (q.length === 0) q = undefined;
  }

  return {
    errors,
    filters: {
      q,
      brand: query.brand,
      category: query.category,
      minPrice,
      maxPrice,
      minRam,
      sort: query.sort,
      page,
      limit,
    },
  };
}

async function listProducts(req, res) {
  const { errors, filters } = parseAndValidateQuery(req.query);

  if (errors.length > 0) {
    return res.status(400).json({ error: 'Invalid query parameters', details: errors });
  }

  try {
    const result = await productService.getProducts(filters);
    res.json(result);
  } catch (err) {
    console.error('Error fetching products:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function getProduct(req, res) {
  const id = parseStrictInt(req.params.id);

  if (isNaN(id)) {
    return res.status(400).json({ error: 'Invalid product id' });
  }

  try {
    const product = await productService.getProductById(id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(product);
  } catch (err) {
    console.error('Error fetching product:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function compareProducts(req, res) {
  const idsParam = req.query.ids;

  if (!idsParam || typeof idsParam !== 'string') {
    return res.status(400).json({ error: 'ids query parameter is required (comma-separated product ids)' });
  }

  const rawIds = idsParam.split(',').map(s => s.trim()).filter(Boolean);

  if (rawIds.length === 0 || rawIds.length > 4) {
    return res.status(400).json({ error: 'Provide between 1 and 4 product ids' });
  }

  const ids = [];
  for (const raw of rawIds) {
    const parsed = parseStrictInt(raw);
    if (isNaN(parsed)) {
      return res.status(400).json({ error: `Invalid product id: ${raw}` });
    }
    ids.push(parsed);
  }

  try {
    const products = await productService.getProductsByIds(ids);
    res.json({ data: products });
  } catch (err) {
    console.error('Error fetching products for comparison:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = { listProducts, getProduct, compareProducts };
