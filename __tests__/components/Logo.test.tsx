import { screen } from '@testing-library/react';
import Logo from '@/components/shared/Logo';
import { renderWithProviders } from '../utils/render-with-providers';

describe('Logo Component', () => {
  it('renders the logo text correctly', () => {
    renderWithProviders(<Logo />);

    expect(screen.getByText('ODTÜ')).toBeInTheDocument();
    expect(screen.getByText('Pusula')).toBeInTheDocument();
  });

  it('renders with different sizes', () => {
    const { rerender } = renderWithProviders(<Logo size="sm" />);
    expect(screen.getByText('ODTÜ')).toBeInTheDocument();

    rerender(<Logo size="md" />);
    expect(screen.getByText('ODTÜ')).toBeInTheDocument();

    rerender(<Logo size="lg" />);
    expect(screen.getByText('ODTÜ')).toBeInTheDocument();
  });

  it('renders as a link by default', () => {
    renderWithProviders(<Logo />);

    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/');
  });

  it('hides Pusula text when showText is false', () => {
    renderWithProviders(<Logo showText={false} />);

    expect(screen.getByText('ODTÜ')).toBeInTheDocument();
    expect(screen.queryByText('Pusula')).not.toBeInTheDocument();
  });
});
