'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useGameSSE } from '@/hooks/useGameSSE';
import { useGameActions } from '@/hooks/useGameActions';
import GameBoard from '@/components/GameBoard';

export default function GamePage() {
  const router = useRouter();
  const { gameState, isConnected } = useGameSSE();
  const { vote, reveal, reset, kick, transferAdmin, leave } = useGameActions();
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    const id = localStorage.getItem('participantId');
    if (!id) {
      router.replace('/');
      return;
    }
    setCurrentUserId(id);
  }, [router]);

  // If we have game state and our ID isn't in the participants list,
  // the server probably restarted — redirect to join
  useEffect(() => {
    if (gameState && currentUserId) {
      const isInGame = gameState.participants.some((p) => p.id === currentUserId);
      if (!isInGame) {
        localStorage.removeItem('participantId');
        router.replace('/');
      }
    }
  }, [gameState, currentUserId, router]);

  const handleLeave = async () => {
    await leave();
    router.replace('/');
  };

  if (!currentUserId || !gameState) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="font-display text-xl text-gold-400 animate-pulse">
            Joining the table...
          </div>
          <div className="flex gap-2 text-casino-muted">
            <span className="animate-bounce" style={{ animationDelay: '0ms' }}>♠</span>
            <span className="animate-bounce" style={{ animationDelay: '100ms' }}>♥</span>
            <span className="animate-bounce" style={{ animationDelay: '200ms' }}>♦</span>
            <span className="animate-bounce" style={{ animationDelay: '300ms' }}>♣</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <GameBoard
      gameState={gameState}
      currentUserId={currentUserId}
      isConnected={isConnected}
      onVote={vote}
      onReveal={reveal}
      onReset={reset}
      onKick={kick}
      onTransferAdmin={transferAdmin}
      onLeave={handleLeave}
    />
  );
}
