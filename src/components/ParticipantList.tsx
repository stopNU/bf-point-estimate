'use client';

import type { PublicGameState } from '@/lib/types';
import ParticipantCard from './ParticipantCard';
import { useTheme } from '@/hooks/useTheme';

interface ParticipantListProps {
  gameState: PublicGameState;
  currentUserId: string | null;
  onKick: (targetId: string) => void;
  onTransferAdmin: (targetId: string) => void;
}

export default function ParticipantList({
  gameState,
  currentUserId,
  onKick,
  onTransferAdmin,
}: ParticipantListProps) {
  const isGameAdmin = currentUserId === gameState.adminId;
  const { isCosmos } = useTheme();

  const players = gameState.participants.filter((p) => p.role === 'player');
  const observers = gameState.participants.filter((p) => p.role === 'observer');

  const sectionHeaderStyle = isCosmos ? {
    fontFamily: 'var(--font-cosmos-display)',
    color: 'var(--color-cosmos-text-secondary)',
    letterSpacing: '0.05em',
    borderLeft: '2px solid var(--color-cosmos-beam-700)',
    paddingLeft: '8px',
  } : {};

  const countBadgeStyle = isCosmos ? {
    background: 'var(--color-cosmos-hull)',
    color: 'var(--color-cosmos-beam-400)',
    fontFamily: 'var(--font-cosmos-mono)',
    borderRadius: 0,
    fontSize: '10px',
    padding: '1px 6px',
  } : {};

  return (
    <aside aria-label="Session participants" className="flex h-full flex-col">
      {/* Players section */}
      <section aria-label="Players">
        <div className="mb-3 flex items-center justify-between">
          <h2
            className={isCosmos ? 'text-base uppercase' : 'font-display text-base font-semibold text-gold-400'}
            style={sectionHeaderStyle}
          >
            {isCosmos ? 'OPERATIVES' : 'Players'}
          </h2>
          <span
            className={isCosmos ? '' : 'rounded-full bg-casino-dark px-2 py-0.5 text-xs text-casino-muted'}
            style={countBadgeStyle}
          >
            {players.length}
          </span>
        </div>
        <div className="flex flex-col gap-2">
          {players.map((p) => (
            <ParticipantCard
              key={p.id}
              participant={p}
              isAdmin={p.id === gameState.adminId}
              isCurrentUser={p.id === currentUserId}
              isGameAdmin={isGameAdmin}
              isRevealed={gameState.isRevealed}
              onKick={() => onKick(p.id)}
              onTransferAdmin={() => onTransferAdmin(p.id)}
            />
          ))}
          {players.length === 0 && (
            <p
              className="text-center text-sm py-4"
              style={isCosmos ? { fontFamily: 'var(--font-cosmos-mono)', color: 'var(--color-cosmos-text-dim)' } : { color: 'var(--color-casino-muted)' }}
            >
              {isCosmos ? 'NO OPERATIVES...' : 'No players yet...'}
            </p>
          )}
        </div>
      </section>

      {/* Observers section */}
      {observers.length > 0 && (
        <section
          aria-label="Observers"
          className="mt-4"
          style={isCosmos ? { borderTop: '1px solid var(--color-cosmos-hull)', paddingTop: '12px' } : {}}
        >
          <div className="mb-3 flex items-center justify-between">
            <h2
              className={isCosmos ? 'text-base uppercase' : 'font-display text-base font-semibold text-casino-muted'}
              style={isCosmos ? {
                fontFamily: 'var(--font-cosmos-display)',
                color: 'var(--color-cosmos-text-dim)',
                letterSpacing: '0.05em',
                borderLeft: '2px solid var(--color-cosmos-muted)',
                paddingLeft: '8px',
              } : {}}
            >
              {isCosmos ? 'SPECTATORS' : 'Observers'}
            </h2>
            <span
              className={isCosmos ? '' : 'rounded-full bg-casino-dark px-2 py-0.5 text-xs text-casino-muted'}
              style={isCosmos ? {
                ...countBadgeStyle,
                color: 'var(--color-cosmos-text-dim)',
              } : {}}
            >
              {observers.length}
            </span>
          </div>
          <div className="flex flex-col gap-2">
            {observers.map((p) => (
              <ParticipantCard
                key={p.id}
                participant={p}
                isAdmin={p.id === gameState.adminId}
                isCurrentUser={p.id === currentUserId}
                isGameAdmin={isGameAdmin}
                isRevealed={gameState.isRevealed}
                onKick={() => onKick(p.id)}
                onTransferAdmin={() => onTransferAdmin(p.id)}
              />
            ))}
          </div>
        </section>
      )}
    </aside>
  );
}
