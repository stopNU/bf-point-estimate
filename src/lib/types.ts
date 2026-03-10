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

export const AVATARS: { id: string; emoji: string; label: string }[] = [
  { id: 'dealer', emoji: '🎰', label: 'The Dealer' },
  { id: 'joker', emoji: '🃏', label: 'The Joker' },
  { id: 'crown', emoji: '👑', label: 'High Roller' },
  { id: 'dice', emoji: '🎲', label: 'Lucky Dice' },
  { id: 'diamond', emoji: '💎', label: 'Diamond' },
  { id: 'horse', emoji: '🐎', label: 'Dark Horse' },
  { id: 'trophy', emoji: '🏆', label: 'Champion' },
  { id: 'tophat', emoji: '🎩', label: 'Top Hat' },
  { id: 'star', emoji: '🌟', label: 'All Star' },
  { id: 'spade', emoji: '♠️', label: 'Ace of Spades' },
  { id: 'fire', emoji: '🔥', label: 'Hot Hand' },
  { id: 'rocket', emoji: '🚀', label: 'Rocket' },
];
