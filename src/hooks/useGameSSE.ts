'use client';

import { useEffect, useState, useRef } from 'react';
import type { PublicGameState } from '@/lib/types';

export function useGameSSE() {
  const [gameState, setGameState] = useState<PublicGameState | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    const eventSource = new EventSource('/api/sse/game');
    eventSourceRef.current = eventSource;

    eventSource.onopen = () => {
      setIsConnected(true);
    };

    eventSource.onmessage = (event) => {
      try {
        const state: PublicGameState = JSON.parse(event.data);
        setGameState(state);
      } catch {
        // ignore parse errors
      }
    };

    eventSource.onerror = () => {
      setIsConnected(false);
      // EventSource auto-reconnects by default
    };

    return () => {
      eventSource.close();
      eventSourceRef.current = null;
    };
  }, []);

  return { gameState, isConnected };
}
