import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import apiClient from '../api/client';
import ProductCard from '../components/ProductCard';
import Filters from '../components/Filters';
import SortSelect from '../components/SortSelect';
import Pagination from '../components/Pagination';
import useDebouncedValue from '../hooks/useDebouncedValue';

const PAGE_SIZE = 20;
const FILTER_KEYS = ['brand', 'category', 'minPrice', 'maxPrice', 'minRam'];

function ProductList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const query = searchParams.get('q') || '';
  const sort = searchParams.get('sort') || 'newest';
  const page = Number(searchParams.get('page')) || 1;
  const filters = {};
  FILTER_KEYS.forEach(key => {
    const val = searchParams.get(key);
    if (val) filters[key] = val;
  });

  // Local input state — typing updates this instantly (snappy UI),
  // but the URL/API only get the debounced version
  const [searchInput, setSearchInput] = useState(query);
  const debouncedSearchInput = useDebouncedValue(searchInput, 400);

  const [priceInputs, setPriceInputs] = useState({
    minPrice: filters.minPrice || '',
    maxPrice: filters.maxPrice || '',
  });
  const debouncedPriceInputs = useDebouncedValue(priceInputs, 400);

  // When the debounced search value settles, push it to the URL
  useEffect(() => {
    if (debouncedSearchInput === query) return;
    updateParams({ q: debouncedSearchInput || undefined });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearchInput]);

  // When debounced price values settle, push them to the URL
  useEffect(() => {
    const current = { minPrice: filters.minPrice || '', maxPrice: filters.maxPrice || '' };
    if (
      debouncedPriceInputs.minPrice === current.minPrice &&
      debouncedPriceInputs.maxPrice === current.maxPrice
    ) return;
    updateParams({
      minPrice: debouncedPriceInputs.minPrice || undefined,
      maxPrice: debouncedPriceInputs.maxPrice || undefined,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedPriceInputs]);

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
  }, [searchParams]);

  function updateParams(updates, resetPage = true) {
    const next = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, value]) => {
      if (value === undefined || value === '') {
        next.delete(key);
      } else {
        next.set(key, value);
      }
    });
    if (resetPage) next.delete('page');
    setSearchParams(next);
  }

  function handleFiltersChange(newFilters) {
    // brand/category/minRam go straight to the URL (they're discrete selects, no debounce needed)
    updateParams({
      brand: newFilters.brand,
      category: newFilters.category,
      minRam: newFilters.minRam,
    });
    // price stays in local debounced state
    setPriceInputs({
      minPrice: newFilters.minPrice || '',
      maxPrice: newFilters.maxPrice || '',
    });
  }

  function handleSortChange(newSort) {
    updateParams({ sort: newSort });
  }

  function handlePageChange(newPage) {
    updateParams({ page: newPage }, false);
  }

  return (
    <div style={{ padding: '24px' }}>
      <h1>Product Search & Comparison</h1>

      <input
        type="text"
        placeholder="Search brand, model, or category..."
        value={searchInput}
        onChange={e => setSearchInput(e.target.value)}
        style={{ padding: '8px', width: '300px', marginBottom: '20px' }}
      />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
        <Filters filters={{ ...filters, ...priceInputs }} onChange={handleFiltersChange} />
        <SortSelect value={sort} onChange={handleSortChange} />
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

      <Pagination page={page} pagination={pagination} onPageChange={handlePageChange} />
    </div>
  );
}

export default ProductList;
