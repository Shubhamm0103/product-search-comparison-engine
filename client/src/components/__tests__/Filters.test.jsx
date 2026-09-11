import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Filters from '../Filters';

describe('Filters', () => {
  it('calls onChange with updated brand when a brand is selected', () => {
    const handleChange = vi.fn();
    render(<Filters filters={{}} onChange={handleChange} />);

    fireEvent.change(screen.getByDisplayValue('All Brands'), {
      target: { value: 'Dell' },
    });

    expect(handleChange).toHaveBeenCalledWith(
      expect.objectContaining({ brand: 'Dell' })
    );
  });

  it('calls onChange with an empty object when Clear Filters is clicked', () => {
    const handleChange = vi.fn();
    render(<Filters filters={{ brand: 'Dell', minRam: '16' }} onChange={handleChange} />);

    fireEvent.click(screen.getByText('Clear Filters'));

    expect(handleChange).toHaveBeenCalledWith({});
  });

  it('reflects the currently active filters', () => {
    render(<Filters filters={{ brand: 'HP' }} onChange={() => {}} />);
    expect(screen.getByDisplayValue('HP')).toBeInTheDocument();
  });
});
