'use client';

import ThemeToggle from './ThemeToggle';
import { useTheme } from '@/hooks/useTheme';

interface GameHeaderProps {
  roundNumber: number;
  participantCount: number;
  isConnected: boolean;
  isReconnecting: boolean;
  isMuted: boolean;
  onToggleMute: () => void;
  onLeave: () => void;
}

export default function GameHeader({
  roundNumber,
  participantCount,
  isConnected,
  isReconnecting,
  isMuted,
  onToggleMute,
  onLeave,
}: GameHeaderProps) {
  const { isCosmos } = useTheme();

  if (isCosmos) {
    return (
      <header
        role="banner"
        className="sticky top-0 z-50 flex h-14 items-center justify-between px-4 sm:px-6"
        style={{
          background: 'linear-gradient(180deg, #0C1220 0%, #070B14 100%)',
          borderBottom: '1px solid var(--color-cosmos-hull)',
          boxShadow: '0 2px 0 rgba(0,191,255,0.1)',
        }}
      >
        {/* Left: Logo + Round */}
        <div className="flex items-center gap-3">
          <h1
            className="text-lg uppercase tracking-wider"
            style={{ fontFamily: 'var(--font-cosmos-display)', color: 'var(--color-cosmos-beam-500)' }}
          >
            COSMOSWIN
          </h1>
          <div style={{ width: '1px', height: '16px', background: 'var(--color-cosmos-hull)' }} />
          <div className="hidden sm:flex flex-col">
            <span
              className="text-[9px] uppercase tracking-widest"
              style={{ fontFamily: 'var(--font-cosmos-mono)', color: 'var(--color-cosmos-text-secondary)' }}
            >
              ROUND
            </span>
            <span
              aria-label={`Round ${roundNumber}`}
              className="text-sm tracking-wider leading-none"
              style={{ fontFamily: 'var(--font-cosmos-mono)', color: 'var(--color-cosmos-beam-400)' }}
            >
              {String(roundNumber).padStart(2, '0')}
            </span>
          </div>
        </div>

        {/* Center: participant count */}
        <div className="hidden sm:flex items-center gap-1.5">
          <span
            className="text-xs tracking-widest"
            style={{ fontFamily: 'var(--font-cosmos-mono)', color: 'var(--color-cosmos-text-secondary)' }}
          >
            {participantCount} OPS ONLINE
          </span>
        </div>

        {/* Right: sound + connection + theme + leave */}
        <div className="flex items-center gap-2">
          <button
            onClick={onToggleMute}
            aria-label={isMuted ? 'Unmute sound effects' : 'Mute sound effects'}
            title={isMuted ? 'Unmute sounds' : 'Mute sounds'}
            className="px-2 py-1.5 text-sm transition-all"
            style={{
              border: '1px solid var(--color-cosmos-hull)',
              color: 'var(--color-cosmos-text-secondary)',
              borderRadius: 0,
            }}
          >
            {isMuted ? '🔇' : '🔊'}
          </button>

          <div
            role="status"
            aria-live="polite"
            className="flex items-center gap-1.5"
          >
            {isConnected ? (
              <>
                <span
                  className="cosmos-online-dot h-2 w-2 rounded-full"
                  style={{ background: 'var(--color-cosmos-online)' }}
                />
                <span
                  className="hidden sm:inline text-xs"
                  style={{ fontFamily: 'var(--font-cosmos-mono)', color: 'var(--color-cosmos-text-secondary)' }}
                >
                  CONNECTED
                </span>
              </>
            ) : (
              <>
                <span
                  className="h-2 w-2 rounded-full flex-shrink-0"
                  style={{ background: 'var(--color-cosmos-magenta-500)' }}
                />
                <span
                  className={`hidden sm:inline text-xs ${isReconnecting ? 'animate-pulse' : ''}`}
                  style={{ fontFamily: 'var(--font-cosmos-mono)', color: 'var(--color-cosmos-text-secondary)' }}
                >
                  {isReconnecting ? 'RECONNECTING...' : 'OFFLINE'}
                </span>
              </>
            )}
          </div>

          <ThemeToggle />

          <button
            onClick={onLeave}
            aria-label="Leave the session"
            className="px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition-all"
            style={{
              fontFamily: 'var(--font-cosmos-ui)',
              border: '1px solid var(--color-cosmos-magenta-600)',
              color: 'var(--color-cosmos-magenta-500)',
              borderRadius: 0,
            }}
            onMouseEnter={(e) => {
              const el = e.currentTarget;
              el.style.background = 'var(--color-cosmos-magenta-600)';
              el.style.color = 'white';
              el.style.boxShadow = '0 0 12px var(--color-cosmos-magenta-glow)';
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget;
              el.style.background = '';
              el.style.color = 'var(--color-cosmos-magenta-500)';
              el.style.boxShadow = '';
            }}
          >
            DISCONNECT
          </button>
        </div>
      </header>
    );
  }

  // Casino theme
  return (
    <header
      role="banner"
      className="sticky top-0 z-50 flex h-14 items-center justify-between border-b border-casino-border bg-casino-dark px-4 sm:px-6"
    >
      {/* Left: Logo */}
      <div className="flex items-center gap-3">
        <h1 className="font-display text-lg font-bold">
          <span className="gold-shimmer">Scrum Poker</span>
        </h1>
        <div className="hidden sm:flex items-center gap-2">
          <div className="h-4 w-px bg-casino-border" />
          <span aria-label={`Round ${roundNumber}`} className="text-sm text-casino-muted">
            Round {roundNumber}
          </span>
        </div>
      </div>

      {/* Center: participant count (desktop) */}
      <div className="hidden sm:flex items-center gap-1.5">
        <span className="text-xs text-casino-muted">
          {participantCount} {participantCount === 1 ? 'player' : 'players'}
        </span>
      </div>

      {/* Right: sound + connection + theme + leave */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMute}
          aria-label={isMuted ? 'Unmute sound effects' : 'Mute sound effects'}
          title={isMuted ? 'Unmute sounds' : 'Mute sounds'}
          className="rounded-lg border border-casino-border p-1.5 text-sm text-casino-muted transition-colors hover:border-gold-600 hover:text-gold-400"
        >
          {isMuted ? '🔇' : '🔊'}
        </button>

        <div
          role="status"
          aria-live="polite"
          className="flex items-center gap-1.5"
        >
          {isConnected ? (
            <>
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-green-400" />
              </span>
              <span className="hidden sm:inline text-xs text-casino-muted">Connected</span>
            </>
          ) : (
            <>
              <span className="h-2 w-2 rounded-full bg-casino-red flex-shrink-0" />
              <span className={`hidden sm:inline text-xs text-casino-muted ${isReconnecting ? 'animate-pulse' : ''}`}>
                {isReconnecting ? 'Reconnecting...' : 'Disconnected'}
              </span>
            </>
          )}
        </div>

        <ThemeToggle />

        <button
          onClick={onLeave}
          aria-label="Leave the session"
          className="rounded-lg border border-casino-border px-3 py-1.5 text-xs text-casino-muted transition-colors hover:border-casino-red/50 hover:text-casino-red-light"
        >
          Leave
        </button>
      </div>
    </header>
  );
}
