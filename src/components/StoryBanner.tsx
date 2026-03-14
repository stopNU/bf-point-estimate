'use client';

import { useState, useRef } from 'react';
import { useTheme } from '@/hooks/useTheme';

interface StoryBannerProps {
  storyTitle: string;
  storyDescription: string;
  isAdmin: boolean;
  onSave: (title: string, description: string) => Promise<void>;
}

export default function StoryBanner({
  storyTitle,
  storyDescription,
  isAdmin,
  onSave,
}: StoryBannerProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(storyTitle);
  const [editDesc, setEditDesc] = useState(storyDescription);
  const [isSaving, setIsSaving] = useState(false);
  const [isDescOpen, setIsDescOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { isCosmos } = useTheme();

  // Don't render for non-admins when no story is set
  if (!isAdmin && !storyTitle) return null;

  const ticketMatch = storyTitle.match(/\b([A-Z]+-\d+)\b/);

  const startEdit = () => {
    setEditTitle(storyTitle);
    setEditDesc(storyDescription);
    setIsEditing(true);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const save = async () => {
    setIsSaving(true);
    try {
      await onSave(editTitle, editDesc);
    } finally {
      setIsSaving(false);
      setIsEditing(false);
    }
  };

  const cancel = () => {
    setEditTitle(storyTitle);
    setEditDesc(storyDescription);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') save();
    if (e.key === 'Escape') cancel();
  };

  if (isCosmos) {
    return (
      <div
        role="region"
        aria-label="Current story being estimated"
        style={{
          background: 'var(--color-cosmos-station)',
          borderBottom: '1px solid var(--color-cosmos-hull)',
          borderLeft: '3px solid var(--color-cosmos-beam-500)',
        }}
        className="group px-4 py-2 sm:px-6"
      >
        {storyTitle && !isEditing && (
          <div
            className="mb-0.5 text-[9px] uppercase tracking-widest"
            style={{ fontFamily: 'var(--font-cosmos-display)', color: 'var(--color-cosmos-text-secondary)' }}
          >
            MISSION BRIEFING
          </div>
        )}
        <div className="flex items-center gap-2 min-w-0">
          {ticketMatch && !isEditing && (
            <span
              className="flex-shrink-0 px-1.5 py-0.5 text-[10px]"
              style={{
                fontFamily: 'var(--font-cosmos-mono)',
                fontWeight: 600,
                background: 'var(--color-cosmos-beam-950)',
                border: '1px solid var(--color-cosmos-beam-700)',
                color: 'var(--color-cosmos-beam-400)',
                borderRadius: 0,
              }}
            >
              {ticketMatch[1]}
            </span>
          )}

          {isEditing ? (
            <div className="flex flex-1 items-center gap-2 min-w-0">
              <input
                ref={inputRef}
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                onKeyDown={handleKeyDown}
                onBlur={save}
                maxLength={120}
                disabled={isSaving}
                aria-label="Story title"
                className="flex-1 min-w-0 px-2 py-1 text-sm outline-none disabled:opacity-50"
                style={{
                  background: 'var(--color-cosmos-void)',
                  border: '1px solid var(--color-cosmos-beam-500)',
                  color: 'var(--color-cosmos-text-primary)',
                  fontFamily: 'var(--font-cosmos-ui)',
                  fontWeight: 600,
                  borderRadius: 0,
                }}
              />
              {isSaving && (
                <span
                  className="flex-shrink-0 h-4 w-4 animate-spin rounded-full border-2"
                  style={{ borderColor: 'var(--color-cosmos-hull)', borderTopColor: 'var(--color-cosmos-beam-400)' }}
                />
              )}
            </div>
          ) : storyTitle ? (
            <div className="flex flex-1 items-center gap-2 min-w-0">
              <span
                aria-live="polite"
                className="truncate text-sm font-bold uppercase"
                style={{ fontFamily: 'var(--font-cosmos-ui)', color: 'var(--color-cosmos-text-primary)' }}
              >
                {storyTitle.replace(/\b[A-Z]+-\d+\b\s*/, '')}
              </span>
              {isAdmin && (
                <button
                  onClick={startEdit}
                  aria-label="Edit story title"
                  aria-expanded={isEditing}
                  className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity p-0.5"
                  style={{ color: 'var(--color-cosmos-beam-600)' }}
                >
                  ✏️
                </button>
              )}
              {storyDescription && (
                <button
                  onClick={() => setIsDescOpen((v) => !v)}
                  aria-expanded={isDescOpen}
                  aria-controls="story-description"
                  className="flex-shrink-0 ml-auto p-0.5 transition-colors"
                  style={{ color: 'var(--color-cosmos-text-dim)' }}
                >
                  <span className={`inline-block transition-transform ${isDescOpen ? 'rotate-180' : ''}`}>▾</span>
                </button>
              )}
            </div>
          ) : isAdmin ? (
            <button
              onClick={startEdit}
              className="text-sm italic transition-colors cursor-pointer"
              style={{ color: 'var(--color-cosmos-text-dim)', fontFamily: 'var(--font-cosmos-ui)' }}
            >
              Click to set mission briefing...
            </button>
          ) : null}
        </div>

        {isDescOpen && storyDescription && (
          <div
            id="story-description"
            className="mt-2 text-xs leading-relaxed animate-[fadeSlideDown_150ms_ease-out]"
            style={{ fontFamily: 'var(--font-cosmos-ui)', fontWeight: 600, color: 'var(--color-cosmos-text-secondary)' }}
          >
            {storyDescription}
          </div>
        )}
      </div>
    );
  }

  // Casino theme
  return (
    <div
      role="region"
      aria-label="Current story being estimated"
      className="group border-b border-casino-border bg-casino-dark/80 px-4 py-2 sm:px-6"
    >
      <div className="flex items-center gap-2 min-w-0">
        {ticketMatch && !isEditing && (
          <span className="flex-shrink-0 rounded px-1.5 py-0.5 text-[10px] font-mono font-semibold bg-gold-900/30 text-gold-400 border border-gold-900/50">
            {ticketMatch[1]}
          </span>
        )}

        {isEditing ? (
          <div className="flex flex-1 items-center gap-2 min-w-0">
            <input
              ref={inputRef}
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={save}
              maxLength={120}
              disabled={isSaving}
              aria-label="Story title"
              className="flex-1 min-w-0 rounded border border-gold-600/50 bg-casino-surface px-2 py-1 text-sm text-white outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500/50 disabled:opacity-50"
              placeholder="Story title..."
            />
            {isSaving && (
              <span className="flex-shrink-0 h-4 w-4 animate-spin rounded-full border-2 border-casino-border border-t-gold-400" />
            )}
          </div>
        ) : storyTitle ? (
          <div className="flex flex-1 items-center gap-2 min-w-0">
            <span aria-live="polite" className="truncate text-sm font-medium text-white">
              {storyTitle.replace(/\b[A-Z]+-\d+\b\s*/, '')}
            </span>
            {isAdmin && (
              <button
                onClick={startEdit}
                aria-label="Edit story title"
                aria-expanded={isEditing}
                className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity rounded p-0.5 text-casino-muted hover:text-gold-400"
              >
                ✏️
              </button>
            )}
            {storyDescription && (
              <button
                onClick={() => setIsDescOpen((v) => !v)}
                aria-expanded={isDescOpen}
                aria-controls="story-description"
                className="flex-shrink-0 ml-auto rounded p-0.5 text-casino-muted hover:text-white transition-colors"
              >
                <span className={`inline-block transition-transform ${isDescOpen ? 'rotate-180' : ''}`}>▾</span>
              </button>
            )}
          </div>
        ) : isAdmin ? (
          <button
            onClick={startEdit}
            className="text-sm italic text-casino-muted hover:text-white transition-colors cursor-pointer"
          >
            Click to add a story title...
          </button>
        ) : null}
      </div>

      {isDescOpen && storyDescription && (
        <div
          id="story-description"
          className="mt-2 text-xs text-casino-muted leading-relaxed animate-[fadeSlideDown_150ms_ease-out]"
        >
          {storyDescription}
        </div>
      )}
    </div>
  );
}
