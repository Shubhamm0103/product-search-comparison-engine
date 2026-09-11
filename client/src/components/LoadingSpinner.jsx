function LoadingSpinner({ label = 'Loading...' }) {
  return (
    <div style={{ padding: '24px', textAlign: 'center', color: '#666' }}>
      <div
        style={{
          border: '3px solid #eee',
          borderTop: '3px solid #333',
          borderRadius: '50%',
          width: '28px',
          height: '28px',
          margin: '0 auto 8px',
          animation: 'spin 0.8s linear infinite',
        }}
      />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <p style={{ margin: 0 }}>{label}</p>
    </div>
  );
}

export default LoadingSpinner;
