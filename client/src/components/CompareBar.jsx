import { useNavigate, useLocation } from 'react-router-dom';
import { useCompare } from '../context/CompareContext';

function CompareBar() {
  const { ids, clear } = useCompare();
  const navigate = useNavigate();
  const location = useLocation();

  if (ids.length === 0 || location.pathname === '/compare') return null;

  return (
    <div className="compare-bar">
      <span>{ids.length} product{ids.length > 1 ? 's' : ''} selected to compare</span>
      <div style={{ display: 'flex', gap: '12px' }}>
        <button onClick={clear}>Clear</button>
        <button onClick={() => navigate('/compare')} disabled={ids.length < 2}>
          Compare ({ids.length})
        </button>
      </div>
    </div>
  );
}

export default CompareBar;
