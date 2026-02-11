'use client';

import { AVATARS } from '@/lib/types';

interface AvatarPickerProps {
  selected: string;
  onSelect: (avatarId: string) => void;
}

export default function AvatarPicker({ selected, onSelect }: AvatarPickerProps) {
  return (
    <div className="grid grid-cols-4 gap-3 sm:grid-cols-6">
      {AVATARS.map((avatar) => (
        <button
          key={avatar.id}
          type="button"
          onClick={() => onSelect(avatar.id)}
          className={`group flex flex-col items-center gap-1 rounded-xl border-2 p-3 transition-all duration-200 ${
            selected === avatar.id
              ? 'border-gold-400 bg-gold-400/10 shadow-[0_0_15px_rgba(250,204,21,0.2)]'
              : 'border-casino-border bg-casino-surface hover:border-gold-700 hover:bg-casino-surface/80'
          }`}
        >
          <span className="text-3xl transition-transform duration-200 group-hover:scale-110">
            {avatar.emoji}
          </span>
          <span
            className={`text-[10px] font-medium transition-colors ${
              selected === avatar.id ? 'text-gold-400' : 'text-casino-muted'
            }`}
          >
            {avatar.label}
          </span>
        </button>
      ))}
    </div>
  );
}
