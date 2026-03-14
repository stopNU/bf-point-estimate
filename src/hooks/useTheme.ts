'use client';

import { useState, useCallback, useEffect } from 'react';

export type Theme = 'casino' | 'cosmoswin';

function loadCosmoswinFonts() {
  if (typeof document === 'undefined') return;
  if (document.getElementById('cosmoswin-fonts')) return;
  const link = document.createElement('link');
  link.id = 'cosmoswin-fonts';
  link.rel = 'stylesheet';
  link.href =
    'https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Share+Tech+Mono&family=Rajdhani:wght@600;700&display=swap';
  document.head.appendChild(link);
}

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window === 'undefined') return 'casino';
    return (localStorage.getItem('bf-theme') as Theme) ?? 'casino';
  });

  // Apply theme on initial load (in case SSR rendered without data-theme)
  useEffect(() => {
    if (theme === 'cosmoswin') {
      document.documentElement.setAttribute('data-theme', 'cosmoswin');
      loadCosmoswinFonts();
    }
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      const next: Theme = prev === 'casino' ? 'cosmoswin' : 'casino';
      localStorage.setItem('bf-theme', next);

      // Smooth transition
      document.documentElement.classList.add('cosmos-transitioning');
      setTimeout(() => {
        document.documentElement.classList.remove('cosmos-transitioning');
      }, 300);

      if (next === 'cosmoswin') {
        document.documentElement.setAttribute('data-theme', 'cosmoswin');
        loadCosmoswinFonts();
      } else {
        document.documentElement.removeAttribute('data-theme');
      }
      return next;
    });
  }, []);

  return { theme, toggleTheme, isCosmos: theme === 'cosmoswin' };
}
