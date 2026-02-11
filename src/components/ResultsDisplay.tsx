'use client';

import type { RoundResults, CardValue } from '@/lib/types';
import { CARD_VALUES } from '@/lib/types';
import PokerCard from './PokerCard';

interface ResultsDisplayProps {
  results: RoundResults;
}

export default function ResultsDisplay({ results }: ResultsDisplayProps) {
  const maxCount = Math.max(...Object.values(results.distribution), 1);

  // Find the closest Fibonacci number to the average
  const fibNumbers = [0, 1, 2, 3, 5, 8, 13, 21];
  const closestFib = results.average !== null
    ? fibNumbers.reduce((prev, curr) =>
        Math.abs(curr - results.average!) < Math.abs(prev - results.average!) ? curr : prev
      )
    : null;

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Average / Consensus */}
      <div className="text-center">
        {results.consensus ? (
          <div>
            <div className="mb-1 text-sm font-medium text-green-400">Consensus!</div>
            <div className="font-display text-5xl font-bold text-gold-400">
              {results.votes[0]?.vote}
            </div>
          </div>
        ) : results.average !== null ? (
          <div>
            <div className="mb-1 text-sm font-medium text-casino-muted">Average</div>
            <div className="font-display text-5xl font-bold text-gold-400">
              {results.average}
            </div>
            {closestFib !== null && closestFib !== results.average && (
              <div className="mt-1 text-sm text-casino-muted">
                Nearest: <span className="text-gold-500 font-semibold">{closestFib}</span>
              </div>
            )}
          </div>
        ) : (
          <div>
            <div className="mb-1 text-sm font-medium text-casino-muted">No numeric votes</div>
          </div>
        )}
      </div>

      {/* Distribution bars */}
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-2">
          {CARD_VALUES.filter((v) => results.distribution[v]).map((value) => {
            const count = results.distribution[value] || 0;
            const percentage = (count / maxCount) * 100;
            const isSpecial = value === '?' || value === '☕';

            return (
              <div key={value} className="flex items-center gap-3">
                <div className="w-8 text-right font-display text-sm font-bold text-gold-400">
                  {value}
                </div>
                <div className="flex-1 h-6 rounded-full bg-casino-dark overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ease-out ${
                      isSpecial
                        ? value === '?' ? 'bg-amber-500/70' : 'bg-amber-700/70'
                        : 'bg-gradient-to-r from-gold-700 to-gold-500'
                    }`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <div className="w-8 text-sm text-casino-muted">
                  {count}x
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Individual votes as revealed cards */}
      <div className="flex flex-wrap justify-center gap-3 mt-2">
        {results.votes.map((v, i) => (
          <div key={v.participantId} className="flex flex-col items-center gap-1">
            <PokerCard
              value={v.vote}
              isRevealed={true}
              isFaceDown={true}
              size="sm"
              delay={i * 100}
            />
            <span className="text-[10px] text-casino-muted max-w-[48px] truncate">
              {v.name}
            </span>
          </div>
        ))}
      </div>

      {/* Special vote callouts */}
      {results.votes.some((v) => v.vote === '?') && (
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-2 text-center text-sm text-amber-400">
          ⚠️ Some players need more discussion
        </div>
      )}
      {results.votes.some((v) => v.vote === '☕') && (
        <div className="rounded-lg border border-amber-700/30 bg-amber-700/10 px-4 py-2 text-center text-sm text-amber-600">
          ☕ Break requested
        </div>
      )}
    </div>
  );
}
