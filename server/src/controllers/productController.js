const productService = require('../services/productService');

function parseAndValidateQuery(query) {
  const errors = [];
  const page = query.page ? parseInt(query.page, 10) : 1;
  const limit = query.limit ? parseInt(query.limit, 10) : 20;
  if (isNaN(page) || page < 1) errors.push('page must be a positive integer');
  if (isNaN(limit) || limit < 1 || limit > 100) errors.push('limit must be between 1 and 100');
  let minPrice, maxPrice, minRam;
  if (query.minPrice !== undefined) {
    minPrice = parseFloat(query.minPrice);
    if (isNaN(minPrice) || minPrice < 0) errors.push('minPrice must be a non-negative number');
  }
  if (query.maxPrice !== undefined) {
    maxPrice = parseFloat(query.maxPrice);
    if (isNaN(maxPrice) || maxPrice < 0) errors.push('maxPrice must be a non-negative number');
  }
  if (minPrice !== undefined && maxPrice !== undefined && minPrice > maxPrice) {
    errors.push('minPrice must not be greater than maxPrice');
  }
  if (query.minRam !== undefined) {
    minRam = parseInt(query.minRam, 10);
    if (isNaN(minRam) || minRam < 0) errors.push('minRam must be a non-negative integer');
  }
  return {
    errors,
    filters: { q: query.q, brand: query.brand, category: query.category, minPrice, maxPrice, minRam, sort: query.sort, page, limit },
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
  const id = parseInt(req.params.id, 10);
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

module.exports = { listProducts, getProduct };
