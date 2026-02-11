'use client';

import { useState, useEffect } from 'react';
import type { PublicGameState, CardValue } from '@/lib/types';
import ParticipantList from './ParticipantList';
import VotingCards from './VotingCards';
import ResultsDisplay from './ResultsDisplay';
import AdminControls from './AdminControls';

interface GameBoardProps {
  gameState: PublicGameState;
  currentUserId: string;
  isConnected: boolean;
  onVote: (value: CardValue | null) => void;
  onReveal: () => void;
  onReset: () => void;
  onKick: (targetId: string) => void;
  onTransferAdmin: (targetId: string) => void;
  onLeave: () => void;
}

export default function GameBoard({
  gameState,
  currentUserId,
  isConnected,
  onVote,
  onReveal,
  onReset,
  onKick,
  onTransferAdmin,
  onLeave,
}: GameBoardProps) {
  const isAdmin = currentUserId === gameState.adminId;
  const currentUser = gameState.participants.find((p) => p.id === currentUserId);
  const hasVotes = gameState.participants.some((p) => p.hasVoted);

  // Track selected vote locally for immediate UI feedback
  const [selectedVote, setSelectedVote] = useState<CardValue | null>(null);

  // Sync selected vote from server state
  useEffect(() => {
    if (currentUser) {
      if (gameState.isRevealed) {
        setSelectedVote(currentUser.vote);
      } else if (!currentUser.hasVoted) {
        setSelectedVote(null);
      }
    }
  }, [currentUser, gameState.isRevealed]);

  // Reset selected vote on new round
  useEffect(() => {
    if (!gameState.isRevealed) {
      const me = gameState.participants.find((p) => p.id === currentUserId);
      if (me && !me.hasVoted) {
        setSelectedVote(null);
      }
    }
  }, [gameState.roundNumber, gameState.isRevealed, gameState.participants, currentUserId]);

  const handleVote = (value: CardValue | null) => {
    setSelectedVote(value);
    onVote(value);
  };

  return (
    <div className="flex min-h-screen flex-col">
      {/* Top bar */}
      <header className="flex items-center justify-between border-b border-casino-border bg-casino-dark px-4 py-3 sm:px-6">
        <div className="flex items-center gap-4">
          <h1 className="font-display text-xl font-bold">
            <span className="gold-shimmer">Scrum Poker</span>
          </h1>
          <div className="hidden sm:block h-4 w-px bg-casino-border" />
          <span className="hidden sm:block text-sm text-casino-muted">
            Round {gameState.roundNumber}
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Connection status */}
          <div className="flex items-center gap-1.5">
            <div
              className={`h-2 w-2 rounded-full ${
                isConnected ? 'bg-green-400' : 'bg-casino-red'
              }`}
            />
            <span className="text-xs text-casino-muted hidden sm:inline">
              {isConnected ? 'Connected' : 'Reconnecting...'}
            </span>
          </div>

          {/* Leave button */}
          <button
            onClick={onLeave}
            className="rounded-lg border border-casino-border px-3 py-1.5 text-xs text-casino-muted transition-colors hover:border-casino-red/50 hover:text-casino-red-light"
          >
            Leave Table
          </button>
        </div>
      </header>

      {/* Main content */}
      <div className="flex flex-1 flex-col lg:flex-row">
        {/* Sidebar: Participants */}
        <aside className="w-full border-b border-casino-border bg-casino-dark p-4 lg:w-72 lg:border-b-0 lg:border-r lg:overflow-y-auto">
          <ParticipantList
            gameState={gameState}
            currentUserId={currentUserId}
            onKick={onKick}
            onTransferAdmin={onTransferAdmin}
          />
        </aside>

        {/* Main area: Table */}
        <main className="flex flex-1 flex-col">
          {/* Felt table area */}
          <div className="flex flex-1 items-center justify-center p-6">
            <div className="felt-bg w-full max-w-2xl rounded-3xl border-4 border-gold-900/30 p-8 shadow-[inset_0_2px_20px_rgba(0,0,0,0.5)]">
              {gameState.isRevealed && gameState.results ? (
                <ResultsDisplay results={gameState.results} />
              ) : (
                <div className="flex flex-col items-center gap-6 py-8">
                  {/* Waiting state */}
                  <div className="text-center">
                    <div className="font-display text-2xl font-semibold text-gold-400/80 mb-2">
                      {hasVotes ? 'Votes Coming In...' : 'Place Your Bets'}
                    </div>
                    <p className="text-sm text-green-200/60">
                      {gameState.participants.filter((p) => p.hasVoted).length} of{' '}
                      {gameState.participants.length} players have voted
                    </p>
                  </div>

                  {/* Voting progress chips */}
                  <div className="flex flex-wrap justify-center gap-3">
                    {gameState.participants.map((p) => (
                      <div
                        key={p.id}
                        className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs ${
                          p.hasVoted
                            ? 'bg-gold-400/15 text-gold-400 border border-gold-400/30'
                            : 'bg-casino-dark/50 text-casino-muted border border-casino-border'
                        }`}
                      >
                        {p.hasVoted && <span className="inline-block h-1.5 w-1.5 rounded-full bg-gold-400" />}
                        {p.name}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Admin controls centered on the table */}
              {isAdmin && (
                <div className="mt-6 flex justify-center">
                  <AdminControls
                    isRevealed={gameState.isRevealed}
                    hasVotes={hasVotes}
                    onReveal={onReveal}
                    onReset={onReset}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Bottom: Your hand */}
          <div className="border-t border-casino-border bg-casino-dark p-4 sm:p-6">
            <div className="mx-auto max-w-3xl">
              <div className="mb-3 text-center text-xs text-casino-muted font-medium uppercase tracking-wider">
                Your Hand
              </div>
              <VotingCards
                selectedValue={selectedVote}
                onVote={handleVote}
                disabled={gameState.isRevealed}
              />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
