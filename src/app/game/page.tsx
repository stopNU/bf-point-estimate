'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useGameSSE } from '@/hooks/useGameSSE';
import { useGameActions } from '@/hooks/useGameActions';
import { useToast } from '@/hooks/useToast';
import GameBoard from '@/components/GameBoard';

export default function GamePage() {
  const router = useRouter();
  const { gameState, isConnected, isReconnecting } = useGameSSE();
  const { vote, reveal, reset, kick, transferAdmin, leave, setStory } = useGameActions();
  const { addToast } = useToast();
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [wasConnected, setWasConnected] = useState(false);

  useEffect(() => {
    const id = localStorage.getItem('participantId');
    if (!id) {
      router.replace('/');
      return;
    }
    setCurrentUserId(id);
  }, [router]);

  // Toast on disconnect / reconnect
  useEffect(() => {
    if (isConnected && wasConnected === false) {
      // Don't toast on first connect
    } else if (!isConnected && isReconnecting) {
      addToast({
        type: 'disconnected',
        title: 'Connection lost',
        body: 'Trying to reconnect...',
        persistent: true,
      });
    } else if (isConnected && wasConnected === true) {
      addToast({
        type: 'reconnected',
        title: 'Reconnected',
        persistent: false,
        dismissAfter: 3000,
      });
    }
    setWasConnected(isConnected);
  }, [isConnected]); // eslint-disable-line react-hooks/exhaustive-deps

  // If we have game state and our ID isn't in the participants list,
  // the server probably restarted — show session-expired toast and redirect
  useEffect(() => {
    if (gameState && currentUserId) {
      const isInGame = gameState.participants.some((p) => p.id === currentUserId);
      if (!isInGame) {
        localStorage.removeItem('participantId');
        addToast({
          type: 'session-expired',
          title: 'Session expired',
          body: 'The server was restarted. Please rejoin.',
          persistent: true,
          action: {
            label: 'Rejoin',
            onClick: () => router.replace('/'),
          },
        });
        router.replace('/');
      }
    }
  }, [gameState, currentUserId, router]); // eslint-disable-line react-hooks/exhaustive-deps

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
      isReconnecting={isReconnecting}
      onVote={vote}
      onReveal={reveal}
      onReset={reset}
      onKick={kick}
      onTransferAdmin={transferAdmin}
      onLeave={handleLeave}
      onSetStory={setStory}
    />
  );
}
