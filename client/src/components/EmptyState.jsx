function EmptyState({ title, message, action }) {
  return (
    <div style={{
      padding: '40px 20px',
      textAlign: 'center',
      color: '#666',
      border: '1px dashed #ddd',
      borderRadius: '8px',
      margin: '16px 0',
    }}>
      <p style={{ fontSize: '1.1em', fontWeight: 'bold', margin: '0 0 4px', color: '#333' }}>{title}</p>
      <p style={{ margin: '0 0 12px' }}>{message}</p>
      {action}
    </div>
  );
}

export default EmptyState;
