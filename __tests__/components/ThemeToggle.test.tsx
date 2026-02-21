import { screen, fireEvent } from '@testing-library/react';
import { ThemeToggle } from '@/components/shared/ThemeToggle';
import { renderWithProviders } from '../utils/render-with-providers';

// Mock next-themes with state
const mockSetTheme = jest.fn();
jest.mock('next-themes', () => ({
  useTheme: () => ({
    theme: 'light',
    setTheme: mockSetTheme,
    resolvedTheme: 'light',
  }),
  ThemeProvider: ({ children }: { children: React.ReactNode }) => children,
}));

describe('ThemeToggle Component', () => {
  beforeEach(() => {
    mockSetTheme.mockClear();
  });

  it('renders the theme toggle button', () => {
    renderWithProviders(<ThemeToggle />);

    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
  });

  it('has accessible label', () => {
    renderWithProviders(<ThemeToggle />);

    expect(screen.getByRole('button', { name: /tema|theme/i })).toBeInTheDocument();
  });

  it('calls setTheme when clicked', () => {
    renderWithProviders(<ThemeToggle />);

    const button = screen.getByRole('button');
    fireEvent.click(button);

    expect(mockSetTheme).toHaveBeenCalled();
  });
});
