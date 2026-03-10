# Developer Handover: bf-point-estimate v2.0 Redesign

**Document type:** Developer implementation guide
**Source specs:** UI_DESIGN_SPEC.md v2.0, UX_RESEARCH_FINDINGS.md, STAKEHOLDER_APPROVAL.md
**Date:** March 9, 2026
**Stack:** Next.js 16, React 19, Tailwind CSS v4, SSE (no WebSockets)

---

## Section 1: Start Here — Read These First

Before touching any file, read these in order:

| File | Why |
|---|---|
| `src/lib/types.ts` | Every interface you will extend — Participant, PublicParticipant, GameState, PublicGameState all need new fields |
| `src/lib/game-service.ts` | The in-memory singleton that owns all game state; you must add story title, online status, and observer-aware logic here before anything else compiles |
| `src/hooks/useGameSSE.ts` | The sole SSE subscriber — you will need to detect new event types (kicked, session-expired) here and surface them to the toast system |
| `src/components/GameBoard.tsx` | The root layout component — you will restructure the entire page layout (sidebar, story banner, admin bar placement) here |
| `src/app/globals.css` | All new keyframes must land here; Tailwind v4 uses `@theme inline` — do not add CSS variables outside that block |

---

## Section 2: TypeScript Type Changes (`src/lib/types.ts`)

Make these changes before writing any component code. Everything downstream depends on them.

### 2.1 New union type: ParticipantRole

```typescript
// ADD after line 1 (after CardValue exports)
export type ParticipantRole = 'player' | 'observer';
```

### 2.2 Extend Participant interface

```typescript
// BEFORE:
export interface Participant {
  id: string;
  name: string;
  avatar: string;
  vote: CardValue | null;
  joinedAt: number;
}

// AFTER — add role and isOnline:
export interface Participant {
  id: string;
  name: string;
  avatar: string;
  vote: CardValue | null;
  joinedAt: number;
  role: ParticipantRole;        // 'player' | 'observer'
  isOnline: boolean;            // tracked via SSE connection presence
}
```

### 2.3 Extend PublicParticipant interface

```typescript
// BEFORE:
export interface PublicParticipant {
  id: string;
  name: string;
  avatar: string;
  hasVoted: boolean;
  vote: CardValue | null;
}

// AFTER — add role and isOnline:
export interface PublicParticipant {
  id: string;
  name: string;
  avatar: string;
  hasVoted: boolean;
  vote: CardValue | null;
  role: ParticipantRole;        // observers never have hasVoted === true
  isOnline: boolean;
}
```

### 2.4 Extend GameState interface

```typescript
// BEFORE:
export interface GameState {
  participants: Participant[];
  isRevealed: boolean;
  adminId: string | null;
  roundNumber: number;
}

// AFTER — add storyTitle and storyDescription:
export interface GameState {
  participants: Participant[];
  isRevealed: boolean;
  adminId: string | null;
  roundNumber: number;
  storyTitle: string;           // '' when unset
  storyDescription: string;     // '' when unset
}
```

### 2.5 Extend PublicGameState interface

```typescript
// BEFORE:
export interface PublicGameState {
  participants: PublicParticipant[];
  isRevealed: boolean;
  adminId: string | null;
  roundNumber: number;
  results: RoundResults | null;
}

// AFTER — add story fields:
export interface PublicGameState {
  participants: PublicParticipant[];
  isRevealed: boolean;
  adminId: string | null;
  roundNumber: number;
  results: RoundResults | null;
  storyTitle: string;
  storyDescription: string;
}
```

### 2.6 Extend RoundResults interface

```typescript
// BEFORE:
export interface RoundResults {
  average: number | null;
  votes: { participantId: string; name: string; vote: CardValue }[];
  consensus: boolean;
  distribution: Record<string, number>;
}

// AFTER — add spread for divergence indicator:
export interface RoundResults {
  average: number | null;
  votes: { participantId: string; name: string; vote: CardValue }[];
  consensus: boolean;
  distribution: Record<string, number>;
  spread: number | null;        // max - min of numeric votes; null if < 2 numeric votes
}
```

### 2.7 New interface: Toast

```typescript
// ADD — used by the new ToastProvider and useToast hook:
export type ToastType = 'disconnected' | 'reconnected' | 'error' | 'info' | 'session-expired' | 'kicked';

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  body?: string;
  persistent: boolean;          // if false, auto-dismiss after dismissAfter ms
  dismissAfter?: number;        // ms; only relevant when persistent === false
  action?: {
    label: string;
    onClick: () => void;
  };
}
```

### 2.8 New interface: ConfirmationModalConfig

```typescript
// ADD — used by ConfirmationModal and useConfirmation hook:
export type ConfirmVariant = 'gold' | 'red';

export interface ConfirmationModalConfig {
  title: string;
  body: React.ReactNode;
  confirmLabel: string;
  confirmVariant: ConfirmVariant;
  icon?: string;                // emoji
  onConfirm: () => void | Promise<void>;
  onCancel?: () => void;
}
```

### 2.9 Extend useGameActions join signature

The `join` action needs a `role` parameter. The hook signature change is in Section 3, but add this helper type now:

```typescript
export interface JoinPayload {
  name: string;
  avatar: string;
  role: ParticipantRole;
}
```

---

## Section 3: Backend / API Changes

### 3.1 `src/lib/game-service.ts` — GameService class changes

**3.1.1 Initialize new state fields**

```typescript
// BEFORE:
private state: GameState = {
  participants: [],
  isRevealed: false,
  adminId: null,
  roundNumber: 1,
};

// AFTER:
private state: GameState = {
  participants: [],
  isRevealed: false,
  adminId: null,
  roundNumber: 1,
  storyTitle: '',
  storyDescription: '',
};
```

**3.1.2 Track online SSE connections**

Add a private set to track which participant IDs currently have an open SSE connection:

```typescript
private onlineParticipants = new Set<string>();

markOnline(participantId: string): () => void {
  this.onlineParticipants.add(participantId);
  this.broadcast();
  return () => {
    this.onlineParticipants.delete(participantId);
    this.broadcast();
  };
}
```

**3.1.3 Update getPublicState to include role, isOnline, and story fields**

```typescript
getPublicState(): PublicGameState {
  const participants: PublicParticipant[] = this.state.participants.map((p) => ({
    id: p.id,
    name: p.name,
    avatar: p.avatar,
    role: p.role,
    isOnline: this.onlineParticipants.has(p.id),
    hasVoted: p.role === 'observer' ? false : p.vote !== null,
    vote: this.state.isRevealed && p.role !== 'observer' ? p.vote : null,
  }));

  return {
    participants,
    isRevealed: this.state.isRevealed,
    adminId: this.state.adminId,
    roundNumber: this.state.roundNumber,
    results: this.state.isRevealed ? this.computeResults() : null,
    storyTitle: this.state.storyTitle,
    storyDescription: this.state.storyDescription,
  };
}
```

**3.1.4 Update join() to accept role**

```typescript
// BEFORE signature:
join(name: string, avatar: string): Participant

// AFTER:
join(name: string, avatar: string, role: ParticipantRole = 'player'): Participant {
  const id = crypto.randomUUID();
  const participant: Participant = {
    id,
    name: name.trim().slice(0, 20),
    avatar,
    vote: null,
    joinedAt: Date.now(),
    role,
    isOnline: false,            // markOnline() sets this after SSE connects
  };
  // ...rest unchanged
}
```

**3.1.5 Update vote() to block observers**

```typescript
vote(participantId: string, value: CardValue): void {
  const participant = this.state.participants.find((p) => p.id === participantId);
  if (!participant) throw new Error('Participant not found');
  if (participant.role === 'observer') throw new Error('Observers cannot vote');
  if (this.state.isRevealed) throw new Error('Round already revealed');

  participant.vote = value;
  this.broadcast();
}
```

**3.1.6 Update computeResults() to exclude observers and add spread**

```typescript
private computeResults(): RoundResults {
  const votedParticipants = this.state.participants.filter(
    (p) => p.vote !== null && p.role !== 'observer'
  );
  // ...existing votes/distribution/average/consensus logic...

  const numericValues = numericVotes; // already computed
  const spread =
    numericValues.length >= 2
      ? Math.max(...numericValues) - Math.min(...numericValues)
      : null;

  return { average, votes, consensus, distribution, spread };
}
```

