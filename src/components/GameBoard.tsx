'use client';

import { useState, useEffect, useCallback } from 'react';
import type { PublicGameState, CardValue } from '@/lib/types';
import ParticipantList from './ParticipantList';
import VotingCards from './VotingCards';
import ResultsDisplay from './ResultsDisplay';
import AdminControlBar from './AdminControlBar';
import GameHeader from './GameHeader';
import StoryBanner from './StoryBanner';
import ParticipantDrawer from './ParticipantDrawer';
import ConfirmationModal from './ConfirmationModal';
import { useConfirmation } from '@/hooks/useConfirmation';
import { useToast } from '@/hooks/useToast';
import { useSoundEffects } from '@/hooks/useSoundEffects';

interface GameBoardProps {
  gameState: PublicGameState;
  currentUserId: string;
  isConnected: boolean;
  isReconnecting: boolean;
  onVote: (value: CardValue | null) => void;
  onReveal: () => void;
  onReset: () => void;
  onKick: (targetId: string) => void;
  onTransferAdmin: (targetId: string) => void;
  onLeave: () => void;
  onSetStory: (title: string, description: string) => Promise<void>;
}

export default function GameBoard({
  gameState,
  currentUserId,
  isConnected,
  isReconnecting,
  onVote,
  onReveal,
  onReset,
  onKick,
  onTransferAdmin,
  onLeave,
  onSetStory,
}: GameBoardProps) {
  const isAdmin = currentUserId === gameState.adminId;
  const currentUser = gameState.participants.find((p) => p.id === currentUserId);
  const isObserver = currentUser?.role === 'observer';

  const players = gameState.participants.filter((p) => p.role === 'player');
  const votedCount = players.filter((p) => p.hasVoted).length;
  const hasVotes = votedCount > 0;

  const [selectedVote, setSelectedVote] = useState<CardValue | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [adminLoading, setAdminLoading] = useState(false);

  const { isOpen: confirmOpen, config: confirmConfig, confirm, close: closeConfirm } = useConfirmation();
  const { addToast } = useToast();
  const { isMuted, toggleMute } = useSoundEffects(gameState);

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
      if (me && !me.hasVoted) setSelectedVote(null);
    }
  }, [gameState.roundNumber, gameState.isRevealed, gameState.participants, currentUserId]);

  const handleVote = (value: CardValue | null) => {
    setSelectedVote(value);
    onVote(value);
  };

  const handleReveal = async () => {
    setAdminLoading(true);
    try { await onReveal(); } finally { setAdminLoading(false); }
  };

  const handleReset = async () => {
    setAdminLoading(true);
    try { await onReset(); } finally { setAdminLoading(false); }
  };

  const handleKick = useCallback((targetId: string) => {
    const target = gameState.participants.find((p) => p.id === targetId);
    if (!target) return;
    confirm({
      title: 'Remove Player',
      body: (
        <span>
          Remove <strong className="text-white">{target.name}</strong> from the session?
          They can rejoin using the same link.
        </span>
      ),
      confirmLabel: 'Remove',
      confirmVariant: 'red',
      icon: '✕',
      onConfirm: async () => {
        await onKick(targetId);
        addToast({ type: 'info', title: `${target.name} removed`, persistent: false, dismissAfter: 4000 });
      },
    });
  }, [gameState.participants, confirm, onKick, addToast]);

  const handleTransferAdmin = useCallback((targetId: string) => {
    const target = gameState.participants.find((p) => p.id === targetId);
    if (!target) return;
    confirm({
      title: 'Transfer Admin',
      body: (
        <span>
          Make <strong className="text-white">{target.name}</strong> the admin?
          You will lose your admin controls.
        </span>
      ),
      confirmLabel: 'Transfer',
      confirmVariant: 'gold',
      icon: '👑',
      onConfirm: async () => {
        await onTransferAdmin(targetId);
        addToast({ type: 'info', title: `Admin transferred to ${target.name}`, persistent: false, dismissAfter: 4000 });
      },
    });
  }, [gameState.participants, confirm, onTransferAdmin, addToast]);

  const handleLeave = () => {
    confirm({
      title: 'Leave Session',
      body: 'Are you sure you want to leave? You can rejoin at any time.',
      confirmLabel: 'Leave',
      confirmVariant: 'red',
      icon: '🚪',
      onConfirm: onLeave,
    });
  };

  return (
    <>
      <div className="flex min-h-screen flex-col">
        {/* Sticky header */}
        <GameHeader
          roundNumber={gameState.roundNumber}
          participantCount={gameState.participants.length}
          isConnected={isConnected}
          isReconnecting={isReconnecting}
          isMuted={isMuted}
          onToggleMute={toggleMute}
          onLeave={handleLeave}
        />

        {/* Story banner */}
        <StoryBanner
          storyTitle={gameState.storyTitle}
          storyDescription={gameState.storyDescription}
          isAdmin={isAdmin}
          onSave={onSetStory}
        />

        {/* Main content */}
        <div className="flex flex-1 flex-col lg:flex-row min-h-0">
          {/* Sidebar: desktop only */}
          <aside className="hidden lg:flex w-72 flex-col border-r border-casino-border bg-casino-dark p-4 overflow-y-auto">
            <ParticipantList
              gameState={gameState}
              currentUserId={currentUserId}
              onKick={handleKick}
              onTransferAdmin={handleTransferAdmin}
            />
          </aside>

          {/* Main table */}
          <main className="flex flex-1 flex-col min-h-0">
            {/* Felt table area */}
            <div className="flex flex-1 items-center justify-center p-4 sm:p-6">
              <div className="felt-bg w-full max-w-2xl rounded-3xl border-4 border-gold-900/30 p-6 sm:p-8 shadow-[inset_0_2px_20px_rgba(0,0,0,0.5)]">
                {gameState.isRevealed && gameState.results ? (
                  <ResultsDisplay results={gameState.results} />
                ) : (
                  <div className="flex flex-col items-center gap-6 py-6">
                    <div className="text-center">
                      <div className="font-display text-2xl font-semibold text-gold-400/80 mb-2">
                        {hasVotes ? 'Votes Coming In...' : 'Place Your Bets'}
                      </div>
                      <p className="text-sm text-green-200/60">
                        {votedCount} of {players.length} players have voted
                      </p>
                    </div>

                    <div
                      className="flex flex-wrap justify-center gap-2"
                      role="list"
                      aria-label="Voting status per player"
                    >
                      {players.map((p) => (
                        <div
                          key={p.id}
                          role="listitem"
                          aria-label={`${p.name}: ${p.hasVoted ? 'voted' : 'waiting'}`}
                          className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs ${
                            p.hasVoted
                              ? 'bg-gold-400/15 text-gold-400 border border-gold-400/30'
                              : 'bg-casino-dark/50 text-casino-muted border border-casino-border'
                          }`}
                        >
                          {p.hasVoted && (
                            <span className="inline-block h-1.5 w-1.5 rounded-full bg-gold-400 chip-in" />
                          )}
                          {p.name}
                        </div>
                      ))}
                      {players.length === 0 && (
                        <p className="text-sm text-casino-muted">No players yet...</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Mobile: participant count + drawer trigger */}
            <div className="flex lg:hidden items-center justify-between border-t border-casino-border bg-casino-dark px-4 py-2">
              <button
                onClick={() => setDrawerOpen(true)}
                aria-label={`View ${gameState.participants.length} participants`}
                className="flex items-center gap-2 text-sm text-casino-muted hover:text-white transition-colors"
              >
                <span>👥</span>
                {gameState.participants.length} participants
                {!isObserver && (
                  <span className="ml-1 text-xs text-gold-400">
                    ({votedCount}/{players.length} voted)
                  </span>
                )}
              </button>
            </div>

            {/* Voting hand — players only */}
            {!isObserver && (
              <div className="border-t border-casino-border bg-casino-dark p-4 sm:p-5">
                <div className="mx-auto max-w-3xl">
                  <div className="mb-2 text-center text-xs text-casino-muted font-medium uppercase tracking-wider">
                    Your Hand
                  </div>
                  <VotingCards
                    selectedValue={selectedVote}
                    onVote={handleVote}
                    disabled={gameState.isRevealed}
                    isObserver={false}
                  />
                </div>
              </div>
            )}

            {/* Admin control bar */}
            {isAdmin && (
              <AdminControlBar
                isRevealed={gameState.isRevealed}
                totalVoters={players.length}
                votedCount={votedCount}
                onReveal={handleReveal}
                onReset={handleReset}
                isLoading={adminLoading}
              />
            )}
          </main>
        </div>
      </div>

      {/* Mobile participant drawer */}
      <ParticipantDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        votedCount={votedCount}
        totalVoters={players.length}
      >
        <ParticipantList
          gameState={gameState}
          currentUserId={currentUserId}
          onKick={handleKick}
          onTransferAdmin={handleTransferAdmin}
        />
      </ParticipantDrawer>

      {/* Confirmation modal */}
      <ConfirmationModal
        isOpen={confirmOpen}
        config={confirmConfig}
        onClose={closeConfirm}
      />
    </>
  );
}
