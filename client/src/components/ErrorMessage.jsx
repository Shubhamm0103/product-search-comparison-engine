function ErrorMessage({ message, onRetry }) {
  return (
    <div style={{
      padding: '16px',
      background: '#fdecea',
      border: '1px solid #f5c2c0',
      borderRadius: '8px',
      color: '#611a15',
      margin: '16px 0',
    }}>
      <p style={{ margin: onRetry ? '0 0 8px' : 0 }}>{message}</p>
      {onRetry && (
        <button onClick={onRetry} style={{ padding: '6px 12px' }}>
          Try again
        </button>
      )}
    </div>
  );
}

export default ErrorMessage;