**3.1.7 Add setStory() method**

```typescript
setStory(requesterId: string, title: string, description: string): void {
  if (this.state.adminId !== requesterId) throw new Error('Only admin can set story');
  this.state.storyTitle = title.trim().slice(0, 120);
  this.state.storyDescription = description.trim().slice(0, 500);
  this.broadcast();
}
```

**3.1.8 Update reset() to clear story title (optional — per spec story persists)**

The design spec does not specify clearing the story on new round — the story title should persist across rounds so the admin does not have to re-enter it. No change needed to `reset()` for story fields.

### 3.2 API Route Changes

**3.2.1 `src/app/api/game/join/route.ts` — accept role**

```typescript
// BEFORE:
const { name, avatar } = await req.json();
const participant = gameService.join(name, avatar);

// AFTER:
const { name, avatar, role } = await req.json();
const validRole = role === 'observer' ? 'observer' : 'player';
const participant = gameService.join(name, avatar, validRole);
```

**3.2.2 `src/hooks/useGameActions.ts` — update join**

```typescript
// BEFORE:
const join = useCallback(async (name: string, avatar: string) => {
  const data = await postAction('/api/game/join', { name, avatar });

// AFTER:
const join = useCallback(async (name: string, avatar: string, role: ParticipantRole = 'player') => {
  const data = await postAction('/api/game/join', { name, avatar, role });
```

**3.2.3 NEW endpoint: `src/app/api/game/story/route.ts`** 🆕

```typescript
import { NextResponse } from 'next/server';
import { gameService } from '@/lib/game-service';

export async function PATCH(req: Request) {
  try {
    const { participantId, title, description } = await req.json();
    if (!participantId) return NextResponse.json({ error: 'participantId required' }, { status: 400 });
    gameService.setStory(participantId, title ?? '', description ?? '');
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 403 });
  }
}
```

Add `setStory` to `useGameActions`:

```typescript
const setStory = useCallback(async (title: string, description: string) => {
  const participantId = getParticipantId();
  if (!participantId) throw new Error('Not joined');
  const res = await fetch('/api/game/story', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ participantId, title, description }),
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || 'Request failed');
  }
}, []);
```

**3.2.4 `src/app/api/sse/game/route.ts` — wire markOnline**

The SSE route must call `markOnline` when a client connects so `isOnline` is accurate:

```typescript
export async function GET(req: Request) {
  const url = new URL(req.url);
  const participantId = url.searchParams.get('participantId');

  const stream = new ReadableStream({
    start(controller) {
      const unmarkOnline = participantId
        ? gameService.markOnline(participantId)
        : () => {};

      // ...existing initial state send and subscribe...

      req.signal.addEventListener('abort', () => {
        unmarkOnline();
        clearInterval(heartbeat);
        unsubscribe();
        // ...
      });
    },
  });
}
```

Update `useGameSSE.ts` to pass `participantId` as a query parameter:

```typescript
// In useGameSSE, get participantId from localStorage and append to URL:
const participantId = localStorage.getItem('participantId') ?? '';
const eventSource = new EventSource(`/api/sse/game?participantId=${participantId}`);
```

### 3.3 SSE Event Shape — No breaking changes

The SSE stream sends `PublicGameState` as the `data` field of standard SSE messages. The new fields (`storyTitle`, `storyDescription`, `role`, `isOnline`, `spread`) are additive — existing clients ignoring them will not break. The toast system for `kicked` and `session-expired` events is handled client-side by comparing the participant list (see Section 6, `useGameSSE` notes).

---

## Section 4: `globals.css` Additions

The existing file has: `shimmer`, `chipIn`, `dealCard`, `felt-bg`, 3D card flip utilities, scrollbar styles.

**Add the following block after the existing scrollbar styles (after line 110):**

```css
/* ─── v2 NEW ANIMATIONS ─────────────────────────────────────── */

/* Felt diamond texture overlay (Section 3.3 of design spec) */
.felt-bg {
  position: relative;
}
.felt-bg::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  opacity: 0.04;
  background-image: url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cpolygon points='10,2 18,10 10,18 2,10' fill='none' stroke='%23facc15' stroke-width='0.5'/%3E%3C/svg%3E");
  background-size: 20px 20px;
  pointer-events: none;
}

/* Card selection spring (voting cards) */
@keyframes cardSelect {
  0%   { transform: translateY(0) scale(1); }
  40%  { transform: translateY(-20px) scale(1.1); }
  70%  { transform: translateY(-14px) scale(1.08) rotateZ(-2deg); }
  100% { transform: translateY(-16px) scale(1.06) rotateZ(0deg); }
}
.card-select {
  animation: cardSelect 200ms cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
}

/* Vote reveal stagger flip */
@keyframes flipReveal {
  0%   { transform: rotateY(180deg) scale(0.9); opacity: 0.7; }
  50%  { transform: rotateY(90deg) scale(1.05); }
  100% { transform: rotateY(0deg) scale(1); opacity: 1; }
}
.card-reveal {
  animation: flipReveal 400ms ease-out both;
  animation-delay: calc(var(--card-index, 0) * 150ms);
}

/* Consensus gold pulse (runs 3× then stops) */
@keyframes goldPulse {
  0%   { box-shadow: 0 0 0 0 rgba(250, 204, 21, 0.4); }
  50%  { box-shadow: 0 0 0 20px rgba(250, 204, 21, 0); }
  100% { box-shadow: 0 0 0 0 rgba(250, 204, 21, 0); }
}
.consensus-pulse {
  animation: goldPulse 1.2s ease-out 3;
}

/* Felt border gold flash on reveal */
@keyframes feltGold {
  0%   { border-color: rgba(212, 160, 23, 0.5); }
  100% { border-color: rgba(120, 79, 20, 0.3); }
}
.felt-reveal-flash {
  animation: feltGold 2s ease-out forwards;
}

/* Toast slide in/out — desktop (from right) */
@keyframes slideInRight {
  from { transform: translateX(calc(100% + 16px)); opacity: 0; }
  to   { transform: translateX(0); opacity: 1; }
}
@keyframes slideOutRight {
  from { transform: translateX(0); opacity: 1; }
  to   { transform: translateX(calc(100% + 16px)); opacity: 0; }
}

/* Toast slide in/out — mobile (from top) */
@media (max-width: 639px) {
  @keyframes slideInRight {
    from { transform: translateY(-100%); opacity: 0; }
    to   { transform: translateY(0); opacity: 1; }
  }
  @keyframes slideOutRight {
    from { transform: translateY(0); opacity: 1; }
    to   { transform: translateY(-100%); opacity: 0; }
  }
}

/* Toast progress bar shrink */
@keyframes shrinkWidth {
  from { width: 100%; }
  to   { width: 0%; }
}

/* Modal backdrop fade */
@keyframes backdropIn {
  from { opacity: 0; }
  to   { opacity: 1; }
}
@keyframes backdropOut {
  from { opacity: 1; }
  to   { opacity: 0; }
}
.modal-backdrop-in  { animation: backdropIn 150ms ease-out forwards; }
.modal-backdrop-out { animation: backdropOut 120ms ease-in forwards; }

/* Modal card slide up */
@keyframes modalSlideUp {
  from { transform: translateY(12px) scale(0.97); opacity: 0; }
  to   { transform: translateY(0) scale(1); opacity: 1; }
}
.modal-card-in { animation: modalSlideUp 180ms cubic-bezier(0.34, 1.2, 0.64, 1) forwards; }

/* Observer callout / "You voted" banner slide-down */
@keyframes fadeSlideDown {
  from { opacity: 0; transform: translateY(-6px); max-height: 0; }
  to   { opacity: 1; transform: translateY(0); max-height: 100px; }
}

/* Global touch target enforcement */
@media (pointer: coarse) {
  button, [role="button"], [role="radio"], [role="menuitem"] {
    min-height: 44px;
    min-width: 44px;
  }
}

/* ─── REDUCED MOTION OVERRIDES ─────────────────────────────── */
@media (prefers-reduced-motion: reduce) {
  .card-select,
  .card-reveal,
  .consensus-pulse,
  .felt-reveal-flash,
  .modal-backdrop-in,
  .modal-backdrop-out,
  .modal-card-in,
  .chip-in {
    animation: none !important;
    transition: none !important;
  }

  /* Instant card flip — no rotation */
  .preserve-3d {
    transition: none !important;
  }

  /* Replace ping with static dot */
  .animate-ping {
    animation: none !important;
    opacity: 1 !important;
  }
}
```

