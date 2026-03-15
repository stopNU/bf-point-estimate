export type CardValue = '0' | '1' | '2' | '3' | '5' | '8' | '13' | '21' | '?' | '☕';

export const CARD_VALUES: CardValue[] = ['0', '1', '2', '3', '5', '8', '13', '21', '?', '☕'];

export const NUMERIC_CARDS: CardValue[] = ['0', '1', '2', '3', '5', '8', '13', '21'];

export type ParticipantRole = 'player' | 'observer';

export interface Participant {
  id: string;
  name: string;
  avatar: string;
  vote: CardValue | null;
  joinedAt: number;
  role: ParticipantRole;
  isOnline: boolean;
}

export interface GameState {
  participants: Participant[];
  isRevealed: boolean;
  adminId: string | null;
  roundNumber: number;
  storyTitle: string;
  storyDescription: string;
}

export interface PublicParticipant {
  id: string;
  name: string;
  avatar: string;
  hasVoted: boolean;
  vote: CardValue | null;
  role: ParticipantRole;
  isOnline: boolean;
}

export interface RoundResults {
  average: number | null;
  votes: { participantId: string; name: string; vote: CardValue }[];
  consensus: boolean;
  distribution: Record<string, number>;
  spread: number | null;
}

export interface PublicGameState {
  participants: PublicParticipant[];
  isRevealed: boolean;
  adminId: string | null;
  roundNumber: number;
  results: RoundResults | null;
  storyTitle: string;
  storyDescription: string;
}

export interface JoinPayload {
  name: string;
  avatar: string;
  role: ParticipantRole;
}

export type ToastType = 'disconnected' | 'reconnected' | 'error' | 'info' | 'session-expired' | 'kicked';

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  body?: string;
  persistent: boolean;
  dismissAfter?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export type ConfirmVariant = 'gold' | 'red';

export interface ConfirmationModalConfig {
  title: string;
  body: React.ReactNode;
  confirmLabel: string;
  confirmVariant: ConfirmVariant;
  icon?: string;
  onConfirm: () => void | Promise<void>;
  onCancel?: () => void;
}

export const AVATARS: { id: string; emoji: string; label: string; theme?: 'classic' | 'cosmos' }[] = [
  // Classic Theme Avatars
  { id: 'dealer', emoji: '🎰', label: 'The Dealer', theme: 'classic' },
  { id: 'joker', emoji: '🃏', label: 'The Joker', theme: 'classic' },
  { id: 'crown', emoji: '👑', label: 'High Roller', theme: 'classic' },
  { id: 'dice', emoji: '🎲', label: 'Lucky Dice', theme: 'classic' },
  { id: 'diamond', emoji: '💎', label: 'Diamond', theme: 'classic' },
  { id: 'horse', emoji: '🐎', label: 'Dark Horse', theme: 'classic' },
  { id: 'trophy', emoji: '🏆', label: 'Champion', theme: 'classic' },
  { id: 'tophat', emoji: '🎩', label: 'Top Hat', theme: 'classic' },
  { id: 'star', emoji: '🌟', label: 'All Star', theme: 'classic' },
  { id: 'spade', emoji: '♠️', label: 'Ace of Spades', theme: 'classic' },
  { id: 'fire', emoji: '🔥', label: 'Hot Hand', theme: 'classic' },
  { id: 'rocket', emoji: '🚀', label: 'Rocket', theme: 'classic' },
  // Cosmos Theme Avatars (Sci-Fi Inspired)
  { id: 'spaceman', emoji: '🧑‍🚀', label: 'Spaceman', theme: 'cosmos' },
  { id: 'alien', emoji: '👽', label: 'Alien', theme: 'cosmos' },
  { id: 'ufo', emoji: '🛸', label: 'UFO Pilot', theme: 'cosmos' },
  { id: 'satellite', emoji: '🛰️', label: 'Satellite', theme: 'cosmos' },
  { id: 'meteor', emoji: '☄️', label: 'Meteor', theme: 'cosmos' },
  { id: 'comet', emoji: '☪️', label: 'Comet', theme: 'cosmos' },
  { id: 'galaxy', emoji: '🌌', label: 'Galaxy', theme: 'cosmos' },
  { id: 'pulsar', emoji: '⚪', label: 'Pulsar', theme: 'cosmos' },
  { id: 'quasar', emoji: '✨', label: 'Quasar', theme: 'cosmos' },
  { id: 'nebula', emoji: '🌠', label: 'Nebula', theme: 'cosmos' },
  { id: 'cyborg', emoji: '🤖', label: 'Cyborg', theme: 'cosmos' },
  { id: 'android', emoji: '🦾', label: 'Android', theme: 'cosmos' },
];
