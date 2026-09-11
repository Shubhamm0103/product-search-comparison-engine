import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import apiClient from '../api/client';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';

function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    let isCancelled = false;
    setLoading(true);
    setError(null);
    setProduct(null);

    apiClient.get(`/products/${id}`)
      .then(res => {
        if (isCancelled) return;
        setProduct(res.data);
      })
      .catch(err => {
        if (isCancelled) return;
        setError(
          err.response?.status === 404
            ? 'Product not found.'
            : 'Failed to load product. Is the backend server running?'
        );
        console.error(err);
      })
      .finally(() => {
        if (!isCancelled) setLoading(false);
      });

    return () => { isCancelled = true; };
  }, [id, reloadToken]);

  return (
    <div className="page detail-page">
      <Link to="/">&larr; Back to results</Link>

      {loading && <LoadingSpinner label="Loading product..." />}

      {!loading && error && (
        <ErrorMessage
          message={error}
          onRetry={error.includes('not found') ? undefined : () => setReloadToken(t => t + 1)}
        />
      )}

      {!loading && !error && product && (
        <div style={{ marginTop: '16px' }}>
          <h1 style={{ marginBottom: '4px' }}>{product.brand} {product.model}</h1>
          <p style={{ color: '#666', marginTop: 0 }}>{product.category}</p>
          <p className="detail-price">₹{Number(product.price).toLocaleString('en-IN')}</p>
          <p>⭐ {product.rating ?? 'N/A'} ({product.review_count} reviews)</p>

          <table className="detail-table">
            <tbody>
              <tr><td>Processor</td><td>{product.processor}</td></tr>
              <tr><td>RAM</td><td>{product.ram_gb}GB</td></tr>
              <tr><td>Storage</td><td>{product.storage_gb}GB {product.storage_type}</td></tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default ProductDetail;
