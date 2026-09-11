import { Link } from 'react-router-dom';

function ProductCard({ product }) {
  return (
    <Link
      to={`/products/${product.id}`}
      style={{
        border: '1px solid #ddd',
        borderRadius: '8px',
        padding: '16px',
        width: '260px',
        display: 'block',
        color: 'inherit',
        textDecoration: 'none',
      }}
    >
      <h3 style={{ margin: '0 0 8px' }}>{product.brand} {product.model}</h3>
      <p style={{ margin: '4px 0', color: '#666' }}>{product.category}</p>
      <p style={{ margin: '4px 0' }}><strong>₹{Number(product.price).toLocaleString('en-IN')}</strong></p>
      <p style={{ margin: '4px 0' }}>{product.processor}</p>
      <p style={{ margin: '4px 0' }}>{product.ram_gb}GB RAM · {product.storage_gb}GB {product.storage_type}</p>
      <p style={{ margin: '4px 0' }}>⭐ {product.rating ?? 'N/A'} ({product.review_count} reviews)</p>
    </Link>
  );
}

export default ProductCard;
