import {
  type CardValue,
  type GameState,
  type PublicGameState,
  type PublicParticipant,
  type RoundResults,
  type Participant,
  NUMERIC_CARDS,
} from './types';

type Listener = (state: PublicGameState) => void;

class GameService {
  private state: GameState = {
    participants: [],
    isRevealed: false,
    adminId: null,
    roundNumber: 1,
  };

  private listeners = new Set<Listener>();

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  getPublicState(): PublicGameState {
    const participants: PublicParticipant[] = this.state.participants.map((p) => ({
      id: p.id,
      name: p.name,
      avatar: p.avatar,
      hasVoted: p.vote !== null,
      vote: this.state.isRevealed ? p.vote : null,
    }));

    return {
      participants,
      isRevealed: this.state.isRevealed,
      adminId: this.state.adminId,
      roundNumber: this.state.roundNumber,
      results: this.state.isRevealed ? this.computeResults() : null,
    };
  }

  private broadcast(): void {
    const publicState = this.getPublicState();
    for (const listener of this.listeners) {
      try {
        listener(publicState);
      } catch {
        this.listeners.delete(listener);
      }
    }
  }

  private computeResults(): RoundResults {
    const votedParticipants = this.state.participants.filter((p) => p.vote !== null);

    const votes = votedParticipants.map((p) => ({
      participantId: p.id,
      name: p.name,
      vote: p.vote!,
    }));

    const numericVotes = votedParticipants
      .filter((p) => NUMERIC_CARDS.includes(p.vote!))
      .map((p) => Number(p.vote));

    const average =
      numericVotes.length > 0
        ? Math.round((numericVotes.reduce((a, b) => a + b, 0) / numericVotes.length) * 10) / 10
        : null;

    const consensus =
      numericVotes.length > 1 && numericVotes.every((v) => v === numericVotes[0]);

    const distribution: Record<string, number> = {};
    for (const p of votedParticipants) {
      const v = p.vote!;
      distribution[v] = (distribution[v] || 0) + 1;
    }

    return { average, votes, consensus, distribution };
  }

  join(name: string, avatar: string): Participant {
    const id = crypto.randomUUID();
    const participant: Participant = {
      id,
      name: name.trim().slice(0, 20),
      avatar,
      vote: null,
      joinedAt: Date.now(),
    };

    this.state.participants.push(participant);

    // First person becomes admin
    if (this.state.adminId === null) {
      this.state.adminId = id;
    }

    this.broadcast();
    return participant;
  }

  leave(participantId: string): void {
    this.state.participants = this.state.participants.filter((p) => p.id !== participantId);

    // Reassign admin if the admin left
    if (this.state.adminId === participantId) {
      this.state.adminId =
        this.state.participants.length > 0
          ? this.state.participants.sort((a, b) => a.joinedAt - b.joinedAt)[0].id
          : null;
    }

    this.broadcast();
  }

  vote(participantId: string, value: CardValue): void {
    const participant = this.state.participants.find((p) => p.id === participantId);
    if (!participant) throw new Error('Participant not found');
    if (this.state.isRevealed) throw new Error('Round already revealed');

    participant.vote = value;
    this.broadcast();
  }

  clearVote(participantId: string): void {
    const participant = this.state.participants.find((p) => p.id === participantId);
    if (!participant) throw new Error('Participant not found');
    if (this.state.isRevealed) throw new Error('Round already revealed');

    participant.vote = null;
    this.broadcast();
  }

  reveal(requesterId: string): void {
    if (this.state.adminId !== requesterId) throw new Error('Only admin can reveal');
    if (this.state.isRevealed) return;

    this.state.isRevealed = true;
    this.broadcast();
  }

  reset(requesterId: string): void {
    if (this.state.adminId !== requesterId) throw new Error('Only admin can reset');

    this.state.isRevealed = false;
    this.state.roundNumber += 1;
    for (const p of this.state.participants) {
      p.vote = null;
    }

    this.broadcast();
  }

  transferAdmin(requesterId: string, targetId: string): void {
    if (this.state.adminId !== requesterId) throw new Error('Only admin can transfer');
    const target = this.state.participants.find((p) => p.id === targetId);
    if (!target) throw new Error('Target participant not found');

    this.state.adminId = targetId;
    this.broadcast();
  }

  kick(requesterId: string, targetId: string): void {
    if (this.state.adminId !== requesterId) throw new Error('Only admin can kick');
    if (requesterId === targetId) throw new Error('Cannot kick yourself');

    this.state.participants = this.state.participants.filter((p) => p.id !== targetId);
    this.broadcast();
  }

  hasParticipant(id: string): boolean {
    return this.state.participants.some((p) => p.id === id);
  }
}

// Module-level singleton — persists across requests in the same server process
const globalForGame = globalThis as unknown as { gameService?: GameService };
export const gameService = globalForGame.gameService ?? new GameService();
globalForGame.gameService = gameService;
