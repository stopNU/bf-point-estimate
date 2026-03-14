'use client';

import type { CardValue } from '@/lib/types';
import { useTheme } from '@/hooks/useTheme';

interface PokerCardProps {
  value: CardValue;
  isSelected?: boolean;
  isRevealed?: boolean;
  isFaceDown?: boolean;
  onClick?: () => void;
  size?: 'sm' | 'md' | 'lg';
  delay?: number;
}

function getCardDisplay(value: CardValue): { main: string; corner: string } {
  if (value === '☕') return { main: '☕', corner: '☕' };
  if (value === '?') return { main: '?', corner: '?' };
  return { main: value, corner: value };
}

export default function PokerCard({
  value,
  isSelected = false,
  isRevealed = false,
  isFaceDown = false,
  onClick,
  size = 'md',
  delay = 0,
}: PokerCardProps) {
  const display = getCardDisplay(value);
  const { isCosmos } = useTheme();

  const sizeClasses = {
    sm: 'w-12 h-[72px] text-lg',
    md: 'w-[72px] h-[104px] text-2xl',
    lg: 'w-20 h-[120px] text-3xl',
  };

  const cornerSize = {
    sm: 'text-[8px]',
    md: 'text-[10px]',
    lg: 'text-xs',
  };

  // Face-down card
  if (isFaceDown) {
    return (
      <div
        className={`perspective ${sizeClasses[size]}`}
        style={{ animationDelay: `${delay}ms` }}
      >
        <div
          className={`preserve-3d relative h-full w-full transition-transform duration-500 ${
            isRevealed ? '' : 'rotate-y-180'
          }`}
        >
          {/* Front face (revealed) */}
          {isCosmos ? (
            <div
              className="backface-hidden absolute inset-0 flex items-center justify-center"
              style={{
                background: 'var(--color-cosmos-deep)',
                border: '1px solid var(--color-cosmos-hull)',
                boxShadow: 'inset 0 0 0 1px rgba(0,191,255,0.1)',
                borderRadius: 0,
              }}
            >
              <span
                style={{ fontFamily: 'var(--font-cosmos-mono)', color: 'var(--color-cosmos-beam-400)', fontWeight: 700 }}
                className={`text-${size === 'sm' ? 'base' : size === 'md' ? 'xl' : '2xl'}`}
              >
                {display.main}
              </span>
              <span
                className={`absolute top-1 left-1.5 ${cornerSize[size]}`}
                style={{ fontFamily: 'var(--font-cosmos-mono)', color: 'var(--color-cosmos-beam-600)' }}
              >
                {display.corner}
              </span>
              <span
                className={`absolute bottom-1 right-1.5 rotate-180 ${cornerSize[size]}`}
                style={{ fontFamily: 'var(--font-cosmos-mono)', color: 'var(--color-cosmos-beam-600)' }}
              >
                {display.corner}
              </span>
            </div>
          ) : (
            <div className="backface-hidden absolute inset-0 flex items-center justify-center rounded-xl border-2 border-gold-600/50 bg-casino-surface shadow-lg">
              <span className="font-display font-bold text-gold-400">{display.main}</span>
              <span className={`absolute top-1 left-1.5 font-display font-bold text-gold-400/70 ${cornerSize[size]}`}>
                {display.corner}
              </span>
              <span className={`absolute bottom-1 right-1.5 rotate-180 font-display font-bold text-gold-400/70 ${cornerSize[size]}`}>
                {display.corner}
              </span>
            </div>
          )}

          {/* Back face (hidden) */}
          {isCosmos ? (
            <div className="backface-hidden rotate-y-180 absolute inset-0 cosmos-card-back overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center">
                <span
                  className="text-xl"
                  style={{ fontFamily: 'var(--font-cosmos-mono)', color: 'var(--color-cosmos-beam-800)' }}
                >
                  ?
                </span>
              </div>
            </div>
          ) : (
            <div className="backface-hidden rotate-y-180 absolute inset-0 rounded-xl border-2 border-gold-700/40 bg-gradient-to-br from-casino-surface to-casino-dark shadow-lg overflow-hidden">
              <div
                className="absolute inset-1 rounded-lg opacity-20"
                style={{
                  backgroundImage: `repeating-linear-gradient(
                    45deg,
                    transparent,
                    transparent 5px,
                    rgba(212,160,23,0.3) 5px,
                    rgba(212,160,23,0.3) 6px
                  )`,
                }}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-8 w-8 rounded-full border-2 border-gold-700/40 flex items-center justify-center">
                  <span className="text-gold-700/60 text-xs">♠</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Interactive card (player's hand)
  if (isCosmos) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={`relative flex flex-col items-center justify-center transition-all duration-200 ${sizeClasses[size]}`}
        style={{
          background: isSelected ? 'var(--color-cosmos-beam-950)' : 'var(--color-cosmos-deep)',
          border: isSelected
            ? '1px solid var(--color-cosmos-beam-500)'
            : '1px solid var(--color-cosmos-hull)',
          boxShadow: isSelected
            ? 'inset 0 0 0 1px rgba(0,191,255,0.1), 0 0 20px rgba(0,191,255,0.45)'
            : 'inset 0 0 0 1px rgba(0,191,255,0.05)',
          transform: isSelected ? 'translateY(-12px) scale(1.05)' : '',
          borderRadius: 0,
        }}
      >
        <span
          className={`absolute top-1 left-1.5 ${cornerSize[size]}`}
          style={{ fontFamily: 'var(--font-cosmos-mono)', color: isSelected ? 'var(--color-cosmos-beam-400)' : 'var(--color-cosmos-beam-700)' }}
        >
          {display.corner}
        </span>
        <span
          className={`absolute bottom-1 right-1.5 rotate-180 ${cornerSize[size]}`}
          style={{ fontFamily: 'var(--font-cosmos-mono)', color: isSelected ? 'var(--color-cosmos-beam-400)' : 'var(--color-cosmos-beam-700)' }}
        >
          {display.corner}
        </span>
        <span
          style={{
            fontFamily: 'var(--font-cosmos-display)',
            color: isSelected ? 'var(--color-cosmos-text-primary)' : 'var(--color-cosmos-text-primary)',
            fontSize: size === 'sm' ? '24px' : size === 'md' ? '32px' : '40px',
          }}
        >
          {display.main}
        </span>
      </button>
    );
  }

  // Casino interactive card
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative flex flex-col items-center justify-center rounded-xl border-2 transition-all duration-200 ${sizeClasses[size]} ${
        isSelected
          ? 'border-gold-400 bg-casino-surface shadow-[0_0_20px_rgba(250,204,21,0.3)] -translate-y-3 scale-105'
          : 'border-casino-border bg-casino-surface hover:border-gold-700 hover:-translate-y-1 hover:shadow-lg'
      }`}
    >
      <span
        className={`absolute top-1 left-1.5 font-display font-bold ${cornerSize[size]} ${
          isSelected ? 'text-gold-400' : 'text-casino-muted'
        }`}
      >
        {display.corner}
      </span>
      <span
        className={`absolute bottom-1 right-1.5 rotate-180 font-display font-bold ${cornerSize[size]} ${
          isSelected ? 'text-gold-400' : 'text-casino-muted'
        }`}
      >
        {display.corner}
      </span>
      <span className={`font-display font-bold ${isSelected ? 'text-gold-400' : 'text-white'}`}>
        {display.main}
      </span>
      {isSelected && (
        <div className="absolute -inset-px rounded-xl bg-gold-400/10 pointer-events-none" />
      )}
    </button>
  );
}
