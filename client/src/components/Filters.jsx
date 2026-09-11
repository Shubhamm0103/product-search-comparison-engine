const BRANDS = ['Dell', 'HP', 'Lenovo', 'Asus', 'Acer', 'Apple', 'MSI', 'Samsung'];
const CATEGORIES = ['Ultrabook', 'Gaming Laptop', 'Business Laptop', 'Budget Laptop', '2-in-1 Convertible'];

function Filters({ filters, onChange }) {
  function update(field, value) {
    onChange({ ...filters, [field]: value });
  }

  return (
    <div style={{
      display: 'flex',
      flexWrap: 'wrap',
      gap: '12px',
      padding: '16px',
      border: '1px solid #eee',
      borderRadius: '8px',
      marginBottom: '20px',
    }}>
      <select value={filters.brand || ''} onChange={e => update('brand', e.target.value || undefined)}>
        <option value="">All Brands</option>
        {BRANDS.map(b => <option key={b} value={b}>{b}</option>)}
      </select>

      <select value={filters.category || ''} onChange={e => update('category', e.target.value || undefined)}>
        <option value="">All Categories</option>
        {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
      </select>

      <input
        type="number"
        placeholder="Min Price"
        value={filters.minPrice || ''}
        onChange={e => update('minPrice', e.target.value || undefined)}
        style={{ width: '110px' }}
      />

      <input
        type="number"
        placeholder="Max Price"
        value={filters.maxPrice || ''}
        onChange={e => update('maxPrice', e.target.value || undefined)}
        style={{ width: '110px' }}
      />

      <select value={filters.minRam || ''} onChange={e => update('minRam', e.target.value || undefined)}>
        <option value="">Any RAM</option>
        <option value="8">8GB+</option>
        <option value="16">16GB+</option>
        <option value="32">32GB+</option>
        <option value="64">64GB+</option>
      </select>

      <button onClick={() => onChange({})} style={{ padding: '4px 12px' }}>
        Clear Filters
      </button>
    </div>
  );
}

export default Filters;