**Tailwind v4 note:** Do not use `theme()` or `@apply` with custom tokens in keyframes. Reference raw CSS values directly (e.g., `rgba(250, 204, 21, 0.4)`) rather than `var(--color-gold-400)` inside `@keyframes` — Tailwind v4 does not resolve CSS variables inside keyframe blocks during the build pass.

---

## Section 5: File Map — What to Create vs Modify

| Component | Action | File Path | Notes |
|---|---|---|---|
| `ConfirmationModal` | CREATE | `src/components/ConfirmationModal.tsx` | New reusable dialog; 5 content variants |
| `ToastProvider` | CREATE | `src/components/ToastProvider.tsx` | Context + queue manager; wraps app root |
| `Toast` | CREATE | `src/components/Toast.tsx` | Individual toast unit with progress bar |
| `StoryBanner` | CREATE | `src/components/StoryBanner.tsx` | Editable for admin, read-only for others |
| `GameHeader` | CREATE | `src/components/GameHeader.tsx` | Extract from GameBoard; new connection/participant features |
| `AdminControlBar` | CREATE | `src/components/AdminControlBar.tsx` | Replace current AdminControls; new strip layout |
| `ParticipantDrawer` | CREATE | `src/components/ParticipantDrawer.tsx` | Mobile bottom sheet wrapping ParticipantList |
| `useToast` | CREATE | `src/hooks/useToast.ts` | Hook to push toasts from any component |
| `useConfirmation` | CREATE | `src/hooks/useConfirmation.ts` | Hook to trigger ConfirmationModal imperatively |
| `GameBoard` | MODIFY | `src/components/GameBoard.tsx` | Major layout restructure; add new component slots |
| `VotingCards` | MODIFY | `src/components/VotingCards.tsx` | Keyboard nav, shortcuts overlay, responsive sizes, grouping |
| `ParticipantList` | MODIFY | `src/components/ParticipantList.tsx` | Split Players/Observers sections; remove vote-count header |
| `ParticipantCard` | MODIFY | `src/components/ParticipantCard.tsx` | "..." overflow menu; online dot; observer badge; role-aware |
| `ResultsDisplay` | MODIFY | `src/components/ResultsDisplay.tsx` | Sorted votes, full names, divergence indicator, copy button, reveal animation |
| `JoinForm` | MODIFY | `src/components/JoinForm.tsx` | Role toggle, observer callout, character count, updated submit |
| `AdminControls` | DELETE | `src/components/AdminControls.tsx` | Replaced entirely by AdminControlBar |
| `useGameActions` | MODIFY | `src/hooks/useGameActions.ts` | Add `role` to join, add `setStory` |
| `useGameSSE` | MODIFY | `src/hooks/useGameSSE.ts` | Pass participantId query param; detect kicked event |
| `game-service.ts` | MODIFY | `src/lib/game-service.ts` | See Section 3.1 |
| `types.ts` | MODIFY | `src/lib/types.ts` | See Section 2 |
| `globals.css` | MODIFY | `src/app/globals.css` | See Section 4 |
| `join route` | MODIFY | `src/app/api/game/join/route.ts` | Accept `role` in request body |
| `story route` | CREATE | `src/app/api/game/story/route.ts` | PATCH endpoint for story title/description |
| `sse route` | MODIFY | `src/app/api/sse/game/route.ts` | Accept `participantId` query param; call markOnline |

---

## Section 6: Component Implementation Details

---

### JoinForm

- **File:** `src/components/JoinForm.tsx`
- **Action:** MODIFY

**Props interface** (unchanged externally, internal state grows):

```typescript
interface JoinFormProps {
  onJoin: (name: string, avatar: string, role: ParticipantRole) => Promise<void>;
}
```

**Key implementation notes:**
- Add `role` state: `const [role, setRole] = useState<ParticipantRole>('player')`
- Character count: render when `name.length >= 15`. Color logic: `< 18` → `text-casino-muted`, `>= 18` → `text-gold-500`, `=== 20` → `text-casino-red-light`
- Observer callout: conditionally render with `animate-[fadeSlideDown_150ms_ease-out]` when `role === 'observer'`. Use `overflow-hidden` on wrapper for the height animation to work
- Role toggle buttons: use `role="group"` on wrapper div with `aria-label="Participation mode"`. Each button gets `role="radio"` and `aria-checked`
- Avatar grid: implement `onKeyDown` handler for arrow key navigation within the 4×3 grid. Grid is 4 columns — right arrow = index + 1, down arrow = index + 4, wrap at edges
- Form: `<form role="form" aria-label="Join the session">`
- Error container: `role="alert"` + `aria-live="assertive"`
- Pass `role` to `onJoin` call

**Dependencies:** `AvatarPicker` (unchanged), `ParticipantRole` type

**Acceptance criteria:**
- [ ] Submitting with empty name shows error; input border becomes `border-casino-red`
- [ ] Character count appears only when `name.length >= 15`
- [ ] Character count shows `text-casino-red-light` at exactly 20 characters
- [ ] Observer callout animates in when Observer tab is clicked; animates out (or collapses) when Player tab is clicked
- [ ] Pressing Tab navigates: Name → Player toggle → Observer toggle → first avatar → Submit
- [ ] Arrow keys navigate the avatar grid; wraps at row/column edges
- [ ] Submit button is `disabled` (not `aria-disabled`) while joining
- [ ] API error replaces inline form error; button re-enables after API error

---

### GameHeader

- **File:** `src/components/GameHeader.tsx`
- **Action:** CREATE 🆕

**Props interface:**

```typescript
interface GameHeaderProps {
  roundNumber: number;
  participantCount: number;
  isConnected: boolean;
  onLeave: () => void;          // triggers ConfirmationModal in parent
}
```

**Key implementation notes:**
- Extract from `GameBoard.tsx` current `<header>` block and heavily extend
- `sticky top-0 z-50 h-14` — must not grow taller on any viewport
- Connection dot: use `animate-ping` on outer ring only when `isConnected === true`. During reconnecting state (isConnected false), show static red dot + `animate-pulse` on label text only — never ping a red dot
- `isConnected` is a boolean from `useGameSSE` but you need a third "reconnecting" state. Extend `useGameSSE` to expose `isReconnecting: boolean` by tracking whether the error handler has fired but a new open event has not yet arrived
- Leave button: `aria-label="Leave the session"` (not "Leave Table") per design spec
- Session name (desktop center): not available in current state — skip for Phase 1; add in Phase 2 if a session-name field is added to GameState

**Dependencies:** None (pure presentation)

**Acceptance criteria:**
- [ ] Green ping dot is animated when connected, static red dot when disconnected
- [ ] "Reconnecting..." label has `animate-pulse` (not the dot) when reconnecting
- [ ] Participant count badge hidden below `sm:` breakpoint
- [ ] Round pill hidden below `sm:` breakpoint
- [ ] Leave button always visible at all breakpoints
- [ ] `role="banner"` on `<header>` element
- [ ] Connection status div has `role="status"` and `aria-live="polite"`

---

### StoryBanner

- **File:** `src/components/StoryBanner.tsx`
- **Action:** CREATE 🆕

**Props interface:**

```typescript
interface StoryBannerProps {
  storyTitle: string;
  storyDescription: string;
  isAdmin: boolean;
  onSave: (title: string, description: string) => Promise<void>;
}
```

**Key implementation notes:**
- Ticket ID auto-detection: `const ticketMatch = storyTitle.match(/\b([A-Z]+-\d+)\b/)`; if found, show badge before title
- Admin edit mode: clicking the title or pencil icon enters edit mode. Use a controlled `<input>` (not `contenteditable`) — easier to manage focus and maxLength
- Auto-save: call `onSave` on both `blur` and `Enter` key. Cancel on `Escape` (revert to original value)
- Non-admin + no story: return `null` — banner does not render at all
- Non-admin + story set: render read-only strip
- Description toggle: `aria-expanded` + `aria-controls="story-description"` on chevron. Description area `id="story-description"`
- Saving state: disable input, show spinner in Save button
- The `group` class on the banner container enables the pencil icon's `opacity-0 group-hover:opacity-100` behavior
- Wrap the live title in an `aria-live="polite"` span so screen readers announce updates

