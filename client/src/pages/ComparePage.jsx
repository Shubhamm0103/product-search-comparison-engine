import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../api/client';
import { useCompare } from '../context/CompareContext';

const ROWS = [
  { label: 'Price', render: p => `₹${Number(p.price).toLocaleString('en-IN')}` },
  { label: 'Category', render: p => p.category },
  { label: 'Processor', render: p => p.processor },
  { label: 'RAM', render: p => `${p.ram_gb}GB` },
  { label: 'Storage', render: p => `${p.storage_gb}GB ${p.storage_type}` },
  { label: 'Rating', render: p => `⭐ ${p.rating ?? 'N/A'} (${p.review_count} reviews)` },
];

function ComparePage() {
  const { ids, toggle } = useCompare();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (ids.length === 0) {
      setProducts([]);
      setLoading(false);
      return;
    }
    let isCancelled = false;
    setLoading(true);
    setError(null);

    Promise.all(ids.map(id => apiClient.get(`/products/${id}`)))
      .then(responses => {
        if (isCancelled) return;
        setProducts(responses.map(res => res.data.data));
      })
      .catch(err => {
        if (isCancelled) return;
        setError('Failed to load one or more products.');
        console.error(err);
      })
      .finally(() => {
        if (!isCancelled) setLoading(false);
      });

    return () => { isCancelled = true; };
  }, [ids]);

  return (
    <div style={{ padding: '24px', paddingBottom: '80px' }}>
      <Link to="/">&larr; Back to results</Link>
      <h1>Compare Products</h1>

      {ids.length === 0 && <p>No products selected. Go back and check "Compare" on a few products.</p>}
      {loading && <p>Loading comparison...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {!loading && !error && products.length > 0 && (
        <table style={{ borderCollapse: 'collapse', width: '100%' }}>
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
            {ROWS.map(row => (
              <tr key={row.label}>
                <td style={{ padding: '8px', color: '#666', borderBottom: '1px solid #eee' }}>{row.label}</td>
                {products.map(p => (
                  <td key={p.id} style={{ padding: '8px', borderBottom: '1px solid #eee' }}>
                    {row.render(p)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default ComparePage;
