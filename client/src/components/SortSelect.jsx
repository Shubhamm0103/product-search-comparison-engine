const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'rating_desc', label: 'Top Rated' },
];

function SortSelect({ value, onChange }) {
  return (
    <select
      value={value || 'newest'}
      onChange={e => onChange(e.target.value)}
      style={{ padding: '6px' }}
    >
      {SORT_OPTIONS.map(opt => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  );
}

export default SortSelect;
