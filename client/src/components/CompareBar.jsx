import { useNavigate, useLocation } from 'react-router-dom';
import { useCompare } from '../context/CompareContext';

function CompareBar() {
  const { ids, clear } = useCompare();
  const navigate = useNavigate();
  const location = useLocation();

  if (ids.length === 0 || location.pathname === '/compare') return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      background: '#222',
      color: '#fff',
      padding: '12px 24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
    }}>
      <span>{ids.length} product{ids.length > 1 ? 's' : ''} selected to compare</span>
      <div style={{ display: 'flex', gap: '12px' }}>
        <button onClick={clear} style={{ padding: '6px 12px' }}>Clear</button>
        <button
          onClick={() => navigate('/compare')}
          disabled={ids.length < 2}
          style={{ padding: '6px 12px' }}
        >
          Compare ({ids.length})
        </button>
      </div>
    </div>
  );
}

export default CompareBar;
