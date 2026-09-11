function Pagination({ page, pagination, onPageChange }) {
  if (!pagination) return null;

  const totalPages = Math.ceil(pagination.total / pagination.limit) || 1;
  const hasPrev = page > 1;
  const hasNext = page < totalPages;

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      margin: '20px 0',
    }}>
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={!hasPrev}
        style={{ padding: '6px 12px' }}
      >
        Prev
      </button>

      <span>Page {page} of {totalPages}</span>

      <button
        onClick={() => onPageChange(page + 1)}
        disabled={!hasNext}
        style={{ padding: '6px 12px' }}
      >
        Next
      </button>
    </div>
  );
}

export default Pagination;
