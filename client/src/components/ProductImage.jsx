import useWikipediaImage from '../hooks/useWikipediaImage';

const CATEGORY_COLORS = {
  'Ultrabook': '#3b82f6',
  'Gaming Laptop': '#ef4444',
  'Business Laptop': '#64748b',
  'Budget Laptop': '#22c55e',
  '2-in-1 Convertible': '#a855f7',
};

function getColor(category) {
  return CATEGORY_COLORS[category] || '#94a3b8';
}

function FallbackIcon({ color }) {
  return (
    <svg width="56%" height="56%" viewBox="0 0 64 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="10" y="4" width="44" height="30" rx="3" fill={color} fillOpacity="0.85" />
      <rect x="13" y="7" width="38" height="22" rx="1.5" fill="white" fillOpacity="0.25" />
      <path d="M4 38 L60 38 L64 46 L0 46 Z" fill={color} />
      <rect x="26" y="40" width="12" height="2.5" rx="1.25" fill="white" fillOpacity="0.5" />
    </svg>
  );
}

function ProductImage({ product, size = 'card' }) {
  const imageUrl = useWikipediaImage(product.brand);
  const color = getColor(product.category);
  const height = size === 'detail' ? '220px' : '140px';

  return (
    <div
      style={{
        width: '100%',
        height,
        borderRadius: '8px',
        overflow: 'hidden',
        marginBottom: '12px',
        background: `linear-gradient(135deg, ${color}22, ${color}11)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={`Real ${product.brand} laptop`}
          style={{ width: '100%', height: '100%', objectFit: 'contain', padding: size === 'detail' ? '20px' : '10px' }}
          loading="lazy"
        />
      ) : (
        <FallbackIcon color={color} />
      )}
    </div>
  );
}

export default ProductImage;
