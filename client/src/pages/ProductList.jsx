import { useEffect, useState } from 'react';
import apiClient from '../api/client';
import ProductCard from '../components/ProductCard';

function ProductList() {
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [searchInput, setSearchInput] = useState('');
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isCancelled = false;
    setLoading(true);
    setError(null);

    apiClient.get('/products', { params: { q: query || undefined, limit: 20 } })
      .then(res => {
        if (isCancelled) return;
        setProducts(res.data.data);
        setPagination(res.data.pagination);
      })
      .catch(err => {
        if (isCancelled) return;
        setError('Failed to load products. Is the backend server running?');
        console.error(err);
      })
      .finally(() => {
        if (!isCancelled) setLoading(false);
      });

    return () => { isCancelled = true; };
  }, [query]);

  function handleSubmit(e) {
    e.preventDefault();
    setQuery(searchInput);
  }

  return (
    <div style={{ padding: '24px' }}>
      <h1>Product Search & Comparison</h1>

      <form onSubmit={handleSubmit} style={{ marginBottom: '20px' }}>
        <input
          type="text"
          placeholder="Search brand, model, or category..."
          value={searchInput}
          onChange={e => setSearchInput(e.target.value)}
          style={{ padding: '8px', width: '300px', marginRight: '8px' }}
        />
        <button type="submit" style={{ padding: '8px 16px' }}>Search</button>
      </form>

      {loading && <p>Loading products...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {!loading && !error && products.length === 0 && (
        <p>No products found.</p>
      )}

      {!loading && !error && pagination && (
        <p style={{ color: '#666' }}>
          Showing {products.length} of {pagination.total} results
        </p>
      )}

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
        {products.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}

export default ProductList;
