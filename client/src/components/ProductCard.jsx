import { Link } from 'react-router-dom';
import { useCompare } from '../context/CompareContext';

function ProductCard({ product }) {
  const { toggle, isSelected } = useCompare();
  const selected = isSelected(product.id);

  return (
    <div style={{
      border: selected ? '2px solid #333' : '1px solid #ddd',
      borderRadius: '8px',
      padding: '16px',
      width: '260px',
    }}>
      <Link
        to={`/products/${product.id}`}
        style={{ color: 'inherit', textDecoration: 'none' }}
      >
        <h3 style={{ margin: '0 0 8px' }}>{product.brand} {product.model}</h3>
        <p style={{ margin: '4px 0', color: '#666' }}>{product.category}</p>
        <p style={{ margin: '4px 0' }}><strong>₹{Number(product.price).toLocaleString('en-IN')}</strong></p>
        <p style={{ margin: '4px 0' }}>{product.processor}</p>
        <p style={{ margin: '4px 0' }}>{product.ram_gb}GB RAM · {product.storage_gb}GB {product.storage_type}</p>
        <p style={{ margin: '4px 0' }}>⭐ {product.rating ?? 'N/A'} ({product.review_count} reviews)</p>
      </Link>

      <label style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px', fontSize: '0.9em' }}>
        <input
          type="checkbox"
          checked={selected}
          onChange={() => toggle(product.id)}
        />
        Compare
      </label>
    </div>
  );
}

export default ProductCard;
