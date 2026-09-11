import { useEffect, useState } from 'react';
import apiClient from '../api/client';
import ProductCard from '../components/ProductCard';
import Filters from '../components/Filters';
import SortSelect from '../components/SortSelect';
import Pagination from '../components/Pagination';

const PAGE_SIZE = 20;

function ProductList() {
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [searchInput, setSearchInput] = useState('');
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState({});
  const [sort, setSort] = useState('newest');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isCancelled = false;
    setLoading(true);
    setError(null);

    apiClient.get('/products', {
      params: {
        q: query || undefined,
        limit: PAGE_SIZE,
        offset: (page - 1) * PAGE_SIZE,
        sort,
        ...filters,
      },
    })
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
  }, [query, filters, sort, page]);

  // Any time search/filters/sort change, snap back to page 1
  useEffect(() => {
    setPage(1);
  }, [query, filters, sort]);

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

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
        <Filters filters={filters} onChange={setFilters} />
        <SortSelect value={sort} onChange={setSort} />
      </div>

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

      <Pagination page={page} pagination={pagination} onPageChange={setPage} />
    </div>
  );
}

export default ProductList;
