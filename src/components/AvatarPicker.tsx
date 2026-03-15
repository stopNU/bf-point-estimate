'use client';

import { AVATARS } from '@/lib/types';
import { useTheme } from '@/hooks/useTheme';

interface AvatarPickerProps {
  selected: string;
  onSelect: (avatarId: string) => void;
}

export default function AvatarPicker({ selected, onSelect }: AvatarPickerProps) {
  const { isCosmos } = useTheme();

  // Filter avatars based on current theme
  const availableAvatars = AVATARS.filter((avatar) => {
    // If no theme is specified on the avatar, show it in both themes
    if (!avatar.theme) return true;
    // Otherwise, only show if it matches the current theme
    return isCosmos ? avatar.theme === 'cosmos' : avatar.theme === 'classic';
  });

  return (
    <div className="grid grid-cols-4 gap-3 sm:grid-cols-6">
      {availableAvatars.map((avatar) => {
        const isSelected = selected === avatar.id;
        return (
          <button
            key={avatar.id}
            type="button"
            onClick={() => onSelect(avatar.id)}
            className={`group flex flex-col items-center gap-1 p-3 transition-all duration-200 ${
              isCosmos ? '' : `rounded-xl border-2 ${
                isSelected
                  ? 'border-gold-400 bg-gold-400/10 shadow-[0_0_15px_rgba(250,204,21,0.2)]'
                  : 'border-casino-border bg-casino-surface hover:border-gold-700 hover:bg-casino-surface/80'
              }`
            }`}
            style={isCosmos ? {
              background: isSelected ? 'var(--color-cosmos-beam-950)' : 'var(--color-cosmos-deep)',
              border: isSelected
                ? '1px solid var(--color-cosmos-beam-500)'
                : '1px solid var(--color-cosmos-hull)',
              boxShadow: isSelected
                ? '0 0 0 1px var(--color-cosmos-beam-500), 0 0 12px rgba(0,191,255,0.35)'
                : 'none',
              borderRadius: 0,
            } : {}}
          >
            <span className="text-3xl transition-transform duration-200 group-hover:scale-110">
              {avatar.emoji}
            </span>
            <span
              className={`text-[10px] font-medium transition-colors ${
                isCosmos ? '' : (isSelected ? 'text-gold-400' : 'text-casino-muted')
              }`}
              style={isCosmos ? {
                fontFamily: 'var(--font-cosmos-ui)',
                fontWeight: 700,
                color: isSelected ? 'var(--color-cosmos-beam-400)' : 'var(--color-cosmos-text-dim)',
              } : {}}
            >
              {avatar.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