**Dependencies:** `useGameActions` for `setStory`, or receive `onSave` prop

**Acceptance criteria:**
- [ ] Banner does not render when `storyTitle === ''` and `isAdmin === false`
- [ ] Admin sees italic placeholder "Click to add a story title..." when no title set
- [ ] Clicking placeholder or pencil icon enters edit mode (input receives focus)
- [ ] Pressing Enter saves; pressing Escape reverts to previous value
- [ ] Blurring the input saves (calls `onSave`)
- [ ] Ticket badge appears when title contains a pattern like `AUTH-142` or `PROJ-123`
- [ ] Description area expands/collapses with chevron; `aria-expanded` updates correctly
- [ ] `role="region"` and `aria-label="Current story being estimated"` on banner container
- [ ] Non-admin cannot interact with title (no cursor-pointer, no pencil icon)

---

### AdminControlBar

- **File:** `src/components/AdminControlBar.tsx`
- **Action:** CREATE 🆕 (replaces `AdminControls.tsx`)

**Props interface:**

```typescript
interface AdminControlBarProps {
  isRevealed: boolean;
  totalVoters: number;           // count of player-role participants only
  votedCount: number;            // count who have voted
  onReveal: () => void;          // parent handles confirmation logic
  onReset: () => void;           // parent handles confirmation logic
  isLoading?: boolean;           // true while waiting for server response
}
```

**Key implementation notes:**
- This component owns the Reveal button state machine but delegates confirmation to the parent via `onReveal`/`onReset`. The parent (`GameBoard`) wraps these in `useConfirmation`
- `hasVotes = votedCount > 0`; `allVoted = votedCount === totalVoters && totalVoters > 0`
- Reveal button states:
  1. `!hasVotes`: disabled — `aria-disabled="true"` + `aria-description="No votes cast yet"`
  2. `hasVotes && !allVoted`: warning state — first click sets local `showInlineConfirm = true`
  3. `showInlineConfirm`: renders inline confirmation sub-state (Confirm/Cancel in the bar itself); `role="alert"` on inline confirm container
  4. `allVoted`: primary gold state — clicking calls `onReveal` which triggers the modal in parent
  5. `isLoading`: spinner replaces button content
- "New Round" button (post-reveal): `aria-label="Start a new round — this will clear all current votes"` — clicking calls `onReset` which triggers the modal in parent
- Reset `showInlineConfirm` to `false` when `isRevealed` changes or when cancel is clicked
- `role="region"` + `aria-label="Session controls (admin)"` on the bar container

**Dependencies:** None external (parent provides all callbacks)

**Acceptance criteria:**
- [ ] Reveal button is `aria-disabled="true"` when `votedCount === 0`
- [ ] Reveal button shows warning style with pending count when `0 < votedCount < totalVoters`
- [ ] First click on warning-state button shows inline "X players haven't voted. Reveal anyway?" — does NOT immediately call `onReveal`
- [ ] Inline confirm's Confirm button calls `onReveal`; Cancel button resets to warning state
- [ ] Inline confirm container has `role="alert"` so screen readers announce it
- [ ] When `allVoted`, single click calls `onReveal` directly (no inline confirm)
- [ ] `isLoading` shows spinner; button becomes non-interactive
- [ ] New Round button only renders when `isRevealed === true`

---

### ConfirmationModal

- **File:** `src/components/ConfirmationModal.tsx`
- **Action:** CREATE 🆕

**Props interface:**

```typescript
interface ConfirmationModalProps {
  isOpen: boolean;
  config: ConfirmationModalConfig | null;
  onClose: () => void;
}
```

**Key implementation notes:**
- Focus trap: when `isOpen` becomes true, focus the Cancel button. Implement focus trap with `onKeyDown` capturing Tab/Shift+Tab to cycle within `[Cancel, Confirm, CloseX]`
- Escape key calls `onClose` (= Cancel)
- Backdrop click calls `onClose`
- Body scroll lock: `document.body.style.overflow = 'hidden'` on open; restore on close. Use `useEffect` cleanup
- Mobile: below `sm:` breakpoint, renders as bottom sheet (slide up from bottom) rather than centered card. Detect via CSS — add a `bottom-sheet` variant class when viewport width < 640. The simplest approach: always render the bottom-sheet markup but show/hide via responsive Tailwind classes on the two wrappers
- `role="dialog"` + `aria-modal="true"` + `aria-labelledby="modal-title"` + `aria-describedby="modal-body"`
- When modal closes, return focus to the element that triggered it. Use a `triggerRef` passed from the hook or stored before open
- Use `config.confirmVariant` to pick between gold gradient button and red button

**Hook: `src/hooks/useConfirmation.ts`** 🆕

```typescript
export function useConfirmation() {
  const [isOpen, setIsOpen] = useState(false);
  const [config, setConfig] = useState<ConfirmationModalConfig | null>(null);

  const confirm = useCallback((cfg: ConfirmationModalConfig) => {
    setConfig(cfg);
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    config?.onCancel?.();
  }, [config]);

  return { isOpen, config, confirm, close };
}
```

**Dependencies:** `ConfirmationModalConfig` type

**Acceptance criteria:**
- [ ] Focus moves to Cancel button immediately when modal opens
- [ ] Tab cycles Cancel → Confirm → CloseX → Cancel (wraps)
- [ ] Escape key closes modal (equivalent to Cancel)
- [ ] Clicking backdrop closes modal
- [ ] Body scroll is locked while modal is open
- [ ] `role="dialog"` + `aria-modal="true"` present
- [ ] Confirm button uses gold gradient when `confirmVariant === 'gold'`, red when `'red'`
- [ ] On mobile (< sm), modal appears as bottom sheet (slide up); on sm+, centered card
- [ ] Focus returns to triggering element when modal closes

---

### ToastProvider + Toast

- **File (provider):** `src/components/ToastProvider.tsx` 🆕
- **File (unit):** `src/components/Toast.tsx` 🆕
- **File (hook):** `src/hooks/useToast.ts` 🆕

**ToastProvider context:**

```typescript
interface ToastContextValue {
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
}
export const ToastContext = createContext<ToastContextValue | null>(null);
```

**Key implementation notes:**

`ToastProvider`:
- Maintains `toasts: Toast[]` state (max 3; if 4th arrives, remove oldest non-persistent toast first)
- Renders `<ToastContainer>` — positioned `fixed right-4 top-4 z-50` on desktop; full-width top on mobile
- Container has `role="region"` + `aria-label="Notifications"` + `aria-live="polite"`
- For `session-expired` and `kicked` toasts, use a separate `aria-live="assertive"` region
- Mount `ToastProvider` in the root layout, wrapping the app

`Toast` unit:
- Progress bar: use a CSS animation `shrinkWidth` with duration = `toast.dismissAfter`. Wire via `style={{ animationDuration: `${toast.dismissAfter}ms` }}`. The animation name is already defined in globals.css
- `useEffect` to auto-dismiss: `setTimeout(() => removeToast(id), dismissAfter)` when `!persistent`
- Entry animation: `animate-[slideInRight_250ms_ease-out]`
- Exit animation: add `slideOutRight` class before removing from DOM — use a short `setTimeout(remove, 200)` after marking exit
- Dismiss X button: `aria-label="Dismiss notification"`
- Progress bar: `aria-hidden="true"`
- Reconnected toast: auto-dismiss after 3000ms
- Error/Info: auto-dismiss after 5000ms

`useToast` hook:
```typescript
export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
```

**Wiring to SSE events** (in `useGameSSE` or a new `useGameEvents` hook):
- Detect kick: compare previous participant list to new state — if `currentUserId` was in `prev` and is not in `next`, fire `kicked` toast
- Detect reconnect: `isConnected` transitions false → true after a disconnect: fire `reconnected` toast
- Detect disconnect: `isConnected` transitions true → false: fire `disconnected` persistent toast, remove `disconnected` toast when reconnected

