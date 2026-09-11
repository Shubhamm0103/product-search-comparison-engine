import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import apiClient from '../api/client';
import ProductCard from '../components/ProductCard';
import Filters from '../components/Filters';
import SortSelect from '../components/SortSelect';
import Pagination from '../components/Pagination';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import EmptyState from '../components/EmptyState';
import useDebouncedValue from '../hooks/useDebouncedValue';

const PAGE_SIZE = 20;
const FILTER_KEYS = ['brand', 'category', 'minPrice', 'maxPrice', 'minRam'];

function ProductList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reloadToken, setReloadToken] = useState(0);

  const query = searchParams.get('q') || '';
  const sort = searchParams.get('sort') || 'newest';
  const page = Number(searchParams.get('page')) || 1;
  const filters = {};
  FILTER_KEYS.forEach(key => {
    const val = searchParams.get(key);
    if (val) filters[key] = val;
  });

  const hasActiveSearchOrFilters = Boolean(query) || Object.keys(filters).length > 0;

  const [searchInput, setSearchInput] = useState(query);
  const debouncedSearchInput = useDebouncedValue(searchInput, 400);

  const [priceInputs, setPriceInputs] = useState({
    minPrice: filters.minPrice || '',
    maxPrice: filters.maxPrice || '',
  });
  const debouncedPriceInputs = useDebouncedValue(priceInputs, 400);

  useEffect(() => {
    if (debouncedSearchInput === query) return;
    updateParams({ q: debouncedSearchInput || undefined });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearchInput]);

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
  }, [searchParams, reloadToken]);

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
    updateParams({
      brand: newFilters.brand,
      category: newFilters.category,
      minRam: newFilters.minRam,
    });
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

  function clearSearchAndFilters() {
    setSearchInput('');
    setPriceInputs({ minPrice: '', maxPrice: '' });
    setSearchParams(new URLSearchParams());
  }

  return (
    <div className="page">
      <h1 className="page-title">Product Search & Comparison</h1>

      <input
        className="search-input"
        type="text"
        placeholder="Search brand, model, or category..."
        value={searchInput}
        onChange={e => setSearchInput(e.target.value)}
      />

      <div className="toolbar">
        <Filters filters={{ ...filters, ...priceInputs }} onChange={handleFiltersChange} />
        <SortSelect value={sort} onChange={handleSortChange} />
      </div>

      {loading && <LoadingSpinner label="Loading products..." />}

      {!loading && error && (
        <ErrorMessage message={error} onRetry={() => setReloadToken(t => t + 1)} />
      )}

      {!loading && !error && products.length === 0 && hasActiveSearchOrFilters && (
        <EmptyState
          title="No products match your search"
          message="Try adjusting your filters or searching for something else."
          action={<button onClick={clearSearchAndFilters}>Clear search & filters</button>}
        />
      )}

      {!loading && !error && products.length === 0 && !hasActiveSearchOrFilters && (
        <EmptyState
          title="No products available"
          message="The catalog appears to be empty right now."
        />
      )}

      {!loading && !error && pagination && products.length > 0 && (
        <p className="results-count">
          Showing {products.length} of {pagination.total} results
        </p>
      )}

      {!loading && !error && products.length > 0 && (
        <div className="product-grid">
          {products.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

      {!loading && !error && products.length > 0 && (
        <Pagination page={page} pagination={pagination} onPageChange={handlePageChange} />
      )}
    </div>
  );
}

export default ProductList;
