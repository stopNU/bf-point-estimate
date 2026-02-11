'use client';

import type { CardValue } from '@/lib/types';

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

  // Face-down card (other players' hidden votes or back of hand card)
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
          <div className="backface-hidden absolute inset-0 flex items-center justify-center rounded-xl border-2 border-gold-600/50 bg-casino-surface shadow-lg">
            <span className="font-display font-bold text-gold-400">{display.main}</span>
            <span className={`absolute top-1 left-1.5 font-display font-bold text-gold-400/70 ${cornerSize[size]}`}>
              {display.corner}
            </span>
            <span className={`absolute bottom-1 right-1.5 rotate-180 font-display font-bold text-gold-400/70 ${cornerSize[size]}`}>
              {display.corner}
            </span>
          </div>
          {/* Back face (hidden) */}
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
        </div>
      </div>
    );
  }

  // Interactive card (player's hand)
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
      {/* Corner values */}
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

      {/* Center value */}
      <span
        className={`font-display font-bold ${
          isSelected ? 'text-gold-400' : 'text-white'
        }`}
      >
        {display.main}
      </span>

      {/* Selected glow ring */}
      {isSelected && (
        <div className="absolute -inset-px rounded-xl bg-gold-400/10 pointer-events-none" />
      )}
    </button>
  );
}
