import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { CompareProvider } from '../../context/CompareContext';
import ProductCard from '../ProductCard';

const mockProduct = {
  id: 1,
  brand: 'Dell',
  model: 'XPS 15',
  category: 'Ultrabook',
  price: 89999,
  rating: 4.5,
  review_count: 120,
  processor: 'Intel Core i7-13700H',
  ram_gb: 16,
  storage_gb: 512,
  storage_type: 'SSD',
};

function renderWithProviders(ui) {
  return render(
    <MemoryRouter>
      <CompareProvider>{ui}</CompareProvider>
    </MemoryRouter>
  );
}

describe('ProductCard', () => {
  it('renders key product details', () => {
    renderWithProviders(<ProductCard product={mockProduct} />);

    expect(screen.getByText('Dell XPS 15')).toBeInTheDocument();
    expect(screen.getByText('Ultrabook')).toBeInTheDocument();
    expect(screen.getByText(/89,999/)).toBeInTheDocument();
    expect(screen.getByText('Intel Core i7-13700H')).toBeInTheDocument();
    expect(screen.getByText(/16GB RAM/)).toBeInTheDocument();
  });

  it('links to the correct product detail page', () => {
    renderWithProviders(<ProductCard product={mockProduct} />);
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/products/1');
  });

  it('toggles the compare checkbox on click', () => {
    renderWithProviders(<ProductCard product={mockProduct} />);
    const checkbox = screen.getByRole('checkbox', { name: /compare/i });

    expect(checkbox).not.toBeChecked();
    fireEvent.click(checkbox);
    expect(checkbox).toBeChecked();
    fireEvent.click(checkbox);
    expect(checkbox).not.toBeChecked();
  });
});
