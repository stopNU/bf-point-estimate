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
import { useTheme } from '@/hooks/useTheme';

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
  const { isCosmos } = useTheme();

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
          <aside
            className="hidden lg:flex w-72 flex-col p-4 overflow-y-auto"
            style={isCosmos ? {
              background: 'var(--color-cosmos-station)',
              borderRight: '1px solid var(--color-cosmos-hull)',
              boxShadow: 'inset 0 0 40px rgba(0,191,255,0.04)',
            } : { borderRight: '1px solid', borderColor: 'var(--color-casino-border)', background: 'var(--color-casino-dark)' }}
          >
            <ParticipantList
              gameState={gameState}
              currentUserId={currentUserId}
              onKick={handleKick}
              onTransferAdmin={handleTransferAdmin}
            />
          </aside>

          {/* Main table */}
          <main className="flex flex-1 flex-col min-h-0">
            {/* Table area */}
            <div
              className={`flex flex-1 items-center justify-center p-4 sm:p-6 ${isCosmos ? 'cosmos-battle-station' : ''}`}
              style={isCosmos ? {} : { background: 'var(--color-casino-black)' }}
            >
              <div
                className={`relative w-full max-w-2xl p-6 sm:p-8 ${
                  isCosmos ? '' : 'felt-bg rounded-3xl border-4 border-gold-900/30 shadow-[inset_0_2px_20px_rgba(0,0,0,0.5)]'
                }`}
                style={isCosmos ? {
                  border: '1px solid var(--color-cosmos-hull)',
                  boxShadow: 'inset 0 0 0 1px rgba(0,191,255,0.08)',
                  borderRadius: 0,
                  zIndex: 1,
                } : {}}
              >
                {gameState.isRevealed && gameState.results ? (
                  <ResultsDisplay results={gameState.results} />
                ) : (
                  <div className="flex flex-col items-center gap-6 py-6">
                    <div className="text-center">
                      {isCosmos ? (
                        <>
                          <div
                            className="text-2xl uppercase tracking-wide mb-2"
                            style={{ fontFamily: 'var(--font-cosmos-display)', color: 'var(--color-cosmos-beam-400)' }}
                          >
                            {hasVotes ? 'VOTES INCOMING' : 'AWAIT DEPLOYMENT'}
                          </div>
                          <p
                            className="text-sm tracking-wider"
                            style={{ fontFamily: 'var(--font-cosmos-mono)', color: 'var(--color-cosmos-text-secondary)' }}
                          >
                            {votedCount} / {players.length} DEPLOYED
                          </p>
                        </>
                      ) : (
                        <>
                          <div className="font-display text-2xl font-semibold text-gold-400/80 mb-2">
                            {hasVotes ? 'Votes Coming In...' : 'Place Your Bets'}
                          </div>
                          <p className="text-sm text-green-200/60">
                            {votedCount} of {players.length} players have voted
                          </p>
                        </>
                      )}
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
                          className={isCosmos
                            ? 'flex items-center gap-1.5 px-3 py-1 text-xs'
                            : `flex items-center gap-1.5 rounded-full px-3 py-1 text-xs ${
                                p.hasVoted
                                  ? 'bg-gold-400/15 text-gold-400 border border-gold-400/30'
                                  : 'bg-casino-dark/50 text-casino-muted border border-casino-border'
                              }`
                          }
                          style={isCosmos ? {
                            background: p.hasVoted ? 'rgba(0,191,255,0.1)' : 'rgba(0,0,0,0.3)',
                            border: `1px solid ${p.hasVoted ? 'var(--color-cosmos-beam-700)' : 'var(--color-cosmos-hull)'}`,
                            color: p.hasVoted ? 'var(--color-cosmos-beam-400)' : 'var(--color-cosmos-text-dim)',
                            borderRadius: 0,
                            fontFamily: 'var(--font-cosmos-mono)',
                          } : {}}
                        >
                          {p.hasVoted && (
                            <span
                              className="inline-block h-1.5 w-1.5"
                              style={isCosmos
                                ? { background: 'var(--color-cosmos-beam-400)' }
                                : { borderRadius: '50%', background: 'var(--color-gold-400)' }}
                            />
                          )}
                          {p.name}
                        </div>
                      ))}
                      {players.length === 0 && (
                        <p
                          className="text-sm"
                          style={isCosmos ? { color: 'var(--color-cosmos-text-dim)', fontFamily: 'var(--font-cosmos-mono)' } : { color: 'var(--color-casino-muted)' }}
                        >
                          {isCosmos ? 'NO OPERATIVES...' : 'No players yet...'}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Mobile: participant count + drawer trigger */}
            <div
              className="flex lg:hidden items-center justify-between px-4 py-2"
              style={isCosmos ? {
                borderTop: '1px solid var(--color-cosmos-hull)',
                background: 'var(--color-cosmos-station)',
              } : { borderTop: '1px solid var(--color-casino-border)', background: 'var(--color-casino-dark)' }}
            >
              <button
                onClick={() => setDrawerOpen(true)}
                aria-label={`View ${gameState.participants.length} participants`}
                className="flex items-center gap-2 text-sm transition-colors"
                style={isCosmos ? { color: 'var(--color-cosmos-text-secondary)', fontFamily: 'var(--font-cosmos-ui)', fontWeight: 600 } : {}}
              >
                <span>👥</span>
                {isCosmos ? `${gameState.participants.length} OPERATIVES` : `${gameState.participants.length} participants`}
                {!isObserver && (
                  <span
                    className="ml-1 text-xs"
                    style={isCosmos
                      ? { fontFamily: 'var(--font-cosmos-mono)', color: 'var(--color-cosmos-beam-400)' }
                      : { color: 'var(--color-gold-400)' }}
                  >
                    ({votedCount}/{players.length} {isCosmos ? 'deployed' : 'voted'})
                  </span>
                )}
              </button>
            </div>

            {/* Voting hand — players only */}
            {!isObserver && (
              <div
                className="p-4 sm:p-5"
                style={isCosmos ? {
                  borderTop: '1px solid var(--color-cosmos-hull)',
                  background: 'var(--color-cosmos-abyss)',
                } : { borderTop: '1px solid var(--color-casino-border)', background: 'var(--color-casino-dark)' }}
              >
                <div className="mx-auto max-w-3xl">
                  <div
                    className="mb-2 text-center text-xs font-medium uppercase tracking-wider"
                    style={isCosmos
                      ? { fontFamily: 'var(--font-cosmos-mono)', color: 'var(--color-cosmos-text-secondary)' }
                      : { color: 'var(--color-casino-muted)' }}
                  >
                    {isCosmos ? 'DEPLOY SEQUENCE' : 'Your Hand'}
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
