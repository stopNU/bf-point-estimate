'use client';

import { useState } from 'react';
import type { RoundResults } from '@/lib/types';
import { CARD_VALUES } from '@/lib/types';

interface ResultsDisplayProps {
  results: RoundResults;
}

const FIB = [0, 1, 2, 3, 5, 8, 13, 21];
function nearestFib(n: number): number {
  return FIB.reduce((prev, curr) => Math.abs(curr - n) < Math.abs(prev - n) ? curr : prev);
}
function getDivergenceLabel(spread: number | null): { label: string; color: string } | null {
  if (spread === null || spread === 0) return null;
  if (spread <= 2) return { label: 'Low divergence', color: 'text-green-400' };
  if (spread <= 5) return { label: 'Moderate divergence', color: 'text-amber-400' };
  return { label: 'High divergence — discuss', color: 'text-casino-red-light' };
}

export default function ResultsDisplay({ results }: ResultsDisplayProps) {
  const [copied, setCopied] = useState(false);
  const maxCount = Math.max(...Object.values(results.distribution), 1);
  const closestFib = results.average !== null ? nearestFib(results.average) : null;
  const divergence = getDivergenceLabel(results.spread ?? null);

  const sortedVotes = [...results.votes].sort((a, b) => {
    const nA = Number(a.vote), nB = Number(b.vote);
    const iA = !isNaN(nA), iB = !isNaN(nB);
    if (iA && iB) return nA - nB;
    return iA ? -1 : iB ? 1 : 0;
  });

  const handleCopy = async () => {
    const label = results.consensus
      ? `Consensus: ${results.votes[0]?.vote}`
      : `Average: ${results.average}`;
    const nearest = closestFib !== null && closestFib !== results.average
      ? [`Nearest: ${closestFib}`] : [];
    const lines = [
      'Round results:', label, ...nearest, '',
      'Votes:', ...sortedVotes.map((v) => `  ${v.name}: ${v.vote}`),
    ];
    await navigator.clipboard.writeText(lines.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col items-center gap-5">
      <div className="relative text-center w-full">
        {results.consensus ? (
          <div>
            <div className="mb-1 text-sm font-medium text-green-400">🎉 Consensus!</div>
            <div
              className="font-display text-5xl font-bold text-gold-400 consensus-pulse rounded-full w-20 h-20 flex items-center justify-center mx-auto border-2 border-gold-400/40"
              role="status"
            >
              {results.votes[0]?.vote}
            </div>
          </div>
        ) : results.average !== null ? (
          <div>
            <div className="mb-1 text-sm font-medium text-casino-muted">Average</div>
            <div className="font-display text-5xl font-bold text-gold-400" role="status">
              {results.average}
            </div>
            {closestFib !== null && closestFib !== results.average && (
              <div className="mt-1 text-sm text-casino-muted">
                Nearest story point:{' '}
                <span className="text-gold-500 font-semibold">{closestFib}</span>
              </div>
            )}
          </div>
        ) : (
          <div className="text-sm text-casino-muted">No numeric votes</div>
        )}

        {divergence && (
          <div className={`mt-2 text-xs font-medium ${divergence.color}`} role="status">
            {divergence.label}
            {results.spread != null && (
              <span className="ml-1 text-casino-muted">(spread: {results.spread})</span>
            )}
          </div>
        )}

        <button
          onClick={handleCopy}
          aria-label={copied ? 'Copied!' : 'Copy results to clipboard'}
          className="absolute -top-1 right-0 rounded-lg border border-casino-border p-1.5 text-xs text-casino-muted hover:text-white transition-all hover:bg-casino-dark"
        >
          {copied ? '✓' : '⎘'}
        </button>
      </div>

      {Object.keys(results.distribution).length > 0 && (
        <div className="w-full max-w-sm" aria-label="Vote distribution">
          <div className="flex flex-col gap-1.5">
            {CARD_VALUES.filter((v) => results.distribution[v]).map((value) => {
              const count = results.distribution[value] || 0;
              const pct = (count / maxCount) * 100;
              const isSpecial = value === '?' || value === '☕';
              return (
                <div key={value} className="flex items-center gap-3">
                  <div className="w-8 text-right font-display text-sm font-bold text-gold-400">
                    {value}
                  </div>
                  <div className="flex-1 h-5 rounded-full bg-casino-dark overflow-hidden">
                    <div
                      role="meter"
                      aria-valuenow={count}
                      aria-valuemin={0}
                      aria-valuemax={maxCount}
                      className={`h-full rounded-full transition-all duration-700 ease-out ${
                        isSpecial
                          ? value === '?' ? 'bg-amber-500/70' : 'bg-amber-700/70'
                          : 'bg-gradient-to-r from-gold-700 to-gold-500'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <div className="w-8 text-sm text-casino-muted">{count}x</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div aria-label="Individual votes" className="flex flex-wrap justify-center gap-3 mt-1">
        {sortedVotes.map((v, i) => (
          <div
            key={v.participantId}
            className="flex flex-col items-center gap-1 card-reveal"
            style={{ '--card-index': i } as React.CSSProperties}
          >
            <div
              className="flex h-[60px] w-[44px] items-center justify-center rounded-lg border-2 border-gold-400/60 bg-gold-500/10 font-display font-bold text-xl text-gold-400"
              aria-label={`${v.name}: ${v.vote}`}
            >
              {v.vote}
            </div>
            <span className="text-[10px] text-casino-muted max-w-[52px] truncate text-center">
              {v.name}
            </span>
          </div>
        ))}
      </div>

      {results.votes.some((v) => v.vote === '?') && (
        <div
          role="alert"
          className="w-full rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-2 text-center text-sm text-amber-400"
        >
          ⚠️ Some players need more discussion
        </div>
      )}
      {results.votes.some((v) => v.vote === '☕') && (
        <div
          role="alert"
          className="w-full rounded-lg border border-amber-700/30 bg-amber-700/10 px-4 py-2 text-center text-sm text-amber-600"
        >
          ☕ Break requested
        </div>
      )}
    </div>
  );
}
