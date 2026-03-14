'use client';

import { useTheme } from '@/hooks/useTheme';

export default function ThemeToggle() {
  const { isCosmos, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      aria-label={isCosmos ? 'Switch to Casino theme' : 'Switch to Cosmoswin theme'}
      className={isCosmos ? 'cosmos-theme-toggle' : 'casino-theme-toggle'}
    >
      <span aria-hidden="true">{isCosmos ? '♠' : '★'}</span>
      <span>{isCosmos ? 'CASINO' : 'COSMOS'}</span>
    </button>
  );
}
