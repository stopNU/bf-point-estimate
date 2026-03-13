'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import type { PublicGameState } from '@/lib/types';
import { soundService } from '@/lib/sound-service';

/**
 * Detects game state transitions and triggers the appropriate sounds.
 * Also exposes mute state and toggle for the UI.
 */
export function useSoundEffects(gameState: PublicGameState | null) {
  const prevStateRef = useRef<PublicGameState | null>(null);
  const [isMuted, setIsMuted] = useState(() => soundService.muted);
  const initializedRef = useRef(false);

  const toggleMute = useCallback(() => {
    const newVal = soundService.toggleMute();
    setIsMuted(newVal);
  }, []);

  useEffect(() => {
    if (!gameState) return;

    const prev = prevStateRef.current;

    // Skip sounds on initial load (first state received)
    if (!initializedRef.current) {
      initializedRef.current = true;
      prevStateRef.current = gameState;
      return;
    }

    if (prev) {
      // Cards revealed
      if (!prev.isRevealed && gameState.isRevealed) {
        soundService.playReveal();
        // Check for consensus after a brief delay so reveal sound plays first
        if (gameState.results?.consensus) {
          setTimeout(() => soundService.playConsensus(), 400);
        }
      }

      // New round started
      if (gameState.roundNumber > prev.roundNumber) {
        soundService.playNewRound();
      }

      // Player joined (participant count increased)
      if (gameState.participants.length > prev.participants.length) {
        soundService.playJoin();
      }

      // Player left (participant count decreased)
      if (gameState.participants.length < prev.participants.length) {
        soundService.playLeave();
      }
    }

    prevStateRef.current = gameState;
  }, [gameState]);

  return { isMuted, toggleMute };
}
