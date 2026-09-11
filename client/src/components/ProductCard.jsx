import { Link } from 'react-router-dom';
import { useCompare } from '../context/CompareContext';

function ProductCard({ product }) {
  const { toggle, isSelected } = useCompare();
  const selected = isSelected(product.id);

  return (
    <div className={`product-card${selected ? ' selected' : ''}`}>
      <Link to={`/products/${product.id}`} style={{ color: 'inherit', textDecoration: 'none' }}>
        <h3>{product.brand} {product.model}</h3>
        <p className="category">{product.category}</p>
        <p className="price">₹{Number(product.price).toLocaleString('en-IN')}</p>
        <p>{product.processor}</p>
        <p>{product.ram_gb}GB RAM · {product.storage_gb}GB {product.storage_type}</p>
        <p>⭐ {product.rating ?? 'N/A'} ({product.review_count} reviews)</p>
      </Link>

      <label className="compare-checkbox">
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