**Acceptance criteria:**
- [ ] Max 3 toasts visible at once; 4th arrival removes oldest non-persistent toast
- [ ] Disconnected toast persists until reconnect; reconnect removes it and fires "Back online" toast
- [ ] "Back online" toast auto-dismisses after 3 seconds
- [ ] Error and Info toasts auto-dismiss after 5 seconds
- [ ] Session-expired and kicked toasts persist; have no auto-dismiss
- [ ] Progress bar visually shrinks over dismiss duration
- [ ] Dismiss X button removes toast immediately
- [ ] Toast container has `role="region"` + `aria-live="polite"`
- [ ] `session-expired` and `kicked` toasts use `aria-live="assertive"` region

---

### ParticipantList

- **File:** `src/components/ParticipantList.tsx`
- **Action:** MODIFY

**Key implementation notes:**
- Split participants into two groups: `players = participants.filter(p => p.role === 'player')` and `observers = participants.filter(p => p.role === 'observer')`
- Remove the `{votedCount}/{totalCount} voted` header — vote status is per-card now. The vote count belongs in the felt table area only
- Render "Players" section + count badge, then "Observers" section + count badge (only if `observers.length > 0`)
- Pass `isOnline` and `role` down to `ParticipantCard`
- `<aside aria-label="Session participants">`; each section `<section aria-label="Players">` / `<section aria-label="Observers">`

**Acceptance criteria:**
- [ ] Players and Observers render in separate labeled sections
- [ ] Observers section does not render when no observers present
- [ ] "Voted/Waiting" section header removed
- [ ] Each `ParticipantCard` receives `isOnline` and `role` props

---

### ParticipantCard

- **File:** `src/components/ParticipantCard.tsx`
- **Action:** MODIFY (major rework)

**Updated Props interface:**

```typescript
interface ParticipantCardProps {
  participant: PublicParticipant;
  isAdmin: boolean;
  isCurrentUser: boolean;
  isGameAdmin: boolean;
  isRevealed: boolean;
  onKick?: () => void;          // triggers ConfirmationModal in parent
  onTransferAdmin?: () => void; // executes immediately (no modal needed per spec)
}
```

**Key implementation notes:**
- Replace hover-only icon buttons with a "..." overflow menu trigger
- Menu state: `const [menuOpen, setMenuOpen] = useState(false)`
- Menu closes on: outside click (`useEffect` with `document.click`), Escape key, blur
- "..." trigger: `aria-haspopup="menu"` + `aria-expanded={menuOpen}` + `aria-label={`Player options for ${participant.name}`}`
- Dropdown: `role="menu"` with items as `role="menuitem"`. Arrow keys navigate items; Escape closes and returns focus to trigger
- Online/offline dot: positioned on avatar, bottom-right. Has `aria-label="Online"` or `aria-label="Offline"` — color alone is not sufficient
- Observer card: does not show vote status at all; shows `👁 Observing` in the status row
- Vote status fix: change "Waiting..." from `text-casino-muted` to `text-white/70` (WCAG fix per spec)
- Thinking animation: three spans with staggered `animate-bounce` and `aria-label="Still thinking"` on container
- Admin actions only visible when `isGameAdmin && !isCurrentUser`
- On mobile (`lg:opacity-0` removed on mobile), "..." button is always `opacity-100`

**Acceptance criteria:**
- [ ] "..." menu trigger is always visible on mobile (not opacity-0)
- [ ] "..." menu trigger is opacity-0 on desktop, opacity-100 on `group-hover`
- [ ] Menu opens on click, closes on Escape, closes on outside click
- [ ] `role="menu"` + `role="menuitem"` ARIA roles on menu and items
- [ ] Arrow keys navigate menu items; focus wraps
- [ ] Online/offline dot has `aria-label` attribute (not just color)
- [ ] Observer participants show "👁 Observing" — no voted/waiting status
- [ ] "Waiting..." text is `text-white/70` (not `text-casino-muted`)
- [ ] Offline player card has `opacity-60` on the card itself

---

### VotingCards

- **File:** `src/components/VotingCards.tsx`
- **Action:** MODIFY (significant additions)

**Updated Props interface:**

```typescript
interface VotingCardsProps {
  selectedValue: CardValue | null;
  onVote: (value: CardValue | null) => void;
  disabled?: boolean;
  isObserver?: boolean;         // if true, hide entire card section
}
```

**Key implementation notes:**
- If `isObserver`, return `null` — observers see no voting cards
- Split cards into two groups: `NUMERIC_CARDS` and `['?', '☕']`. Render with a visual divider between them (hidden on mobile < sm)
- Keyboard shortcuts global listener:
  ```
  '0' → '0',  '1' → '1',  '2' → '2',  '3' → '3',
  '5' → '5',  '8' → '8',  't' → '13', 'u' → '21',
  '?' or '/' → '?',   'b' → '☕'
  'Escape' → null (deselect)
  ```
  Add listener via `useEffect` with `document.addEventListener('keydown', handler)`. Guard: skip if `document.activeElement` is an `input`, `textarea`, or `[contenteditable]` element, and skip if `disabled`
- Arrow key navigation within the radiogroup: `onKeyDown` on the radiogroup container. Left/right moves focus between cards; wraps at ends. Enter/Space selects focused card
- "You voted: X" banner: render above cards when `selectedValue !== null && !disabled`. Use `animate-[fadeSlideDown_200ms_ease-out]`. `role="status"` + `aria-live="polite"`
- Shortcut overlay: toggle via `showShortcuts` state. Position `absolute bottom-full` relative to the inner wrapper. `role="tooltip"` + `id="kbd-shortcuts"`. Button trigger: `aria-expanded={showShortcuts}` + `aria-controls="kbd-shortcuts"`
- Radiogroup: `role="radiogroup"` + `aria-label="Your voting hand"` + `aria-required="true"`
- Each card button: `role="radio"` + `aria-checked={isSelected}` + `aria-label` (e.g., `"Vote 5"`, `"Vote — I'm uncertain"` for ?, `"Vote — Request a break"` for ☕) + `aria-keyshortcuts` attribute
- Disabled state per card: `aria-disabled="true"` + `aria-description="Voting is locked — cards have been revealed"` (not `disabled` HTML attr, so it remains focusable for screen readers)
- Mobile card sizes: `w-9 h-[52px] gap-0.5` below sm; `w-12 h-[72px] gap-2` at sm; `w-[72px] h-[104px] gap-3` at md+
- `.card-select` class: apply only when `isSelected` transitions from false to true. Use `useRef` to track previous selected value and add class via a one-shot `useState` that resets after animation completes (200ms)

**Dependencies:** `PokerCard`, `NUMERIC_CARDS` constant

**Acceptance criteria:**
- [ ] Pressing `5` key selects the 5 card (when no input is focused and not disabled)
- [ ] Pressing `t` selects the 13 card
- [ ] Pressing `Escape` deselects the current card
- [ ] Keyboard shortcuts do nothing when an input element is focused
- [ ] "You voted: X" banner appears above cards after selection with slide-down animation
- [ ] "You voted: X" banner has `role="status"` and `aria-live="polite"`
- [ ] Visual divider between numeric and special cards is visible at `sm:` and above; hidden on mobile
- [ ] All 10 cards fit in a single row at 375px (no wrapping)
- [ ] Shortcut overlay closes when clicked outside or Escape pressed
- [ ] Observer role: entire card section does not render
- [ ] `role="radiogroup"` on card row container

---

### ResultsDisplay

- **File:** `src/components/ResultsDisplay.tsx`
- **Action:** MODIFY

**Updated Props interface:**

```typescript
interface ResultsDisplayProps {
  results: RoundResults;
  storyTitle: string;           // for copy payload
  roundNumber: number;          // for copy payload
}
```

**Key implementation notes:**
- Sort `results.votes` before rendering: numeric values ascending, then `?`, then `☕`
  ```typescript
  const ORDER: Record<string, number> = { '?': 98, '☕': 99 };
  const sorted = [...results.votes].sort((a, b) => {
    const aNum = ORDER[a.vote] ?? Number(a.vote);
    const bNum = ORDER[b.vote] ?? Number(b.vote);
    return aNum - bNum;
  });
  ```
