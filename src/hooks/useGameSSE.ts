'use client';

import { useEffect, useState, useRef } from 'react';
import type { PublicGameState } from '@/lib/types';

export function useGameSSE() {
  const [gameState, setGameState] = useState<PublicGameState | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isReconnecting, setIsReconnecting] = useState(false);
  const eventSourceRef = useRef<EventSource | null>(null);
  const prevGameStateRef = useRef<PublicGameState | null>(null);
  const currentUserIdRef = useRef<string | null>(null);

  useEffect(() => {
    // Get participantId from localStorage for online tracking
    const participantId = typeof window !== 'undefined'
      ? localStorage.getItem('participantId') ?? ''
      : '';
    currentUserIdRef.current = participantId || null;

    const url = participantId
      ? `/api/sse/game?participantId=${participantId}`
      : '/api/sse/game';

    const eventSource = new EventSource(url);
    eventSourceRef.current = eventSource;

    eventSource.onopen = () => {
      setIsConnected(true);
      setIsReconnecting(false);
    };

    eventSource.onmessage = (event) => {
      try {
        const state: PublicGameState = JSON.parse(event.data);
        prevGameStateRef.current = state;
        setGameState(state);
      } catch {
        // ignore parse errors
      }
    };

    eventSource.onerror = () => {
      setIsConnected(false);
      setIsReconnecting(true);
      // EventSource auto-reconnects by default
    };

    return () => {
      eventSource.close();
      eventSourceRef.current = null;
    };
  }, []);

  return { gameState, isConnected, isReconnecting };
}
