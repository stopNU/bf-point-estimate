'use client';

import { useEffect, useState, useRef } from 'react';
import { CARD_VALUES, NUMERIC_CARDS, type CardValue } from '@/lib/types';
import { soundService } from '@/lib/sound-service';

interface VotingCardsProps {
  selectedValue: CardValue | null;
  onVote: (value: CardValue | null) => void;
  disabled?: boolean;
  isObserver?: boolean;
}

const SPECIAL_CARDS: CardValue[] = ['?', '☕'];

const SHORTCUT_MAP: Record<string, CardValue> = {
  '0': '0',
  '1': '1',
  '2': '2',
  '3': '3',
  '5': '5',
  '8': '8',
  't': '13',
  'u': '21',
  '?': '?',
  '/': '?',
  'b': '☕',
};

const ARIA_LABELS: Record<CardValue, string> = {
  '0': 'Vote 0',
  '1': 'Vote 1',
  '2': 'Vote 2',
  '3': 'Vote 3',
  '5': 'Vote 5',
  '8': 'Vote 8',
  '13': 'Vote 13',
  '21': 'Vote 21',
  '?': "Vote — I'm uncertain",
  '☕': 'Vote — Request a break',
};

const KEY_SHORTCUTS: Record<CardValue, string> = {
  '0': '0', '1': '1', '2': '2', '3': '3',
  '5': '5', '8': '8', '13': 't', '21': 'u',
  '?': '? /', '☕': 'b',
};

