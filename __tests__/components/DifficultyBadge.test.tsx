import { screen } from '@testing-library/react';
import DifficultyBadge, { getDifficultyFromScore } from '@/components/shared/DifficultyBadge';
import { renderWithProviders } from '../utils/render-with-providers';

describe('DifficultyBadge Component', () => {
  it('renders with easy difficulty', () => {
    renderWithProviders(<DifficultyBadge level="easy" />);
    expect(screen.getByText('Easy')).toBeInTheDocument();
  });

  it('renders with medium difficulty', () => {
    renderWithProviders(<DifficultyBadge level="medium" />);
    expect(screen.getByText('Medium')).toBeInTheDocument();
  });

  it('renders with hard difficulty', () => {
    renderWithProviders(<DifficultyBadge level="hard" />);
    expect(screen.getByText('Hard')).toBeInTheDocument();
  });

  it('renders with score', () => {
    renderWithProviders(<DifficultyBadge level="medium" score={3.2} />);
    expect(screen.getByText('Medium')).toBeInTheDocument();
    expect(screen.getByText('(3.2)')).toBeInTheDocument();
  });

  it('hides label when showLabel is false', () => {
    renderWithProviders(<DifficultyBadge level="easy" showLabel={false} />);
    expect(screen.queryByText('Easy')).not.toBeInTheDocument();
  });
});

describe('getDifficultyFromScore', () => {
  it('returns easy for scores <= 2.5', () => {
    expect(getDifficultyFromScore(1)).toBe('easy');
    expect(getDifficultyFromScore(1.5)).toBe('easy');
    expect(getDifficultyFromScore(2.5)).toBe('easy');
  });

  it('returns medium for scores > 2.5 and <= 3.5', () => {
    expect(getDifficultyFromScore(2.6)).toBe('medium');
    expect(getDifficultyFromScore(3)).toBe('medium');
    expect(getDifficultyFromScore(3.5)).toBe('medium');
  });

  it('returns hard for scores > 3.5', () => {
    expect(getDifficultyFromScore(3.6)).toBe('hard');
    expect(getDifficultyFromScore(4)).toBe('hard');
    expect(getDifficultyFromScore(5)).toBe('hard');
  });
});
