import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../api/client';
import { useCompare } from '../context/CompareContext';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import EmptyState from '../components/EmptyState';

const ROWS = [
  { label: 'Price', key: 'price', render: p => `₹${Number(p.price).toLocaleString('en-IN')}`, numeric: true, lowerIsBetter: true },
  { label: 'Category', key: 'category', render: p => p.category },
  { label: 'Processor', key: 'processor', render: p => p.processor },
  { label: 'RAM', key: 'ram_gb', render: p => `${p.ram_gb}GB`, numeric: true, higherIsBetter: true },
  { label: 'Storage', key: 'storage_gb', render: p => `${p.storage_gb}GB ${p.storage_type}`, numeric: true, higherIsBetter: true },
  { label: 'Rating', key: 'rating', render: p => `⭐ ${p.rating ?? 'N/A'} (${p.review_count} reviews)`, numeric: true, higherIsBetter: true },
];

function allSame(products, key) {
  if (products.length < 2) return true;
  const first = products[0][key];
  return products.every(p => p[key] === first);
}

function getBestValue(products, key, higherIsBetter) {
  const values = products.map(p => Number(p[key])).filter(v => !isNaN(v));
  if (values.length === 0) return null;
  return higherIsBetter ? Math.max(...values) : Math.min(...values);
}

function ComparePage() {
  const { ids, toggle } = useCompare();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    if (ids.length === 0) {
      setProducts([]);
      setLoading(false);
      setError(null);
      return;
    }
    let isCancelled = false;
    setLoading(true);
    setError(null);

    Promise.allSettled(ids.map(id => apiClient.get(`/products/${id}`)))
      .then(results => {
        if (isCancelled) return;
        const loaded = results
          .filter(r => r.status === 'fulfilled')
          .map(r => r.value.data)
          .filter(Boolean);

        const failedCount = results.length - loaded.length;
        if (failedCount > 0) {
          setError(`${failedCount} selected product(s) could not be loaded (may no longer exist).`);
        }
        setProducts(loaded);
      })
      .finally(() => {
        if (!isCancelled) setLoading(false);
      });

    return () => { isCancelled = true; };
  }, [ids, reloadToken]);

  return (
    <div className="page" style={{ paddingBottom: '80px' }}>
      <Link to="/">&larr; Back to results</Link>
      <h1>Compare Products</h1>

      {ids.length === 0 && (
        <EmptyState
          title="Nothing to compare yet"
          message='Go back to the results and check "Compare" on 2–4 products.'
          action={<Link to="/"><button style={{ padding: '6px 12px' }}>Browse products</button></Link>}
        />
      )}

      {loading && <LoadingSpinner label="Loading comparison..." />}

      {!loading && error && (
        <ErrorMessage message={error} onRetry={() => setReloadToken(t => t + 1)} />
      )}

      {!loading && products.length > 1 && (
        <p style={{ color: '#666', fontSize: '0.9em' }}>
          <span style={{ background: '#fff3cd', padding: '2px 6px', borderRadius: '4px', marginRight: '6px' }}>Highlighted</span>
          cells differ across products.
          <span style={{ background: '#d4edda', padding: '2px 6px', borderRadius: '4px', margin: '0 6px' }}>Green</span>
          marks the best value for Price/RAM/Storage/Rating.
        </p>
      )}

      {!loading && products.length > 0 && (
        <table className="compare-table">
          <thead>
            <tr>
              <th style={{ textAlign: 'left', padding: '8px', borderBottom: '2px solid #ddd' }}></th>
              {products.map(p => (
                <th key={p.id} style={{ padding: '8px', borderBottom: '2px solid #ddd', textAlign: 'left' }}>
                  {p.brand} {p.model}
                  <br />
                  <button onClick={() => toggle(p.id)} style={{ fontSize: '0.8em', marginTop: '4px' }}>
                    Remove
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ROWS.map(row => {
              const differs = !allSame(products, row.key);
              const best = row.numeric && (row.higherIsBetter || row.lowerIsBetter)
                ? getBestValue(products, row.key, row.higherIsBetter)
                : null;

              return (
                <tr key={row.label}>
                  <td style={{ padding: '8px', color: '#666', borderBottom: '1px solid #eee' }}>{row.label}</td>
                  {products.map(p => {
                    const isBest = best !== null && Number(p[row.key]) === best && products.length > 1;
                    const bg = isBest ? '#d4edda' : (differs ? '#fff3cd' : 'transparent');
                    return (
                      <td
                        key={p.id}
                        style={{
                          padding: '8px',
                          borderBottom: '1px solid #eee',
                          background: bg,
                          fontWeight: isBest ? 'bold' : 'normal',
                        }}
                      >
                        {row.render(p)}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      )}

      {!loading && !error && products.length === 0 && ids.length > 0 && (
        <EmptyState
          title="Nothing could be loaded"
          message="None of the selected products could be loaded — they may have been removed."
        />
      )}
    </div>
  );
}

export default ComparePage;