- Divergence indicator: render when `results.spread !== null && results.spread > 5 && !results.consensus`
- Consensus hero: apply `consensus-pulse` class to the hero container. Also apply `felt-reveal-flash` class to the felt table border — pass an `onReveal` callback up or handle via a context/event
- Revealed card stagger: pass `style={{ '--card-index': i } as React.CSSProperties}` and add `card-reveal` class to each card wrapper
- Name below card: change `max-w-[48px] truncate` to `max-w-[72px] text-center leading-tight` allowing 2-line wrap
- ? callout: list names — extract from `results.votes.filter(v => v.vote === '?').map(v => v.name).join(', ')`
- ☕ callout: same pattern
- Copy button: `onClick` builds the plaintext payload and calls `navigator.clipboard.writeText(...)`. On success, set local `copied = true` for 2 seconds then reset. `aria-label` updates from "Copy results to clipboard" to "Results copied to clipboard" when copied
- Distribution bars: add `role="img"` + `aria-label="Vote distribution: {value} received {N} votes"` to each bar row. Alternatively, render a visually hidden `<table>` alongside the visual bars
- Results region: `role="region"` + `aria-label="Round results"`
- Announce results: wrap hero number in an `aria-live="assertive"` span that is populated only on first render of results (use `useRef` to track if it's the first mount)

**Acceptance criteria:**
- [ ] Votes are sorted: numeric ascending, then ?, then ☕
- [ ] Full names shown below each revealed card (max 2-line wrap, no `truncate`)
- [ ] Consensus hero container has `consensus-pulse` class applied
- [ ] Divergence indicator ("Wide spread") appears when `spread > 5` and no consensus
- [ ] Copy button text changes to "Copied! ✓" for 2 seconds after click
- [ ] Copy button `aria-label` updates after copy
- [ ] Distribution bars have accessible `role="img"` labels

---

### ParticipantDrawer (mobile)

- **File:** `src/components/ParticipantDrawer.tsx`
- **Action:** CREATE 🆕

**Props interface:**

```typescript
interface ParticipantDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;    // renders ParticipantList
  votedCount: number;
  totalVoters: number;
}
```

**Key implementation notes:**
- Floating pill trigger lives in `GameBoard` (not this component): `fixed bottom-6 right-4 z-30 lg:hidden`
- This component is the bottom drawer only, rendered in a portal (`createPortal` to `document.body`)
- Transition: `translate-y-full` → `translate-y-0` over 300ms when `isOpen` changes
- Backdrop behind drawer: `fixed inset-0 bg-casino-black/60 z-40` — clicking it calls `onClose`
- Drag handle at top: decorative `h-1 w-10 rounded-full bg-casino-border mx-auto mb-4`
- Scroll: `max-h-[70vh] overflow-y-auto`
- `aria-label="Participant list"` on the drawer; `role="dialog"` + `aria-modal="true"`

**Acceptance criteria:**
- [ ] Drawer slides up from bottom when pill is tapped
- [ ] Clicking backdrop closes drawer
- [ ] Drawer does not render on `lg:` and above (use CSS `lg:hidden` on the portal container)
- [ ] Floating pill shows `👥 {voted}/{total}` count; count is `text-gold-500` when not all voted
- [ ] Max height `70vh`; content scrollable

---

### GameBoard

- **File:** `src/components/GameBoard.tsx`
- **Action:** MODIFY (structural rework)

**Updated Props interface:**

```typescript
interface GameBoardProps {
  gameState: PublicGameState;
  currentUserId: string;
  isConnected: boolean;
  onVote: (value: CardValue | null) => void;
  onReveal: () => void;         // now always goes through confirmation
  onReset: () => void;          // now always goes through confirmation
  onKick: (targetId: string) => void;
  onTransferAdmin: (targetId: string) => void;
  onLeave: () => void;
  onSetStory: (title: string, description: string) => Promise<void>;
}
```

**Key implementation notes:**
- `GameBoard` owns `useConfirmation()` and wires all destructive actions through it
- Destructive action wiring pattern:
  ```typescript
  const handleReveal = () => {
    if (allVoted) {
      confirm({ title: 'Reveal Cards?', ..., onConfirm: onReveal, confirmVariant: 'gold' });
    }
    // else: AdminControlBar handles inline confirm for partial-vote case
  };
  const handleReset = () => {
    confirm({ title: 'Start New Round?', ..., onConfirm: onReset, confirmVariant: 'red' });
  };
  const handleKick = (targetId: string, name: string) => {
    confirm({ title: `Remove ${name}?`, ..., onConfirm: () => onKick(targetId), confirmVariant: 'red' });
  };
  const handleLeave = () => {
    const isAdmin = currentUserId === gameState.adminId;
    confirm({ title: isAdmin ? 'Leave as Admin?' : 'Leave the Table?', ..., onConfirm: onLeave, confirmVariant: isAdmin ? 'red' : 'gold' });
  };
  ```
- New layout structure (replace current `<div className="flex min-h-screen flex-col">`):
  ```
  <div className="flex h-screen flex-col overflow-hidden">
    <GameHeader ... />
    <StoryBanner ... />
    <div className="flex flex-1 overflow-hidden">
      <aside className="hidden lg:flex w-72 ...">  ← desktop sidebar
        <ParticipantList ... />
      </aside>
      <main className="flex flex-1 flex-col overflow-hidden">
        <div className="felt-area flex flex-1 items-center justify-center p-6 overflow-y-auto">
          {felt table content — no AdminControls inside}
        </div>
        {isAdmin && <AdminControlBar ... />}
        <VotingCards ... isObserver={currentUser?.role === 'observer'} />
      </main>
    </div>
    {/* Mobile floating pill + drawer */}
    <ParticipantDrawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)}>
      <ParticipantList ... />
    </ParticipantDrawer>
    {/* Skip to main content link */}
    <a href="#main-content" className="sr-only focus:not-sr-only ...">Skip to main content</a>
    <ConfirmationModal ... />
  </div>
  ```
- Skip-to-content link: visually hidden, first tab stop, `href="#main-content"`. Add `id="main-content"` to the `<main>` element
- Remove the current `AdminControls` usage inside the felt
- `totalVoters` for AdminControlBar = `gameState.participants.filter(p => p.role === 'player').length`

**Acceptance criteria:**
- [ ] AdminControlBar renders below the felt table, not inside it
- [ ] StoryBanner renders between header and the body flex row
- [ ] Sidebar is hidden below `lg:` breakpoint
- [ ] Floating participant pill visible below `lg:` breakpoint
- [ ] Skip-to-content link is the first focusable element in the tab order
- [ ] ConfirmationModal appears for: Reveal (all voted), New Round, Kick, Leave Table
- [ ] Observer participants cannot interact with VotingCards (section not rendered)

---

## Section 7: Implementation Order

### Phase 1 — Quick Wins (match stakeholder Phase 1)

Build in this sequence — each step unblocks the next:

1. **Type changes** (`src/lib/types.ts`)
   - Add `ParticipantRole`, `Toast`, `ToastType`, `ConfirmationModalConfig`, `ConfirmVariant`
   - Add `role`, `isOnline` to `Participant` and `PublicParticipant`
   - Add `storyTitle`, `storyDescription` to `GameState` and `PublicGameState`
   - Add `spread` to `RoundResults`

2. **game-service.ts** — initialize new state fields with defaults so existing code compiles
   - `storyTitle: ''`, `storyDescription: ''` in initial state
   - `role: 'player'`, `isOnline: false` in `join()`
   - `spread: null` in `computeResults()`
   - Add `markOnline()`, `setStory()`

3. **Join API route** — accept `role` parameter (backward-compatible; defaults to `'player'`)

4. **SSE route** — accept `participantId` query param and call `markOnline`

5. **`useGameSSE`** — pass `participantId` query param

6. **`useGameActions`** — add `role` to `join`, add `setStory`

7. **`ToastProvider` + `Toast` + `useToast`** — standalone; no dependencies on other new components

8. **`ConfirmationModal` + `useConfirmation`** — standalone; depends only on new types

9. **`ParticipantCard`** — MODIFY: "..." menu, online dot, observer badge, WCAG "Waiting" fix
   - "Waiting..." → `text-white/70` is the priority WCAG fix; do this first within this step

10. **`AdminControlBar`** — CREATE: new strip with reveal state machine; parent provides callbacks

11. **`GameBoard`** — restructure layout; wire confirmation hooks; plug in new components
    - Move AdminControls out of felt
    - Wire `handleReveal`, `handleReset`, `handleKick`, `handleLeave` through `useConfirmation`
    - Add floating participant pill

---

### Phase 2 — Core Redesign

12. **`JoinForm`** — add role toggle, observer callout, character count

13. **`StoryBanner`** — CREATE; wire to `setStory` action

14. **`GameHeader`** — CREATE; extract from GameBoard; add connection status improvements

15. **`ParticipantList`** — MODIFY: split Players/Observers sections; remove vote header

16. **`ParticipantDrawer`** — CREATE: mobile bottom drawer

17. **`GameBoard` layout pass 2** — integrate GameHeader, StoryBanner, ParticipantDrawer; sidebar responsive behavior

---

### Phase 3 — Polish & Enhancements

18. **`VotingCards`** — keyboard shortcuts, shortcut overlay, radio ARIA, observer gating, responsive sizes, visual grouping

19. **`ResultsDisplay`** — sorted votes, full names, divergence indicator, copy button, stagger animation, consensus pulse

20. **`globals.css`** — all new keyframes (many already needed in Phase 1/2; add remainder now if not already done)

21. **Accessibility audit pass** — verify all `aria-live`, focus order, focus trap, reduced-motion

22. **Felt diamond texture** — add `.felt-bg::after` to globals.css (last — purely cosmetic)

---

## Section 8: Accessibility Implementation Checklist

### JoinForm

- [ ] `<form>` has `role="form"` and `aria-label="Join the session"`
- [ ] Name `<input>` has `aria-required="true"` and `aria-describedby="name-hint name-error"`
- [ ] Character count span has `aria-live="polite"` and announces "20 of 20 characters used"
- [ ] Role toggle wrapper has `role="group"` and `aria-label="Participation mode"`
- [ ] Each role toggle button has `role="radio"` and `aria-checked={isSelected}`
- [ ] Avatar grid has `role="radiogroup"` and `aria-label="Choose your avatar"`
- [ ] Each avatar button has `role="radio"`, `aria-checked={selected}`, `aria-label={avatar.label}`
- [ ] Arrow keys navigate avatar grid (implement `onKeyDown` — right +1, down +4, wrap at edges)
- [ ] Error container has `role="alert"` and `aria-live="assertive"`
- [ ] Submit button uses HTML `disabled` attribute (not `aria-disabled`) so screen readers announce state

### GameHeader

- [ ] `<header>` has `role="banner"`
- [ ] Connection status div has `role="status"` and `aria-live="polite"`
- [ ] Leave button has `aria-label="Leave the session"`
- [ ] Round pill has `aria-label="Round {N}"` on the container element

### StoryBanner

- [ ] Banner has `role="region"` and `aria-label="Current story being estimated"`
- [ ] Story title input (edit mode) has `aria-label="Story title"` and `maxLength={120}`
- [ ] Pencil edit button has `aria-label="Edit story title"` and `aria-expanded={isEditing}`
- [ ] Description chevron has `aria-expanded={isDescriptionOpen}` and `aria-controls="story-description"`
- [ ] Description area has `id="story-description"`
- [ ] Title update wrapped in `aria-live="polite"` region to announce new story to screen readers

### ParticipantList / ParticipantCard

- [ ] `<aside>` has `aria-label="Session participants"`
- [ ] Players `<section>` has `aria-label="Players"`
- [ ] Observers `<section>` has `aria-label="Observers"` (when present)
- [ ] "..." menu trigger has `aria-haspopup="menu"` and `aria-expanded={menuOpen}`
- [ ] "..." menu trigger has `aria-label="Player options for {name}"`
- [ ] Menu has `role="menu"`; each item has `role="menuitem"`
- [ ] Arrow keys navigate menu items; Escape closes and returns focus to trigger
- [ ] Online dot has `aria-label="Online"` (green) or `aria-label="Offline"` (grey) — not color-only
- [ ] Vote status changes wrapped in `aria-live="polite"` per card (so "Voted" is announced when it updates)

### VotingCards

- [ ] Card row container has `role="radiogroup"`, `aria-label="Your voting hand"`, `aria-required="true"`
- [ ] Each card button has `role="radio"` and `aria-checked={isSelected}`
- [ ] Card 0: `aria-label="Vote 0"`, `aria-keyshortcuts="0"`
- [ ] Card 13: `aria-label="Vote 13"`, `aria-keyshortcuts="t"`
- [ ] Card 21: `aria-label="Vote 21"`, `aria-keyshortcuts="u"`
- [ ] Card ?: `aria-label="Vote — I'm uncertain"`, `aria-keyshortcuts="? /"`
- [ ] Card ☕: `aria-label="Vote — Request a break"`, `aria-keyshortcuts="b"`
- [ ] Disabled state: `aria-disabled="true"` + `aria-description="Voting is locked — cards have been revealed"` (keep focusable)
- [ ] Keyboard shortcut overlay has `role="tooltip"` and `id="kbd-shortcuts"`
- [ ] Shortcut hint button has `aria-expanded={showShortcuts}` and `aria-controls="kbd-shortcuts"` + `aria-label="Show keyboard shortcuts"`
- [ ] "You voted: X" confirmation banner has `role="status"` and `aria-live="polite"`

### AdminControlBar

- [ ] Admin bar has `role="region"` and `aria-label="Session controls (admin)"`
- [ ] Disabled reveal button: `aria-disabled="true"` + `aria-description="No votes cast yet"`
- [ ] Reveal button (all voted): `aria-label="Reveal all votes"`
- [ ] Inline confirm container: `role="alert"` (announces to screen readers when it appears)
- [ ] New Round button: `aria-label="Start a new round — this will clear all current votes"`

### ConfirmationModal

- [ ] Modal has `role="dialog"`, `aria-modal="true"`, `aria-labelledby="modal-title"`, `aria-describedby="modal-body"`
- [ ] Title element has `id="modal-title"`; body text element has `id="modal-body"`
- [ ] Focus moves to Cancel button on open
- [ ] Tab cycles within: Cancel → Confirm → CloseX → Cancel
- [ ] Escape closes modal
- [ ] Focus returns to triggering element on close
- [ ] Close X button has `aria-label="Close dialog"`

### ToastProvider

- [ ] Toast container has `role="region"` and `aria-label="Notifications"` and `aria-live="polite"`
- [ ] Separate container for assertive toasts: `aria-live="assertive"` (for session-expired, kicked)
- [ ] Each toast dismiss button has `aria-label="Dismiss notification"`
- [ ] Rejoin button in session-expired toast has `aria-label="Rejoin the session"`
- [ ] Progress bar has `aria-hidden="true"`

### Global

- [ ] Skip-to-content link is the first focusable element: `<a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:rounded-lg focus:bg-gold-400 focus:px-4 focus:py-2 focus:text-casino-black focus:font-semibold">Skip to main content</a>`
- [ ] Create two visually-hidden `aria-live` regions in the page root: one `polite` for general announcements, one `assertive` for critical events (reveal, kicked, disconnect)
- [ ] Verify all color pairs against WCAG AA after implementation (see design spec Section 6.1 table)

---

## Section 9: Testing Checklist

### Observer role flow
- [ ] Open join page; select Observer toggle; verify callout text appears
- [ ] Join as Observer; verify 👁 Observing badge in sidebar, in your own card
- [ ] Verify VotingCards section does not render for observer
- [ ] Join as Player in a second browser tab; verify Observer appears in "Observers" sidebar section
- [ ] As admin (another tab), try to kick the observer — verify confirmation modal appears
- [ ] Reveal cards as admin — verify Observer's presence does not affect vote count or average

### Keyboard voting flow
- [ ] Tab to the voting card radiogroup (should be reachable from keyboard)
- [ ] Press `5` key — card 5 should lift and be marked selected
- [ ] Press `5` again — card should deselect (toggle behavior)
- [ ] Press `t` — card 13 should select
- [ ] Press `b` — card ☕ should select
- [ ] Press `Escape` — card should deselect
- [ ] Focus an input (e.g. story title in edit mode) then press `5` — card should NOT select
- [ ] Arrow right/left navigates between cards within the radiogroup
- [ ] Enter/Space selects the focused card
- [ ] Open keyboard shortcut overlay with the hint button; verify it appears and closes on Escape

### Admin confirmation dialogs
- [ ] As admin with 0 votes: Reveal button is `aria-disabled`; clicking does nothing
- [ ] As admin with some (not all) votes: Reveal button shows warning style; clicking shows inline "X players haven't voted" — NOT a modal
- [ ] Click Confirm in inline confirmation — cards reveal
- [ ] Click Cancel in inline confirmation — returns to warning state
- [ ] As admin with all votes: Reveal button is gold primary; clicking opens ConfirmationModal
- [ ] In modal: press Escape → modal closes, no reveal
- [ ] In modal: click Cancel → modal closes, no reveal
- [ ] In modal: click Reveal → cards reveal
- [ ] As admin, click New Round → ConfirmationModal appears (red destructive button)
- [ ] As admin, hover "..." on a participant → menu opens → click "Remove from Session" → ConfirmationModal appears
- [ ] As admin, click Leave Table → ConfirmationModal with admin-transfer warning appears (red button)
- [ ] As non-admin, click Leave Table → ConfirmationModal appears (gold button, no transfer warning)

### Connection recovery
- [ ] Open game; disconnect network (DevTools → Offline) — disconnected toast appears
- [ ] Reconnect network — disconnected toast dismisses; "Back online" green toast appears for 3s
- [ ] While offline, check that game state has not changed (SSE auto-reconnects when back online)
- [ ] Simulate server restart (in dev: restart Next.js server) — session-expired toast appears with Rejoin button

### Mobile layout (test at 375px viewport)
- [ ] All 10 voting cards fit in a single row without wrapping
- [ ] Sidebar (participant list) is hidden — floating participant pill visible bottom-right
- [ ] Tap participant pill → bottom drawer slides up with participant list
- [ ] Tap backdrop behind drawer → drawer closes
- [ ] Admin bar crown icon shows (label hidden); button text visible
- [ ] Confirmation modal renders as bottom sheet (slide up from bottom)
- [ ] Story banner truncates to 1 line on mobile
- [ ] Leave button always visible in header

### Story context banner
- [ ] As admin, click "Click to add a story title..." → input appears with focus
- [ ] Type "AUTH-142 Add OAuth login" → ticket badge `AUTH-142` appears in preview
- [ ] Press Enter → input dismissed; banner shows title read-only
- [ ] Second browser tab (player) → title appears read-only immediately (SSE broadcast)
- [ ] As admin, hover over title → pencil icon appears; click pencil → edit mode
- [ ] Press Escape in edit mode → reverts to original title; edit mode closes
- [ ] As non-admin with no story set → banner does not render

### Accessibility smoke test
- [ ] Tab through join page: Name → Player toggle → Observer toggle → avatar grid → Submit
- [ ] Tab through game page: skip link → Leave button → edit story → shortcuts → voting cards → admin bar
- [ ] With screen reader: vote on a card → confirm "Your vote: 5 is registered" is announced
- [ ] With screen reader: admin reveals cards → "Cards revealed. Average: X." is announced assertively
- [ ] Check focus returns to "Reveal" button after closing ConfirmationModal via Cancel

---

## Section 10: Known Risks & Gotchas

### SSE singleton reconnection behavior
The SSE route at `src/app/api/sse/game/route.ts` uses a module-level singleton (`gameService`) that persists across requests in the same Node.js process. When the server restarts, the singleton resets — all participants, votes, and story state are wiped. Clients will auto-reconnect (EventSource reconnects by default) but will receive an empty `GameState`. The toast system should detect this via a `roundNumber` regression check: if new `state.roundNumber < prev.roundNumber` or `state.participants.length === 0` when we were in a session, fire the `session-expired` toast.

### localStorage keys in use
Currently only one key: `'participantId'`. Do not add more keys under similar names without checking — a `'participant'` key would conflict with existing storage logic in `useGameActions`.

### `markOnline` and SSE participantId timing
`markOnline` is called when the SSE connection opens, using the `participantId` query param. However, on first join, the participant joins via POST to `/api/game/join`, receives the `participantId`, stores it in localStorage, then opens the SSE connection. This is a ~100ms window where `isOnline` will be `false` for the new participant. This is acceptable — the first broadcast will show them as offline briefly, then the SSE open triggers `markOnline` and a new broadcast. Do not try to pre-populate `isOnline: true` in `join()` — the SSE connection has not opened yet at that point.

### TypeScript strict mode — new optional fields
The `role` field is required on `Participant` and `PublicParticipant` — it is not optional. TypeScript will flag any place that constructs a `Participant` without `role`. The only place this happens is `game-service.ts line 93`. Fix that first or the project will not compile.

### `spread` field on `RoundResults`
`spread` is `null` when there are fewer than 2 numeric votes. `ResultsDisplay` must guard: `{results.spread !== null && results.spread > 5 && !results.consensus && <DivergenceIndicator />}`. Do not skip the `!== null` check — `spread === 0` is valid (all same value) and must not show the divergence indicator.

### observer vote exclusion in computeResults
`computeResults` in game-service currently filters `this.state.participants.filter(p => p.vote !== null)`. After adding role support, it must also exclude observers: `filter(p => p.vote !== null && p.role !== 'observer')`. Failing to do this means an observer who somehow gets a vote set (e.g. via a direct API call) would corrupt the average.

### Tailwind v4 `@keyframes` and CSS variable resolution
Tailwind v4 uses `@theme inline` for token definitions. CSS custom properties (`var(--color-gold-400)`) defined in `@theme inline` are available in component stylesheets and Tailwind classes but are **not** reliably resolved inside `@keyframes` blocks during the PostCSS build pass. Use raw hex/rgba values inside keyframes (e.g. `rgba(250, 204, 21, 0.4)` not `rgba(var(--color-gold-400), 0.4)`).

### No WebSocket — SSE is unidirectional
SSE is receive-only. All state mutations must go through the REST API endpoints. This is already the pattern. Do not attempt to send data over the SSE connection. The story update, for example, must be a `PATCH /api/game/story` REST call even though the result is broadcast via SSE.

### `AdminControls.tsx` deletion
`AdminControls.tsx` is replaced by `AdminControlBar.tsx`. Before deleting it, search for any other imports: `grep -r "AdminControls" src/` — it is currently only imported in `GameBoard.tsx`. Remove both the import and the JSX usage in GameBoard before deleting the file to avoid TypeScript errors.

### Modal focus trap and `aria-modal`
Safari + VoiceOver does not respect `aria-modal="true"` for focus containment without a JS focus trap. The focus trap implementation in `ConfirmationModal` must be a real `onKeyDown` handler, not CSS alone. Test specifically in Safari with VoiceOver enabled.

### `ParticipantCard` "..." menu and `z-index`
The dropdown menu uses `absolute` positioning within a `relative` parent card. In a scrollable sidebar, this will be clipped by `overflow-y-auto` on the sidebar container. Fix: add `overflow: visible` to the `ParticipantCard` container (the `relative` element) and ensure the sidebar's `overflow-y-auto` container does not clip it. Alternative: render the dropdown in a portal anchored to the button's `getBoundingClientRect()` — simpler for the scrollable case.

### `useGameSSE` isReconnecting state
The current hook exposes only `isConnected: boolean`. The `GameHeader` needs a three-state `'connected' | 'reconnecting' | 'disconnected'` to show the correct animation. Extend the hook: track whether `onerror` has fired (`setIsReconnecting(true)`) and reset it when `onopen` fires again. The sequence is: `onopen` → connected; `onerror` (without prior close) → reconnecting; if EventSource is explicitly closed → disconnected.

### Mobile bottom drawer and iOS safe area
On iOS, the bottom drawer needs `padding-bottom: env(safe-area-inset-bottom)` to clear the home indicator. Use `pb-safe-bottom` (Tailwind CSS v4 safe area plugin) or add `paddingBottom: 'env(safe-area-inset-bottom)'` inline. The design spec references `pt-4 pb-safe-bottom` on the drawer — verify the Tailwind config has safe area support enabled.
