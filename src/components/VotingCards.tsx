'use client';

import { CARD_VALUES, type CardValue } from '@/lib/types';
import PokerCard from './PokerCard';

interface VotingCardsProps {
  selectedValue: CardValue | null;
  onVote: (value: CardValue | null) => void;
  disabled?: boolean;
}

export default function VotingCards({ selectedValue, onVote, disabled }: VotingCardsProps) {
  const handleClick = (value: CardValue) => {
    if (disabled) return;
    // Toggle: clicking selected card deselects it
    if (selectedValue === value) {
      onVote(null);
    } else {
      onVote(value);
    }
  };

  return (
    <div className="w-full">
      <div className="flex flex-wrap items-end justify-center gap-2 sm:gap-3">
        {CARD_VALUES.map((value) => (
          <div key={value} className={disabled ? 'opacity-50 pointer-events-none' : ''}>
            <PokerCard
              value={value}
              isSelected={selectedValue === value}
              onClick={() => handleClick(value)}
              size="md"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
