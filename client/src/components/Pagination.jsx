function Pagination({ page, pagination, onPageChange }) {
  if (!pagination) return null;

  const totalPages = Math.ceil(pagination.total / pagination.limit) || 1;
  const hasPrev = page > 1;
  const hasNext = page < totalPages;

  return (
    <div className="pagination">
      <button onClick={() => onPageChange(page - 1)} disabled={!hasPrev}>Prev</button>
      <span>Page {page} of {totalPages}</span>
      <button onClick={() => onPageChange(page + 1)} disabled={!hasNext}>Next</button>
    </div>
  );
}

export default Pagination;