export default function VotingCards({ selectedValue, onVote, disabled, isObserver }: VotingCardsProps) {
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [selectAnimCard, setSelectAnimCard] = useState<CardValue | null>(null);
  const prevSelectedRef = useRef<CardValue | null>(null);

  if (isObserver) return null;

  const handleClick = (value: CardValue) => {
    if (disabled) return;
    if (selectedValue === value) {
      // Deselecting current vote
      soundService.playVoteClear();
      onVote(null);
    } else if (selectedValue !== null) {
      // Changing existing vote
      soundService.playVoteChange();
      onVote(value);
    } else {
      // New vote
      soundService.playVote();
      onVote(value);
    }
  };

  // Global keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (disabled) return;
      const active = document.activeElement;
      const isInput =
        active instanceof HTMLInputElement ||
        active instanceof HTMLTextAreaElement ||
        (active as HTMLElement)?.isContentEditable;
      if (isInput) return;

      if (e.key === 'Escape') {
        if (selectedValue !== null) soundService.playVoteClear();
        onVote(null);
        return;
      }

      const mappedValue = SHORTCUT_MAP[e.key];
      if (mappedValue) {
        e.preventDefault();
        if (selectedValue === mappedValue) {
          soundService.playVoteClear();
          onVote(null);
        } else if (selectedValue !== null) {
          soundService.playVoteChange();
          onVote(mappedValue);
        } else {
          soundService.playVote();
          onVote(mappedValue);
        }
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [disabled, selectedValue, onVote]);

  // Card select spring animation — only on new selection
  useEffect(() => {
    if (selectedValue && selectedValue !== prevSelectedRef.current) {
      setSelectAnimCard(selectedValue);
      const t = setTimeout(() => setSelectAnimCard(null), 250);
      prevSelectedRef.current = selectedValue;
      return () => clearTimeout(t);
    }
    prevSelectedRef.current = selectedValue;
  }, [selectedValue]);

  // Arrow key nav within radiogroup
  const handleGroupKeyDown = (e: React.KeyboardEvent) => {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
    const buttons = Array.from(
      (e.currentTarget as HTMLElement).querySelectorAll('[role="radio"]')
    ) as HTMLElement[];
    const idx = buttons.findIndex((b) => b === document.activeElement);
    if (idx === -1) return;
    e.preventDefault();
    const next = e.key === 'ArrowRight'
      ? (idx + 1) % buttons.length
      : (idx - 1 + buttons.length) % buttons.length;
    buttons[next].focus();
  };

  const cardClass = (value: CardValue) => {
    const isSelected = selectedValue === value;
    const base = 'relative rounded-lg border-2 font-display font-bold select-none transition-all duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold-400 w-9 h-[52px] text-xs sm:w-12 sm:h-[72px] sm:text-sm md:w-[72px] md:h-[104px] md:text-xl';
    if (disabled) return `${base} border-casino-border bg-casino-surface text-casino-muted cursor-not-allowed`;
    if (isSelected) return `${base} border-gold-400 bg-gold-500/10 text-gold-400 -translate-y-4 shadow-[0_8px_20px_rgba(212,160,23,0.3)] cursor-pointer`;
    return `${base} border-casino-border bg-casino-surface text-casino-muted hover:border-gold-600 hover:text-gold-400 hover:-translate-y-1 cursor-pointer`;
  };

  return (
    <div className="w-full">
      {/* "You voted" banner */}
      {selectedValue !== null && !disabled && (
        <div
          role="status"
          aria-live="polite"
          className="mb-3 text-center text-sm font-medium text-gold-400 animate-[fadeSlideDown_200ms_ease-out] overflow-hidden"
        >
          You voted: <span className="font-display font-bold">{selectedValue}</span>
        </div>
      )}

      <div className="relative">
        {/* Shortcut hint */}
        <div className="flex justify-end mb-1">
          <button
            onClick={() => setShowShortcuts((v) => !v)}
            aria-expanded={showShortcuts}
            aria-controls="kbd-shortcuts"
            aria-label="Show keyboard shortcuts"
            className="text-[10px] text-casino-muted hover:text-white transition-colors px-2 py-0.5 rounded border border-casino-border"
          >
            ⌨ shortcuts
          </button>
        </div>

        {/* Shortcut overlay */}
        {showShortcuts && (
          <div
            id="kbd-shortcuts"
            role="tooltip"
            className="absolute bottom-full right-0 mb-2 z-10 rounded-xl border border-casino-border bg-casino-surface shadow-2xl p-3 text-xs text-casino-muted w-48"
          >
            <div className="grid grid-cols-2 gap-x-4 gap-y-1">
              {CARD_VALUES.map((v) => (
                <div key={v} className="flex justify-between">
                  <span className="text-white">{v}</span>
                  <kbd className="font-mono bg-casino-dark px-1 rounded">{KEY_SHORTCUTS[v]}</kbd>
                </div>
              ))}
              <div className="col-span-2 flex justify-between mt-1 pt-1 border-t border-casino-border">
                <span className="text-white">Deselect</span>
                <kbd className="font-mono bg-casino-dark px-1 rounded">Esc</kbd>
              </div>
            </div>
          </div>
        )}

        {/* Card radiogroup */}
        <div
          role="radiogroup"
          aria-label="Your voting hand"
          aria-required="true"
          onKeyDown={handleGroupKeyDown}
          className="flex items-end justify-center gap-0.5 sm:gap-2 md:gap-3"
        >
          {NUMERIC_CARDS.map((value) => (
            <div key={value} className={selectAnimCard === value ? 'card-select' : ''}>
              <button
                role="radio"
                aria-checked={selectedValue === value}
                aria-label={ARIA_LABELS[value]}
                aria-keyshortcuts={KEY_SHORTCUTS[value]}
                aria-disabled={disabled ? 'true' : undefined}
                aria-description={disabled ? 'Voting is locked — cards have been revealed' : undefined}
                onClick={() => handleClick(value)}
                tabIndex={selectedValue === value ? 0 : -1}
                className={cardClass(value)}
              >
                {value}
              </button>
            </div>
          ))}

          {/* Divider — hidden on mobile */}
          <div
            aria-hidden="true"
            className="hidden sm:block w-px h-[72px] md:h-[104px] bg-casino-border mx-1 self-center"
          />

          {SPECIAL_CARDS.map((value) => (
            <div key={value} className={selectAnimCard === value ? 'card-select' : ''}>
              <button
                role="radio"
                aria-checked={selectedValue === value}
                aria-label={ARIA_LABELS[value]}
                aria-keyshortcuts={KEY_SHORTCUTS[value]}
                aria-disabled={disabled ? 'true' : undefined}
                aria-description={disabled ? 'Voting is locked — cards have been revealed' : undefined}
                onClick={() => handleClick(value)}
                tabIndex={selectedValue === value ? 0 : -1}
                className={cardClass(value)}
              >
                {value}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
