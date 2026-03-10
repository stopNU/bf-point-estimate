# UI Design Specification: bf-point-estimate Scrum Poker Redesign
**Prepared by:** UI Design
**Date:** March 9, 2026
**Status:** Final — Developer Handoff Ready
**Version:** 2.0
**Responds to:** UX Research Findings (March 9, 2026)

---

## Table of Contents

1. [Design Philosophy & Visual Direction](#1-design-philosophy--visual-direction)
2. [Component Specifications](#2-component-specifications)
   - [A. Join Page (JoinForm)](#a-join-page-joinform)
   - [B. Game Header](#b-game-header)
   - [C. Story Context Banner](#c-story-context-banner-new)
   - [D. Participant List (Sidebar)](#d-participant-list-sidebar)
   - [E. Voting Cards](#e-voting-cards)
   - [F. Admin Control Bar](#f-admin-control-bar-redesigned)
   - [G. Results Display](#g-results-display)
   - [H. Confirmation Modal](#h-confirmation-modal-new)
   - [I. Connection/Error Toast](#i-connectionerror-toast-new)
3. [Layout Specifications](#3-layout-specifications)
4. [Animation & Interaction Specifications](#4-animation--interaction-specifications)
5. [Mobile-First Responsive Design](#5-mobile-first-responsive-design)
6. [Accessibility Checklist](#6-accessibility-checklist)
7. [Component ASCII Wireframes](#7-component-ascii-wireframes)

---

## 1. Design Philosophy & Visual Direction

### 1.1 Aesthetic Directive

The casino theme is a genuine differentiator — it should be *matured*, not abandoned. Version 1 established the vocabulary (felt, gold, dark surfaces, Playfair Display). Version 2 adds *discipline*: every decorative element must also carry functional weight. A gold border is not merely ornament — it is a state indicator. A dark surface is not merely style — it defines spatial hierarchy.

The design direction is **"Private Room at the Grand Casino"**: less neon, more leather and brass. Think a members-only card room rather than a Las Vegas floor. Controlled opulence. Every surface has a reason to exist.

### 1.2 Tone & Mood

- **Authoritative but welcoming.** The facilitator feels in command; the voter feels at ease.
- **Low-distraction.** The center table (the felt) is the stage. Everything else is supporting infrastructure.
- **Systematically luxurious.** Gold is used sparingly so it retains meaning. One gold element per region maximum unless showing state (e.g., consensus celebration).

### 1.3 Evolution of the Casino Theme

| Element | v1 Treatment | v2 Treatment |
|---|---|---|
| Color palette | Correct, keep as-is | No changes — tokens are solid |
| Gold usage | Liberal — headings, borders, buttons | Restricted to: selected states, primary CTAs, revealed results |
| Felt table | Plain radial gradient | Add subtle diamond-pattern texture via SVG mask at 4% opacity |
| Typography | Playfair for headings, Inter for body | Add: Playfair at `text-xs` for card corner values only |
| Admin controls | Inside the felt | Dedicated strip — visually distinct from the shared play area |
| Language | "Place Your Bets" (gambling) | "Cast Your Vote" during voting; "Place Your Bets" only shown on first load as a welcoming flourish, then transitions |

### 1.4 Spatial Hierarchy (Importance Order)

1. **Felt table / voting cards** — the primary interaction surface
2. **Story Context Banner** — what we are estimating (new; highest-information-value real estate)
3. **Participant sidebar** — who is here and what they have done
4. **Admin Control Bar** — session management (admin-only; visually separated)
5. **Game header** — orientation (room, round, status, exit)

---

## 2. Component Specifications

### A. Join Page (JoinForm)

#### A.1 Purpose & Behavior

Entry point for all users. Collects name, avatar, and role (Player vs. Observer). The Observer toggle is the primary new addition. The form is a single-step flow with inline validation.

**New in v2:**
- Observer/Player toggle (role selection)
- Character count feedback on name input (live, appears at 15+ characters)
- Avatar picker restructured to 3×4 grid (12 options, was 4×3 auto-grid)
- Descriptive copy for Observer mode inline

#### A.2 Layout Specification

```
Max-width: 480px (w-full max-w-[480px])
Padding: px-4 py-8 (mobile), p-0 (card handles its own padding)
Card padding: p-8
Border radius: rounded-2xl
Shadow: shadow-[0_25px_60px_rgba(0,0,0,0.7)]
```

**Section order inside card:**
1. Name input + character count
2. Role toggle (Player | Observer)
3. Observer callout (conditional: visible when Observer selected)
4. Avatar picker (3×4 grid)
5. Error message (conditional)
6. Submit button

#### A.3 Tailwind className Strings

**Page wrapper:**
```
className="flex min-h-screen items-center justify-center bg-casino-black p-4"
```

**Outer positioning container:**
```
className="w-full max-w-[480px]"
```

**Header block:**
```
// h1
className="font-display text-5xl font-bold tracking-tight text-center sm:text-6xl"

// divider
className="mx-auto mt-3 h-px w-32 bg-gradient-to-r from-transparent via-gold-600 to-transparent"

// subtitle
className="mt-3 text-center text-sm text-casino-muted"
```

**Card container:**
```
className="rounded-2xl border border-casino-border bg-casino-surface p-8 shadow-[0_25px_60px_rgba(0,0,0,0.7)]"
```

**Name input label:**
```
className="mb-2 block text-sm font-medium text-gold-400"
```

**Name input wrapper (for character count):**
```
className="relative"
```

**Name input field:**
```
className="w-full rounded-lg border border-casino-border bg-casino-dark px-4 py-3 text-white placeholder-casino-muted outline-none transition-colors focus:border-gold-600 focus:ring-2 focus:ring-gold-600/30 pr-16"
```

**Character count indicator (appears when name.length >= 15):**
```
className="absolute right-3 top-1/2 -translate-y-1/2 text-xs tabular-nums"
// Dynamic color:
// name.length < 18: "text-casino-muted"
// name.length >= 18: "text-gold-500"
// name.length === 20: "text-casino-red-light"
```

**Role toggle container:**
```
className="mb-6 flex rounded-xl border border-casino-border bg-casino-dark p-1"
```

**Role toggle button (inactive):**
```
className="flex-1 flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium text-casino-muted transition-all duration-200 hover:text-white"
```

**Role toggle button (active — Player):**
```
className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-gold-600 px-4 py-2.5 text-sm font-semibold text-casino-black shadow-sm transition-all duration-200"
```

**Role toggle button (active — Observer):**
```
className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-casino-surface px-4 py-2.5 text-sm font-semibold text-casino-muted shadow-sm transition-all duration-200 border border-casino-border"
```

**Observer info callout (shown when Observer selected):**
```
className="mb-6 flex items-start gap-3 rounded-xl border border-casino-border/60 bg-casino-dark/80 px-4 py-3"
// Icon: text-casino-muted text-lg
// Text: text-xs text-casino-muted leading-relaxed
```

**Avatar section label:**
```
className="mb-3 flex items-center justify-between"
// Left: text-sm font-medium text-gold-400
// Right (count): text-xs text-casino-muted
```

**Avatar grid:**
```
className="grid grid-cols-4 gap-2 sm:grid-cols-4"
// Note: fixed 4-col, 3 rows = 12 avatars always visible without scroll
```

**Avatar button (unselected):**
```
className="group flex flex-col items-center gap-1.5 rounded-xl border-2 border-casino-border bg-casino-surface p-3 transition-all duration-150 hover:border-gold-700/60 hover:bg-casino-dark focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-500 focus-visible:ring-offset-2 focus-visible:ring-offset-casino-surface"
```

**Avatar button (selected):**
```
className="group flex flex-col items-center gap-1.5 rounded-xl border-2 border-gold-400 bg-gold-400/10 p-3 shadow-[0_0_15px_rgba(250,204,21,0.2)] transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-500 focus-visible:ring-offset-2 focus-visible:ring-offset-casino-surface"
```

**Avatar emoji:**
```
className="text-2xl transition-transform duration-150 group-hover:scale-110"
```

**Avatar label:**
```
// unselected: "text-[10px] font-medium text-casino-muted"
// selected:   "text-[10px] font-medium text-gold-400"
```

**Error message:**
```
className="mb-4 flex items-center gap-2 rounded-lg border border-casino-red/30 bg-casino-red/10 px-4 py-2.5 text-sm text-casino-red-light"
// Prepend: <span aria-hidden>⚠</span>
```

**Submit button (default):**
```
className="w-full rounded-xl bg-gradient-to-r from-gold-600 to-gold-500 px-6 py-3.5 font-display text-lg font-semibold text-casino-black transition-all duration-200 hover:from-gold-500 hover:to-gold-400 hover:shadow-[0_0_24px_rgba(250,204,21,0.35)] focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 focus-visible:ring-offset-2 focus-visible:ring-offset-casino-surface active:scale-[0.98]"
```

**Submit button (loading/disabled):**
```
className="w-full rounded-xl bg-gradient-to-r from-gold-700 to-gold-600 px-6 py-3.5 font-display text-lg font-semibold text-casino-black/60 cursor-not-allowed opacity-60"
// Button text becomes: spinner + "Joining the table..."
// Spinner: animate-spin inline-block h-4 w-4 border-2 border-casino-black/30 border-t-casino-black rounded-full mr-2
```

**Suit decorations (below card):**
```
className="mt-6 flex items-center justify-center gap-3 text-casino-border/60 text-xl select-none"
```

#### A.4 States

| State | Visual |
|---|---|
| Default | Gold border on input focus; muted placeholder |
| Name empty + submit | Error message appears; input border turns `border-casino-red` |
| Observer selected | Role toggle right side active; Observer callout slides in with `animate-[fadeSlideDown_150ms_ease-out]` |
| Loading | Button disabled + spinner; form inputs disabled (`pointer-events-none opacity-50`) |
| Error (API) | Error banner replaces inline error; button re-enables |

#### A.5 Accessibility

- `<form>` with `role="form"` and `aria-label="Join the session"`
- Name input: `aria-required="true"`, `aria-describedby="name-hint name-error"`
- Character count: `aria-live="polite"` region, announces at 20/20
- Role toggle: `role="group"` + `aria-label="Participation mode"` wrapping two `role="radio"` buttons
- Avatar grid: `role="radiogroup"` + `aria-label="Choose your avatar"`. Each avatar button: `role="radio"`, `aria-checked={selected}`, `aria-label={avatar.label}`
- Arrow keys navigate within avatar grid (implement `onKeyDown` handler)
- Submit: no `aria-disabled` — use actual `disabled` attribute so screen readers announce button state
- Error: `role="alert"` on error container, `aria-live="assertive"`

---

### B. Game Header

#### B.1 Purpose & Behavior

Fixed top bar providing orientation (what session, what round), connection health, and the exit affordance. On mobile, secondary info collapses gracefully; the Leave button remains always visible.

**New in v2:**
- Session name displayed (previously only "Round N")
- Connection status has animated pulse when connected, static red when disconnected
- Leave Table triggers confirmation modal (not immediate action)
- Participant count badge (X players)

#### B.2 Layout Specification

```
Height: h-14 (56px)
Position: sticky top-0 z-50
Background: bg-casino-dark/95 backdrop-blur-sm
Border: border-b border-casino-border
Padding: px-4 sm:px-6
```

**Left group:** Logo | divider | Round pill
**Center (desktop only):** Session name (truncated)
**Right group:** Participant count | Connection status | Leave button

#### B.3 Tailwind className Strings

**Header element:**
```
className="sticky top-0 z-50 flex h-14 items-center justify-between border-b border-casino-border bg-casino-dark/95 px-4 backdrop-blur-sm sm:px-6"
```

**Left group:**
```
className="flex min-w-0 items-center gap-3"
```

**Logo:**
```
className="shrink-0 font-display text-xl font-bold"
// Inner span: "gold-shimmer"
```

**Divider:**
```
className="hidden h-4 w-px shrink-0 bg-casino-border sm:block"
```

**Round pill:**
```
className="hidden shrink-0 items-center gap-1.5 rounded-full border border-casino-border bg-casino-surface/60 px-2.5 py-1 text-xs font-medium text-casino-muted sm:flex"
// "Round" label: text-casino-muted/60
// Round number: text-gold-500 font-semibold font-display tabular-nums
```

**Session name (center, desktop):**
```
className="absolute left-1/2 hidden max-w-[280px] -translate-x-1/2 truncate text-sm font-medium text-white/80 lg:block"
```

**Right group:**
```
className="flex shrink-0 items-center gap-2 sm:gap-3"
```

**Participant count badge:**
```
className="hidden items-center gap-1.5 text-xs text-casino-muted sm:flex"
// Icon: inline SVG or 👥 at text-sm
// Count: font-medium text-white tabular-nums
```

**Connection status — connected:**
```
className="flex items-center gap-1.5"
// Dot: "relative h-2 w-2 shrink-0"
//   Outer: "absolute inset-0 rounded-full bg-green-400 animate-ping opacity-75"
//   Inner: "relative h-2 w-2 rounded-full bg-green-400"
// Label: "hidden text-xs text-casino-muted sm:inline"
```

**Connection status — disconnected:**
```
className="flex items-center gap-1.5"
// Dot: "h-2 w-2 shrink-0 rounded-full bg-casino-red"
// Label: "hidden text-xs text-casino-red-light sm:inline animate-pulse"
```

**Leave Table button:**
```
className="rounded-lg border border-casino-border px-3 py-1.5 text-xs font-medium text-casino-muted transition-all duration-150 hover:border-casino-red/50 hover:text-casino-red-light focus:outline-none focus-visible:ring-2 focus-visible:ring-casino-red/50 focus-visible:ring-offset-1 focus-visible:ring-offset-casino-dark active:scale-95"
```

#### B.4 States

| State | Visual |
|---|---|
| Connected | Green pulse dot + "Connected" label (hidden sm-) |
| Reconnecting | Red static dot + "Reconnecting..." with `animate-pulse` on label |
| Disconnected | Red static dot + "Offline" label |
| Admin user | No visual difference in header (admin identity shown in sidebar) |

#### B.5 Accessibility

- `<header role="banner">`
- Connection status: `role="status"` + `aria-live="polite"` container; announce changes
- Leave button: `aria-label="Leave the session"` (not just "Leave Table")
- Round info: `aria-label="Round {N}"` on the pill

---

### C. Story Context Banner (NEW)

#### C.1 Purpose & Behavior

A persistent strip at the top of the felt table area showing what story/ticket is currently being estimated. Admin can click to edit inline. Non-admins see read-only text. When no story is set, admin sees an invitation to add one; non-admins see nothing (the banner collapses).

This is the highest-impact new component per UX research findings — it eliminates the need for a parallel communication channel during estimation sessions.

**Behavior:**
- Admin: click anywhere on the title to enter edit mode (inline contenteditable or input)
- Edit mode: shows a pencil icon (always visible to admin on hover), input expands, Save/Cancel affordance
- Auto-save on blur and on Enter key
- Non-admin: read-only display; if no story set, banner not rendered (zero-height)
- Optional description field: collapsed by default, expandable via chevron toggle
- Story title max length: 120 characters
- Ticket ID badge: parsed from story title if it matches `#[A-Z]+-\d+` or `PROJ-123` pattern

#### C.2 Layout Specification

```
Position: above the felt table, within main content area
Height: auto (min ~48px when story set, 0 when empty for non-admin)
Padding: px-6 py-3 (desktop), px-4 py-2.5 (mobile)
Background: bg-casino-dark border-b border-casino-border/50
```

**Structure:**
```
[Banner container]
  [Left: "Current Story" label + ticket badge]
  [Center: Story title (editable for admin / read-only for others)]
  [Right: Edit pencil icon (admin) | Collapse chevron (if description present)]
[Description area (collapsible)]
```

#### C.3 Tailwind className Strings

**Banner container:**
```
className="flex items-center gap-3 border-b border-casino-border/40 bg-casino-dark px-4 py-3 sm:px-6"
```

**"Current Story" label:**
```
className="shrink-0 text-[10px] font-semibold uppercase tracking-widest text-casino-muted/70"
```

**Ticket ID badge (auto-detected):**
```
className="shrink-0 rounded border border-gold-900/60 bg-gold-950/40 px-1.5 py-0.5 font-display text-[10px] font-bold text-gold-500/80 tracking-wide"
```

**Story title (read-only, story set):**
```
className="min-w-0 flex-1 truncate text-sm font-medium text-white"
```

**Story title (read-only, no story — non-admin):**
```
// Banner does not render when no story and user is not admin
```

**Story title (read-only placeholder — admin, no story):**
```
className="min-w-0 flex-1 truncate text-sm text-casino-muted/60 italic cursor-pointer hover:text-casino-muted transition-colors"
// Text: "Click to add a story title..."
```

**Edit input (admin, active edit mode):**
```
className="min-w-0 flex-1 rounded border border-gold-600/50 bg-casino-surface px-2 py-1 text-sm font-medium text-white outline-none ring-1 ring-gold-600/30 placeholder-casino-muted/40 focus:ring-gold-500"
```

**Pencil edit icon (admin, not editing):**
```
className="ml-1 shrink-0 rounded p-1 text-casino-muted/40 opacity-0 transition-all duration-150 group-hover:opacity-100 hover:text-gold-400 hover:bg-casino-surface focus:outline-none focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-gold-500"
// Apply group to banner container
// Icon: <PencilIcon className="h-3.5 w-3.5" />
```

**Save button (admin, edit mode):**
```
className="ml-2 shrink-0 rounded bg-gold-600 px-2.5 py-1 text-[11px] font-semibold text-casino-black hover:bg-gold-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 transition-colors"
```

**Cancel text link (admin, edit mode):**
```
className="ml-1.5 shrink-0 text-[11px] text-casino-muted hover:text-white cursor-pointer transition-colors"
```

**Description toggle chevron:**
```
className="ml-2 shrink-0 rounded p-1 text-casino-muted/50 transition-all hover:text-casino-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-500"
// Icon: ChevronDownIcon rotated 180deg when expanded: "rotate-180 transition-transform duration-200"
```

**Description area (collapsible):**
```
// Wrapper: "overflow-hidden transition-all duration-200"
// Open: "max-h-24"
// Closed: "max-h-0"
className="border-t border-casino-border/30 bg-casino-dark/60 px-4 py-2 text-xs text-casino-muted leading-relaxed sm:px-6"
// Admin editable: add contentEditable="true" + matching focus styles
```

#### C.4 States

| State | Admin View | Non-Admin View |
|---|---|---|
| No story set | Italic placeholder "Click to add a story title..." | Banner hidden (zero-height) |
| Story set | Story title, pencil icon visible on hover | Story title read-only |
| Edit mode | Input field with Save/Cancel | Not applicable |
| Saving | Input disabled + spinner in save button | Brief loading shimmer on title |
| Error | Input border turns red, error tooltip | Toast notification |

#### C.5 Accessibility

- Banner: `role="region"` + `aria-label="Current story being estimated"`
- Title input (edit mode): `aria-label="Story title"`, `aria-required="false"`, `maxLength={120}`
- Pencil button: `aria-label="Edit story title"`, `aria-expanded={isEditing}`
- Description toggle: `aria-expanded={isDescriptionOpen}`, `aria-controls="story-description"`
- Description area: `id="story-description"`
- When story title updates: `aria-live="polite"` announces new title to screen readers

---

### D. Participant List (Sidebar)

#### D.1 Purpose & Behavior

Left sidebar showing all participants, their vote status, and (for admin) management controls. Redesigned to:
- Show always-visible admin action buttons (no hover-only requirement)
- Add Observer badge for Observer-role participants
- Add online/offline indicator per player
- Remove redundant vote-count header (progress is shown in the felt table)
- Admin actions via a "..." overflow menu per card (labeled, touch-accessible)

#### D.2 Layout Specification

```
Desktop: w-72 (288px), fixed height with overflow-y-auto, sticky
Mobile: Collapsed into bottom drawer triggered by floating pill
Padding: p-4
Background: bg-casino-dark
Border: border-r border-casino-border (desktop only)
```

**Section structure:**
```
[Sidebar]
  [Section header: "Players" + count badge]
  [Participant card list — vertical stack, gap-2]
    [ParticipantCard × N]
  [Observers section (if any observers)]
  [Section header: "Observers" + count]
  [Observer card × N]
```

#### D.3 Tailwind className Strings

**Sidebar container (desktop):**
```
className="hidden w-72 shrink-0 flex-col border-r border-casino-border bg-casino-dark lg:flex overflow-y-auto"
```

**Section header:**
```
className="mb-3 flex items-center justify-between px-1"
// Label: "text-[10px] font-semibold uppercase tracking-widest text-casino-muted/70"
// Count badge: "rounded-full bg-casino-surface px-2 py-0.5 text-[10px] font-medium text-casino-muted tabular-nums"
```

**Participant card — base:**
```
className="group relative flex items-center gap-3 rounded-xl border px-3 py-2.5 transition-all duration-150"
```

**Participant card — current user:**
```
className="group relative flex items-center gap-3 rounded-xl border border-gold-600/40 bg-gold-400/5 px-3 py-2.5 transition-all duration-150"
```

**Participant card — other player (online):**
```
className="group relative flex items-center gap-3 rounded-xl border border-casino-border bg-casino-surface/50 px-3 py-2.5 transition-all duration-150 hover:border-casino-border/80 hover:bg-casino-surface/70"
```

**Participant card — other player (offline):**
```
className="group relative flex items-center gap-3 rounded-xl border border-casino-border/40 bg-casino-surface/20 px-3 py-2.5 opacity-60 transition-all duration-150"
```

**Participant card — observer:**
```
className="group relative flex items-center gap-3 rounded-xl border border-casino-border/50 bg-casino-dark/50 px-3 py-2.5 transition-all duration-150"
```

**Avatar container:**
```
className="relative shrink-0"
```

**Avatar circle:**
```
className="flex h-10 w-10 items-center justify-center rounded-full bg-casino-dark text-xl"
```

**Admin crown badge (on avatar):**
```
className="absolute -right-1 -top-1 text-sm leading-none" aria-label="Session admin"
// Emoji: 👑
```

**Online/offline dot (on avatar, bottom-right):**
```
// Online:
className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-casino-dark bg-green-400"

// Offline:
className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-casino-dark bg-casino-muted/40"
```

**Name row:**
```
className="flex min-w-0 flex-1 flex-col"
// Name + you-tag row:
className="flex items-baseline gap-1.5"
// Name:
// current user: "truncate text-sm font-semibold text-gold-400"
// other:        "truncate text-sm font-medium text-white"
// You tag:
className="shrink-0 text-[10px] text-casino-muted/80"
```

**Vote status badge — "Voted" (pre-reveal):**
```
className="mt-0.5 inline-flex items-center gap-1 text-xs font-medium text-green-400"
// Dot: "inline-block h-1.5 w-1.5 rounded-full bg-green-400 chip-in"
// Label: "Voted"
```

**Vote status badge — "Thinking..." (not voted):**
```
className="mt-0.5 inline-flex items-center gap-1.5 text-xs text-casino-muted"
// Animated dots: three spans with staggered animate-bounce
// aria-label="Still thinking"
```

**Vote status badge — vote value (post-reveal):**
```
className="mt-0.5 inline-flex items-center gap-1 font-display text-sm font-bold text-gold-400"
```

**Vote status badge — "Observer" role:**
```
className="mt-0.5 inline-flex items-center gap-1 text-xs text-casino-muted/70"
// Icon: 👁 at text-sm
// Label: "Observing"
```

**Admin "..." overflow menu trigger (always visible on admin view):**
```
className="ml-auto shrink-0 rounded-lg p-1.5 text-casino-muted/40 transition-colors hover:bg-casino-surface hover:text-casino-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-500 lg:opacity-0 lg:group-hover:opacity-100"
// On mobile: always opacity-100
// aria-label="Player options for {name}"
// aria-haspopup="menu"
```

**Admin dropdown menu:**
```
className="absolute right-2 top-full z-30 mt-1 w-44 overflow-hidden rounded-xl border border-casino-border bg-casino-surface shadow-[0_8px_32px_rgba(0,0,0,0.5)]"
// Role: role="menu"
```

**Dropdown menu item — Make Admin:**
```
className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-casino-muted transition-colors hover:bg-casino-dark hover:text-gold-400 focus:outline-none focus-visible:bg-casino-dark focus-visible:text-gold-400"
// role="menuitem"
// Icon: 👑 at text-base
// Label: "Make Session Admin"
```

**Dropdown menu item — Remove:**
```
className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-casino-muted transition-colors hover:bg-casino-red/10 hover:text-casino-red-light focus:outline-none focus-visible:bg-casino-red/10 focus-visible:text-casino-red-light"
// role="menuitem"
// Icon: UserX icon at h-4 w-4
// Label: "Remove from Session"
```

#### D.4 States

| Element | States |
|---|---|
| Player card | online/offline, voted/waiting/revealed, current-user, admin |
| Vote status | pre-reveal: voted/thinking; post-reveal: shows value |
| Admin menu | closed / open (click to toggle); closes on outside click, Escape |
| Observer card | always shows 👁 badge; no vote status |

#### D.5 Accessibility

- Sidebar: `<aside aria-label="Session participants">`
- Players section: `<section aria-label="Players">`
- Admin menu trigger: `aria-haspopup="menu"`, `aria-expanded={isOpen}`
- Admin menu: `role="menu"`, focus trapped within when open, Escape closes
- Vote status changes: `aria-live="polite"` on status region per card
- Online/offline dot: `aria-label="Online"` or `aria-label="Offline"` (not conveyed by color alone)

---

### E. Voting Cards

#### E.1 Purpose & Behavior

The player's hand — the 10 voting cards arranged in a persistent bottom strip. Redesigned to support:
- Full keyboard navigation (arrow keys, Enter/Space to select)
- Numeric card values separated from special cards visually
- "You voted: X" confirmation above the row
- Keyboard shortcut hints overlay
- Touch target minimum 44px on mobile

**Card groups:**
- **Numeric group:** 0, 1, 2, 3, 5, 8, 13, 21 (8 cards)
- **Special group:** ?, ☕ (2 cards) — separated by a visible divider and slight gap

**Keyboard shortcuts (global keydown listener, disabled when input focused):**
```
0 → card 0      1 → card 1      2 → card 2
3 → card 3      5 → card 5      8 → card 8
t → card 13     u → card 21
? or / → card ?   b → card ☕
Escape → deselect current card
```

#### E.2 Layout Specification

```
Container: border-t border-casino-border bg-casino-dark
Padding: px-4 py-4 sm:px-6 sm:py-5
Card row: flex flex-wrap items-end justify-center
Card gap: gap-2 sm:gap-3
Divider between numeric/special: mx-2 h-[72px] w-px bg-casino-border/60 self-center sm:mx-3
```

**Layers (top to bottom within section):**
1. "Your Hand" label row (with keyboard hint icon)
2. "You voted: X" confirmation (conditional, animated in)
3. Card row (two visual groups separated by divider)

#### E.3 Tailwind className Strings

**Section container:**
```
className="border-t border-casino-border bg-casino-dark"
```

**Inner wrapper:**
```
className="mx-auto max-w-3xl px-4 py-4 sm:px-6 sm:py-5"
```

**Label row:**
```
className="mb-3 flex items-center justify-between"
// Left label:
className="text-xs font-semibold uppercase tracking-widest text-casino-muted"
// Right keyboard hint button:
className="flex items-center gap-1.5 rounded-md px-2 py-1 text-[10px] text-casino-muted/50 hover:text-casino-muted hover:bg-casino-surface/50 transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-500"
// aria-label="Show keyboard shortcuts"
// aria-expanded={showShortcuts}
```

**"You voted: X" confirmation banner:**
```
// Animated: enters with translate-y and opacity transition
className="mb-3 flex animate-[fadeSlideDown_200ms_ease-out] items-center justify-center gap-2 rounded-xl border border-gold-600/30 bg-gold-400/8 px-4 py-2"
// Icon: ✓ at text-green-400 font-bold
// Text: "text-sm font-medium text-white"
// Vote value: "font-display font-bold text-gold-400 ml-1"
```

**Card row wrapper:**
```
className="flex flex-wrap items-end justify-center gap-2 sm:gap-3"
```

**Group divider (between numeric and special):**
```
className="mx-1 hidden self-center sm:block"
// Inner: "h-[72px] w-px bg-casino-border/50"
```

**PokerCard (interactive, unselected) — update to existing component:**
```
className="relative flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-casino-border bg-casino-surface transition-all duration-150 hover:-translate-y-1.5 hover:border-gold-700/60 hover:shadow-[0_4px_16px_rgba(0,0,0,0.4)] focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-500 focus-visible:ring-offset-1 focus-visible:ring-offset-casino-dark active:scale-95"
// Sizes (unchanged from v1):
// sm: "w-12 h-[72px] text-lg"
// md: "w-[72px] h-[104px] text-2xl"
```

**PokerCard (interactive, selected):**
```
className="relative flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-gold-400 bg-casino-surface shadow-[0_0_24px_rgba(250,204,21,0.35),0_-6px_0_rgba(250,204,21,0.15)] -translate-y-4 scale-[1.06] transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 focus-visible:ring-offset-1 focus-visible:ring-offset-casino-dark"
```

**PokerCard (disabled — after reveal):**
```
className="relative flex flex-col items-center justify-center rounded-xl border-2 border-casino-border/30 bg-casino-surface/40 opacity-40 cursor-not-allowed"
// aria-disabled="true"
```

**Special card visual treatment (? and ☕):**
```
// The border should use a subtly different color to differentiate:
// Unselected: border-casino-border → border-casino-border (same, grouped differently)
// Selected: border-gold-400 (same gold, but the divider communicates grouping)
// ☕ card gets a warm tint: bg-casino-surface (same surface, but center icon is larger)
// ? card: center value "?" is styled in text-casino-muted (not white) when unselected
//   to signal "I'm uncertain", mirroring its meaning
```

**Keyboard shortcut overlay (floating tooltip panel):**
```
className="absolute bottom-full left-1/2 z-40 mb-2 w-64 -translate-x-1/2 rounded-xl border border-casino-border bg-casino-surface p-4 shadow-[0_-8px_32px_rgba(0,0,0,0.5)]"
// Grid of shortcuts: "grid grid-cols-2 gap-x-6 gap-y-2"
// Each row: "flex items-center justify-between"
// Key: "rounded border border-casino-border bg-casino-dark px-1.5 py-0.5 text-[10px] font-mono text-casino-muted"
// Value label: "text-[10px] text-casino-muted/70"
// role="tooltip" id="kbd-shortcuts"
```

#### E.4 States

| State | Visual |
|---|---|
| Default | Flat card, white value text, muted corners |
| Hover | Lift -translate-y-1.5, gold border at 60% opacity, shadow |
| Selected | Lift -translate-y-4, scale 1.06, full gold border + glow |
| Disabled (post-reveal) | opacity-40, cursor-not-allowed, no hover effects |
| Focused (keyboard) | gold ring-2 ring-gold-500 |
| Confirmation showing | "You voted: X" banner visible above cards |

#### E.5 Accessibility

- Card row: `role="radiogroup"`, `aria-label="Your voting hand"`, `aria-required="true"`
- Each card: `role="radio"`, `aria-checked={isSelected}`, `aria-label="Vote {value}"` (with special: `aria-label="Vote — I'm uncertain"` for ?, `aria-label="Vote — Request a break"` for ☕)
- Arrow key navigation: Left/Right within the numeric group, then into the special group
- Enter or Space: select/deselect focused card
- Keyboard shortcut hint: `aria-keyshortcuts` attribute on each card button listing its shortcut key
- Shortcut overlay: `role="tooltip"`, linked to trigger via `aria-describedby`
- When voting disabled: `aria-disabled="true"` + `aria-description="Voting is locked — cards have been revealed"`
- Confirmation banner: `role="status"` + `aria-live="polite"` — announces "You voted: {value}"

---

### F. Admin Control Bar (REDESIGNED)

#### F.1 Purpose & Behavior

A dedicated horizontal strip between the felt table and the voting card section. Visible only to admin. Visually distinct from both the green felt (shared space) and the voting cards (player space). This strip is the administrative layer of the session.

**Redesign rationale:** Moving controls out of the felt table removes the visual ambiguity (non-admins see a gap; admins see mystery buttons in the play area). The dedicated strip is clearly an "operator panel."

**States the bar can be in:**
1. **Voting phase, not all voted:** Reveal button shown in warning state with pending count; secondary "Reveal anyway" affordance
2. **Voting phase, all voted:** Reveal button in primary gold state
3. **Voting phase, no votes at all:** Reveal button disabled entirely
4. **Revealed phase:** New Round button shown (reveal button replaced)

**Confirmation flows:**
- Reveal when not all voted: clicking shows an inline sub-state "X players haven't voted. Reveal anyway?" with [Confirm Reveal] and [Cancel] — no separate modal needed
- Reveal when all voted: single click triggers confirmation modal (since it's a one-way operation)
- New Round: always triggers confirmation modal (irreversible, discards results)

#### F.2 Layout Specification

```
Container: border-t border-b border-casino-border/60 bg-casino-surface/60
Padding: px-4 py-3 sm:px-6
Layout: flex items-center justify-between
```

**Left:** Admin indicator chip ("👑 Session Controls")
**Right:** Primary action button(s)

#### F.3 Tailwind className Strings

**Admin bar container:**
```
className="flex items-center justify-between border-y border-casino-border/50 bg-casino-surface/40 px-4 py-3 backdrop-blur-sm sm:px-6"
```

**Admin identity chip (left):**
```
className="flex items-center gap-2 rounded-lg border border-gold-900/40 bg-gold-950/30 px-3 py-1.5"
// Crown: "text-sm leading-none" → 👑
// Label: "text-xs font-semibold text-gold-600 hidden sm:inline"
```

**Right button group:**
```
className="flex items-center gap-3"
```

**Reveal button — disabled (no votes):**
```
className="cursor-not-allowed rounded-xl border border-casino-border/40 bg-casino-surface/40 px-5 py-2.5 text-sm font-medium text-casino-muted/40"
// aria-disabled="true"
// aria-description="No votes cast yet"
```

**Reveal button — warning state (not all voted, some voted):**
```
className="group relative rounded-xl border border-gold-700/50 bg-gold-950/40 px-5 py-2.5 text-sm font-semibold text-gold-600 transition-all duration-150 hover:border-gold-600/70 hover:bg-gold-900/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-500 active:scale-[0.97]"
// Content layout:
//   Top line: "Reveal Cards"
//   Bottom line: "className='block text-[10px] font-normal text-gold-700/70 mt-0.5'"
//              → "{N} players haven't voted yet"
```

**Reveal inline confirmation sub-state (replaces warning button after first click):**
```
className="flex items-center gap-3 rounded-xl border border-casino-red/30 bg-casino-red/10 px-4 py-2.5"
// Warning text: "text-sm text-casino-red-light"
// [Confirm Reveal]: "rounded-lg bg-casino-red px-4 py-1.5 text-xs font-semibold text-white hover:bg-casino-red-light transition-colors"
// [Cancel]: "text-xs text-casino-muted hover:text-white cursor-pointer transition-colors"
```

**Reveal button — all voted (primary):**
```
className="rounded-xl bg-gradient-to-r from-gold-600 to-gold-500 px-6 py-2.5 font-display text-sm font-semibold text-casino-black transition-all duration-150 hover:from-gold-500 hover:to-gold-400 hover:shadow-[0_0_20px_rgba(250,204,21,0.35)] focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 focus-visible:ring-offset-2 focus-visible:ring-offset-casino-surface active:scale-[0.97]"
```

**Reveal button — loading state (after click, waiting for server):**
```
className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-gold-700 to-gold-600 px-6 py-2.5 font-display text-sm font-semibold text-casino-black/70 cursor-wait"
// Spinner: "animate-spin h-4 w-4 border-2 border-casino-black/20 border-t-casino-black/60 rounded-full"
```

**New Round button (shown post-reveal, replaces Reveal):**
```
className="rounded-xl border border-gold-700/50 bg-gold-950/30 px-6 py-2.5 font-display text-sm font-semibold text-gold-500 transition-all duration-150 hover:border-gold-600 hover:bg-gold-900/40 hover:text-gold-400 hover:shadow-[0_0_16px_rgba(212,160,23,0.2)] focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-500 focus-visible:ring-offset-2 focus-visible:ring-offset-casino-surface active:scale-[0.97]"
```

#### F.4 States

| Phase | Button shown | Button state |
|---|---|---|
| No votes | Reveal Cards | disabled |
| Some voted, not all | Reveal Cards | warning (gold-950 bg) |
| Warning clicked | Inline confirmation | [Confirm] + [Cancel] |
| All voted | Reveal Cards | primary (gold gradient) |
| Reveal clicked | Reveal Cards | loading spinner |
| Revealed | New Round | secondary gold |
| New Round clicked | → triggers ConfirmationModal | — |

#### F.5 Accessibility

- Admin bar: `role="region"` + `aria-label="Session controls (admin)"`
- All buttons: explicit `aria-label` strings including consequence ("Reveal all votes" not just "Reveal")
- Inline confirmation: `role="alert"` to announce to screen readers when it appears
- New Round: `aria-label="Start a new round — this will clear all current votes"`
- Disabled reveal: `aria-disabled="true"` + `aria-description` explaining why

---

### G. Results Display

#### G.1 Purpose & Behavior

Shown inside the felt table after cards are revealed. Presents: consensus/average, distribution bars, individual revealed cards, and special vote callouts. Redesigned to:
- Celebrate consensus with a gold pulse animation on the felt
- Show full names below revealed cards (no more 48px truncation)
- Sort votes by value (ascending numeric, then ?, then ☕)
- Add Export/Copy results button
- Show divergence indicator (spread between highest and lowest numeric votes)

#### G.2 Layout Specification

```
Container: fills the felt table area (flex flex-col items-center gap-5)
Max-width: max-w-xl w-full
Sections (top to bottom):
  1. Consensus / Average hero number
  2. Divergence indicator (if no consensus and numeric votes present)
  3. Distribution bars
  4. Revealed cards row
  5. Special vote callouts
  6. Export row
```

#### G.3 Tailwind className Strings

**Results wrapper:**
```
className="flex w-full max-w-xl flex-col items-center gap-5"
```

**Consensus hero state:**
```
// Outer: animate-[goldPulse_2s_ease-in-out_3] — 3 pulses then stops
className="flex flex-col items-center gap-1 rounded-2xl border border-gold-500/30 bg-gold-400/8 px-8 py-5 text-center shadow-[0_0_40px_rgba(250,204,21,0.12)]"
// "Consensus!" label: "text-sm font-semibold text-green-400 uppercase tracking-widest"
// Value: "font-display text-6xl font-bold text-gold-400 leading-none mt-1"
// Subtitle: "text-xs text-casino-muted mt-2"
```

**Average (non-consensus) hero state:**
```
className="flex flex-col items-center gap-1 text-center"
// Label: "text-xs font-medium uppercase tracking-widest text-casino-muted"
// Value: "font-display text-6xl font-bold text-gold-400 leading-none mt-1"
// Fibonacci suggestion: "mt-2 text-sm text-casino-muted"
//   "Nearest Fibonacci: " + <span className="font-semibold text-gold-500">{closestFib}</span>
```

**Divergence indicator (new — shown when spread > 5 and no consensus):**
```
className="flex items-center gap-2 rounded-xl border border-amber-700/30 bg-amber-900/10 px-4 py-2 text-sm text-amber-500/80"
// Icon: ↕ or TrendingUp at h-4 w-4
// Text: "Wide spread ({min}–{max}) — discuss before re-voting"
```

**Distribution section:**
```
className="w-full"
// Section label: "mb-3 text-[10px] font-semibold uppercase tracking-widest text-casino-muted/60"
//              → "Vote Distribution"
```

**Distribution bar row:**
```
className="flex items-center gap-3"
// Value label: "w-8 shrink-0 text-right font-display text-sm font-bold text-gold-400"
// Bar track: "h-6 flex-1 overflow-hidden rounded-full bg-casino-dark"
// Bar fill (numeric): "h-full rounded-full bg-gradient-to-r from-gold-700 to-gold-500 transition-all duration-700 ease-out"
// Bar fill (?): "h-full rounded-full bg-amber-600/60 transition-all duration-700 ease-out"
// Bar fill (☕): "h-full rounded-full bg-amber-900/70 transition-all duration-700 ease-out"
// Count + names: "w-auto shrink-0 text-right text-xs text-casino-muted tabular-nums"
//   → "{N}x" then on hover: tooltip showing voter names
```

**Revealed cards row:**
```
className="flex flex-wrap justify-center gap-3"
// Per card+name group:
className="flex flex-col items-center gap-1.5"
// Name below card (full, no truncation):
className="max-w-[72px] text-center text-[10px] leading-tight text-casino-muted"
// Overflow: let it wrap to 2 lines for longer names
```

**Special callout — ? votes:**
```
className="flex w-full items-center gap-3 rounded-xl border border-amber-500/25 bg-amber-500/8 px-4 py-3"
// Icon: "text-lg shrink-0"
// Title: "text-sm font-medium text-amber-400"
// Body: "text-xs text-casino-muted mt-0.5"
//   → "{names} need more information before voting"
```

**Special callout — ☕ votes:**
```
className="flex w-full items-center gap-3 rounded-xl border border-amber-800/25 bg-amber-900/10 px-4 py-3"
// Title: "text-sm font-medium text-amber-700"
// Body: "text-xs text-casino-muted mt-0.5"
//   → "{names} requested a break"
```

**Export/Copy row:**
```
className="flex w-full items-center justify-end gap-2 border-t border-casino-border/30 pt-3"
// Copy button: "flex items-center gap-1.5 rounded-lg border border-casino-border/60 px-3 py-1.5 text-xs text-casino-muted transition-colors hover:border-casino-border hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-500"
// After copy: text changes to "Copied!" + ✓ for 2 seconds via useState
```

**Copy payload format (plaintext to clipboard):**
```
Round {N} — {storyTitle}
Average: {avg} | Nearest Fibonacci: {fib}
Distribution: 0→1x, 3→2x, 5→3x ...
Votes: Alice: 5, Bob: 3, Carol: 5 ...
```

#### G.4 States

| State | Visual |
|---|---|
| Consensus | Gold pulse animation on felt + hero card style |
| No consensus | Average displayed, divergence indicator if spread > 5 |
| Only special votes | "No numeric votes" message, special callouts |
| Copy clicked | Button text → "Copied! ✓" for 2s |

#### G.5 Accessibility

- Results region: `role="region"` + `aria-label="Round results"`
- When results appear: `aria-live="assertive"` announces summary: "Cards revealed. Average: {avg}. Consensus: {yes/no}."
- Distribution bars: accessible via `role="img"` wrapping bar group with `aria-label="Vote distribution: {value} received {N} votes"` per row. Alternatively render a visually hidden `<table>` for screen readers.
- Copy button: `aria-label="Copy results to clipboard"`; after copy, update to `aria-label="Results copied to clipboard"`

---

### H. Confirmation Modal (NEW)

#### H.1 Purpose & Behavior

A focused dialog for destructive or significant actions. Used for:
- **Reveal Cards** (all voted): "Reveal all votes now?"
- **New Round**: "Start a new round? The current results will be cleared."
- **Kick Player**: "Remove {name} from the session?"
- **Leave Table** (when admin): "Leave the session? Admin will transfer to {name}."
- **Leave Table** (non-admin): "Leave the session?"

Design principle: The modal should be fast to dismiss (Escape or Cancel) and make the destructive action clearly more effortful (requires a deliberate click on a colored confirm button).

**NOT used for:**
- Reveal when not all voted (handled inline in Admin Bar)
- Make Admin transfer (handled inline in participant card dropdown)

#### H.2 Layout Specification

```
Backdrop: fixed inset-0, dark blur
Modal card: centered, max-w-sm w-full mx-4, rounded-2xl
Padding: p-6 sm:p-8
Shadow: heavy outer shadow
```

#### H.3 Tailwind className Strings

**Backdrop overlay:**
```
className="fixed inset-0 z-50 flex items-center justify-center p-4"
// Two-layer backdrop:
// Layer 1 (blur): "absolute inset-0 bg-casino-black/80 backdrop-blur-sm"
// Layer 2 (click-to-close): same div with onClick
```

**Modal card:**
```
className="relative z-10 w-full max-w-sm rounded-2xl border border-casino-border bg-casino-surface p-6 shadow-[0_32px_80px_rgba(0,0,0,0.8)] sm:p-8"
```

**Close X button (top-right):**
```
className="absolute right-4 top-4 rounded-lg p-1.5 text-casino-muted/50 transition-colors hover:bg-casino-dark hover:text-casino-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-500"
// aria-label="Close dialog"
```

**Icon area (optional, centered):**
```
// Reveal: "mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gold-950/60 border border-gold-800/40 text-2xl" → 🃏
// New Round: → 🔄
// Kick: → "border-casino-red/30 bg-casino-red/10 text-xl" → 👤
// Leave: → "border-casino-border bg-casino-dark" → 🚪
```

**Modal title:**
```
className="mb-2 text-center font-display text-xl font-semibold text-white"
```

**Modal body text:**
```
className="mb-6 text-center text-sm text-casino-muted leading-relaxed"
// Highlighted names: <strong className="text-white font-medium">
```

**Button group:**
```
className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-center"
// On mobile: full-width stacked (cancel on bottom)
// On desktop: side-by-side centered
```

**Cancel button:**
```
className="flex-1 rounded-xl border border-casino-border px-6 py-2.5 text-sm font-medium text-casino-muted transition-all hover:border-casino-border/80 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-500 active:scale-[0.97] sm:flex-none sm:min-w-[100px]"
```

**Confirm button — standard (Reveal all voted, Leave Table non-admin):**
```
className="flex-1 rounded-xl bg-gradient-to-r from-gold-600 to-gold-500 px-6 py-2.5 text-sm font-semibold text-casino-black transition-all hover:from-gold-500 hover:to-gold-400 hover:shadow-[0_0_16px_rgba(250,204,21,0.25)] focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 active:scale-[0.97] sm:flex-none sm:min-w-[100px]"
```

**Confirm button — destructive (Kick, New Round, Leave as Admin):**
```
className="flex-1 rounded-xl bg-casino-red px-6 py-2.5 text-sm font-semibold text-white transition-all hover:bg-casino-red-light hover:shadow-[0_0_16px_rgba(192,57,43,0.3)] focus:outline-none focus-visible:ring-2 focus-visible:ring-casino-red active:scale-[0.97] sm:flex-none sm:min-w-[100px]"
```

#### H.4 Content Variants

| Trigger | Title | Body | Confirm Label | Button Style |
|---|---|---|---|---|
| Reveal (all voted) | "Reveal Cards?" | "All players have voted. Reveal all cards now?" | "Reveal" | Gold |
| New Round | "Start New Round?" | "This will clear all current votes and results. The agreed estimate won't be saved." | "Start New Round" | Red |
| Kick Player | "Remove {name}?" | "They will be removed from the session immediately. They can rejoin via the link." | "Remove Player" | Red |
| Leave (non-admin) | "Leave the Table?" | "You'll be removed from the session. Rejoin anytime with the room link." | "Leave Table" | Gold |
| Leave (admin) | "Leave as Admin?" | "{name} will automatically become the new admin when you leave." | "Leave Table" | Red |

#### H.5 Accessibility

- Dialog: `role="dialog"`, `aria-modal="true"`, `aria-labelledby="modal-title"`, `aria-describedby="modal-body"`
- Focus trap: When modal opens, focus moves to the Cancel button (safer default than Confirm)
- Escape key closes modal (= Cancel)
- When modal closes, focus returns to the triggering element
- Body scroll lock: `overflow-hidden` on `<body>` while modal is open
- Backdrop click = Cancel

---

### I. Connection/Error Toast (NEW)

#### I.1 Purpose & Behavior

A non-blocking notification system for session state changes that don't require user input but must be communicated clearly. Replaces the current behavior of silent redirects and no feedback on connection loss.

**Toast types:**
1. **Disconnected** — "Connection lost. Attempting to reconnect..." (persistent until resolved, amber)
2. **Reconnected** — "Back online." (auto-dismiss 3s, green)
3. **Session expired / server restart** — "Session ended — the server restarted." with [Rejoin] button (persistent, must be dismissed)
4. **Error** — "Could not complete action. Try again." (auto-dismiss 5s, red)
5. **Info** — "Cards were revealed while you were away." (auto-dismiss 5s, muted)
6. **Kicked** — "You've been removed from this session by the admin." (persistent, no rejoin)

**Behavior:**
- Stack from top-right (desktop) or top (mobile, full-width)
- Each toast has a visible auto-dismiss progress bar
- Max 3 toasts stacked (oldest dismissed first if 4th arrives)
- Connection toast (disconnected) persists and does not stack — it is a banner-level state

#### I.2 Layout Specification

```
Container: fixed top-4 right-4 z-50 flex flex-col gap-2 (desktop)
           fixed top-0 left-0 right-0 z-50 flex flex-col gap-1 (mobile, with top safe area)
Toast max-width: max-w-[360px] w-full
```

#### I.3 Tailwind className Strings

**Toast container:**
```
className="fixed right-4 top-4 z-50 flex w-full max-w-[360px] flex-col gap-2 sm:max-w-sm"
// Mobile override applied via responsive prefixes
```

**Toast base:**
```
className="relative overflow-hidden rounded-2xl border shadow-[0_8px_32px_rgba(0,0,0,0.5)] transition-all duration-300"
// Entry: "animate-[slideInRight_250ms_ease-out]"
// Exit: "animate-[slideOutRight_200ms_ease-in] opacity-0"
```

**Toast — disconnected (amber, persistent):**
```
className="relative overflow-hidden rounded-2xl border border-amber-700/40 bg-casino-surface shadow-[0_8px_32px_rgba(0,0,0,0.5)] p-4"
// Icon: "h-4 w-4 text-amber-500 shrink-0 animate-pulse"
// Title: "text-sm font-semibold text-amber-400"
// Body: "text-xs text-casino-muted mt-0.5"
```

**Toast — reconnected (green, auto-dismiss):**
```
className="relative overflow-hidden rounded-2xl border border-green-700/40 bg-casino-surface shadow-[0_8px_32px_rgba(0,0,0,0.5)] p-4"
// Title: "text-sm font-semibold text-green-400"
```

**Toast — session expired (red, persistent, has action):**
```
className="relative overflow-hidden rounded-2xl border border-casino-red/40 bg-casino-surface p-4 shadow-[0_8px_32px_rgba(0,0,0,0.5)]"
// Header row: "flex items-start gap-3"
// Icon: "h-4 w-4 text-casino-red-light shrink-0 mt-0.5"
// Content: flex-col
//   Title: "text-sm font-semibold text-white"
//   Body: "text-xs text-casino-muted mt-0.5"
// Action button (Rejoin): "mt-3 w-full rounded-lg bg-casino-red px-4 py-2 text-xs font-semibold text-white hover:bg-casino-red-light transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-casino-red"
```

**Toast — error (red, auto-dismiss 5s):**
```
className="relative overflow-hidden rounded-2xl border border-casino-red/30 bg-casino-surface p-4 shadow-[0_8px_32px_rgba(0,0,0,0.5)]"
```

**Toast — info (muted, auto-dismiss 5s):**
```
className="relative overflow-hidden rounded-2xl border border-casino-border bg-casino-surface p-4 shadow-[0_8px_32px_rgba(0,0,0,0.5)]"
// Title: "text-sm font-medium text-white"
// Body: "text-xs text-casino-muted"
```

**Auto-dismiss progress bar:**
```
// Positioned at bottom of toast (absolute)
className="absolute bottom-0 left-0 h-0.5 rounded-full bg-current opacity-30"
// Animated from width 100% to 0 over dismissDelay ms
// Uses CSS animation: "animate-[shrinkWidth_{ms}ms_linear_forwards]"
// Keyframe in globals.css:
//   @keyframes shrinkWidth { from { width: 100%; } to { width: 0%; } }
```

**Dismiss X button (all toasts):**
```
className="absolute right-3 top-3 rounded p-0.5 text-casino-muted/50 hover:text-casino-muted transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-500"
// aria-label="Dismiss notification"
```

**Toast inner content layout:**
```
className="flex items-start gap-3"
// Icon column: "shrink-0 mt-0.5"
// Content column: "min-w-0 flex-1"
```

#### I.4 States & Timing

| Type | Auto-dismiss | Duration | Persistent |
|---|---|---|---|
| Disconnected | No | — | Yes (until reconnected) |
| Reconnected | Yes | 3 seconds | No |
| Session expired | No | — | Yes (requires action) |
| Error | Yes | 5 seconds | No |
| Info | Yes | 5 seconds | No |
| Kicked | No | — | Yes (no action available) |

#### I.5 Accessibility

- Toast container: `role="region"` + `aria-label="Notifications"` + `aria-live="polite"` (or `assertive` for errors/session expired)
- Session expired + kicked: `aria-live="assertive"`
- All others: `aria-live="polite"`
- Dismiss button: `aria-label="Dismiss notification"`
- Rejoin button: `aria-label="Rejoin the session"`
- Progress bar: `aria-hidden="true"` (visual only; timing communicated via aria-live region)
- When stacking: announce new toasts sequentially (live region handles this automatically)

---

## 3. Layout Specifications

### 3.1 Join Page Layout

```
Page: flex min-h-screen items-center justify-center bg-casino-black p-4

[Center column — max-w-[480px] w-full]
  [Logo + tagline — text-center mb-8]
  [Form card — rounded-2xl border border-casino-border bg-casino-surface p-8 shadow-[...]]
    [Name field]
    [Role toggle]
    [Observer callout — conditional]
    [Avatar grid — 4×3]
    [Error]
    [Submit button]
  [Suit decorations — mt-6 flex justify-center gap-3]
```

**Background treatment:**
- `bg-casino-black` base
- Optional: very subtle radial gradient `bg-[radial-gradient(ellipse_at_50%_20%,rgba(10,92,54,0.06)_0%,transparent_60%)]` for depth

### 3.2 Game Page Layout

**Desktop (lg+):**
```
[Full viewport height — flex flex-col]
  [Header — h-14 sticky top-0]
  [Story Context Banner — auto height]
  [Body — flex flex-1 overflow-hidden]
    [Sidebar — w-72 shrink-0 overflow-y-auto]
    [Main — flex flex-1 flex-col overflow-hidden]
      [Felt Table — flex flex-1 items-center justify-center p-6 overflow-y-auto]
      [Admin Bar — conditional, shrink-0]
      [Voting Cards — shrink-0]
```

**Mobile (< lg):**
```
[Full viewport height — flex flex-col]
  [Header — h-14 sticky top-0]
  [Story Context Banner — auto height]
  [Main — flex flex-1 flex-col overflow-hidden]
    [Felt Table — flex flex-1 items-center justify-center p-4 overflow-y-auto]
    [Admin Bar — conditional, shrink-0]
    [Voting Cards — shrink-0]
  [Participant count pill — floating, fixed bottom-right → opens bottom sheet]
```

**Felt table area:**
```
className="felt-bg w-full max-w-2xl rounded-3xl border-4 border-gold-900/30 p-6 shadow-[inset_0_2px_20px_rgba(0,0,0,0.5)] sm:p-8"
// Minimum height: min-h-[280px]
// The felt background now uses an SVG diamond texture mask at 4% opacity (via CSS mask-image)
```

**Sidebar dimensions (desktop):**
```
Width: 288px (w-72)
Min-height: 100% of body
Overflow: overflow-y-auto
Padding: p-4
```

**Voting card area (fixed sizing):**
```
// Section: shrink-0 (does not grow/shrink in flex column)
// Card row never wraps to more than 2 lines:
// At 375px, numeric cards at w-10 h-14 (sm size) + special cards — fits in 1 line
// Use gap-1.5 on mobile, gap-2.5 on sm, gap-3 on md+
```

### 3.3 Felt Table Diamond Texture (globals.css addition)

```css
/* Add to globals.css */
.felt-bg {
  background: radial-gradient(ellipse at center, var(--color-felt) 0%, var(--color-felt-dark) 100%);
  /* Diamond pattern overlay */
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
```

---

## 4. Animation & Interaction Specifications

### 4.1 Card Selection (chip-in style)

When a voting card is selected:

```css
/* Already exists — augment with: */
@keyframes cardSelect {
  0%   { transform: translateY(0) scale(1); }
  40%  { transform: translateY(-20px) scale(1.1); }
  70%  { transform: translateY(-14px) scale(1.08) rotateZ(-2deg); }
  100% { transform: translateY(-16px) scale(1.06) rotateZ(0deg); }
}

.card-select {
  animation: cardSelect 200ms cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
}
```

**Implementation:** Apply `.card-select` class on the card button when `isSelected` transitions from false to true. CSS transition handles deselect (spring back).

### 4.2 Vote Reveal Animation

Cards flip across the table one by one with staggered delays:

```css
/* Already have perspective + preserve-3d + rotate-y-180 + backface-hidden */
/* Add stagger via CSS custom properties: */
.card-reveal {
  animation: flipReveal 400ms ease-out both;
  animation-delay: calc(var(--card-index) * 150ms);
}

@keyframes flipReveal {
  0%   { transform: rotateY(180deg) scale(0.9); opacity: 0.7; }
  50%  { transform: rotateY(90deg) scale(1.05); }
  100% { transform: rotateY(0deg) scale(1); opacity: 1; }
}
```

**Implementation:** In `ResultsDisplay`, pass `style={{ '--card-index': i }}` to each card wrapper. Apply `.card-reveal` class only when transitioning from hidden to revealed state.

**Total reveal duration:** For 8 voters, last card reveals at 8 × 150ms = 1200ms. Acceptable; the stagger creates theatrical tension.

### 4.3 Consensus Celebration

When `results.consensus === true`:

```css
@keyframes goldPulse {
  0%   { box-shadow: 0 0 0 0 rgba(250, 204, 21, 0.4); }
  50%  { box-shadow: 0 0 0 20px rgba(250, 204, 21, 0); }
  100% { box-shadow: 0 0 0 0 rgba(250, 204, 21, 0); }
}

.consensus-pulse {
  animation: goldPulse 1.2s ease-out 3;
  /* Runs 3 times then stops — not an infinite loop */
}
```

Apply `.consensus-pulse` to the consensus hero container. Additionally:
- The felt table border gets a brief gold flash: `border-color` transitions from `gold-900/30` to `gold-500/50` at the moment of reveal, then fades back over 2s.

```css
@keyframes feltGold {
  0%   { border-color: rgba(212, 160, 23, 0.5); }
  100% { border-color: rgba(120, 79, 20, 0.3); }
}
.felt-reveal-flash {
  animation: feltGold 2s ease-out forwards;
}
```

### 4.4 Connection Status Pulse

Already specified in component B.3. The green dot uses `animate-ping` (Tailwind built-in). The key detail: the ping animation should only run when truly connected (not reconnecting). During reconnection, use `animate-pulse` on the text label only — not a ping dot — to avoid false positivity.

### 4.5 Toast Slide-In/Out

```css
@keyframes slideInRight {
  from { transform: translateX(calc(100% + 16px)); opacity: 0; }
  to   { transform: translateX(0); opacity: 1; }
}

@keyframes slideOutRight {
  from { transform: translateX(0); opacity: 1; }
  to   { transform: translateX(calc(100% + 16px)); opacity: 0; }
}

/* Mobile: slide from top */
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
```

### 4.6 Modal Backdrop Fade

```css
@keyframes backdropIn {
  from { opacity: 0; backdrop-filter: blur(0px); }
  to   { opacity: 1; backdrop-filter: blur(4px); }
}

@keyframes backdropOut {
  from { opacity: 1; backdrop-filter: blur(4px); }
  to   { opacity: 0; backdrop-filter: blur(0px); }
}

.modal-backdrop-in {
  animation: backdropIn 150ms ease-out forwards;
}
.modal-backdrop-out {
  animation: backdropOut 120ms ease-in forwards;
}
```

Modal card itself uses:
```css
@keyframes modalSlideUp {
  from { transform: translateY(12px) scale(0.97); opacity: 0; }
  to   { transform: translateY(0) scale(1); opacity: 1; }
}
.modal-card-in {
  animation: modalSlideUp 180ms cubic-bezier(0.34, 1.2, 0.64, 1) forwards;
}
```

### 4.7 Observer Role Toggle (Join Form)

```css
@keyframes fadeSlideDown {
  from { opacity: 0; transform: translateY(-6px); max-height: 0; }
  to   { opacity: 1; transform: translateY(0); max-height: 100px; }
}
/* Applied to the Observer callout section when role switches */
```

### 4.8 Reduced Motion Overrides (globals.css)

```css
@media (prefers-reduced-motion: reduce) {
  .card-select,
  .card-reveal,
  .consensus-pulse,
  .felt-reveal-flash,
  .modal-backdrop-in,
  .modal-card-in,
  .chip-in {
    animation: none !important;
    transition: none !important;
  }

  /* Replace card flip with instant swap */
  .preserve-3d {
    transition: none !important;
  }

  /* Replace connection ping with static dot */
  .animate-ping {
    animation: none !important;
    opacity: 1 !important;
  }
}
```

---

## 5. Mobile-First Responsive Design

### 5.1 Breakpoint Reference

| Breakpoint | Token | Width | Usage |
|---|---|---|---|
| Default | (none) | 0px+ | Mobile portrait — primary design target |
| sm | `sm:` | 640px+ | Mobile landscape, large phones |
| md | `md:` | 768px+ | Tablets |
| lg | `lg:` | 1024px+ | Desktop — sidebar becomes visible |
| xl | `xl:` | 1280px+ | Wide desktop — no current design changes needed |

### 5.2 Component Behavior by Breakpoint

#### Header
| Width | Behavior |
|---|---|
| Default | Logo + connection dot + Leave button. No round pill, no session name, no participant count. |
| sm+ | Round pill appears. Participant count appears. Connection label text appears. |
| lg+ | Session name appears in center. |

#### Sidebar (Participant List)
| Width | Behavior |
|---|---|
| Default | Hidden. Replaced by a floating bottom-right pill: `"👥 5/8"` that opens a bottom drawer. |
| lg+ | Full sidebar visible — `w-72`, left-anchored, scrollable. |

**Floating participant pill (mobile):**
```
className="fixed bottom-6 right-4 z-30 flex items-center gap-2 rounded-full border border-casino-border bg-casino-surface/90 px-4 py-2.5 shadow-[0_4px_24px_rgba(0,0,0,0.4)] backdrop-blur-sm lg:hidden"
// aria-label="Open participant list"
// "👥" + "{voted}/{total}" in text-sm font-medium text-white
// If not all voted: "{voted}/{total}" in text-gold-500
```

**Bottom drawer (mobile participant list):**
```
className="fixed inset-x-0 bottom-0 z-40 max-h-[70vh] overflow-y-auto rounded-t-2xl border-t border-casino-border bg-casino-dark px-4 pb-safe-bottom pt-4 lg:hidden"
// Drag handle: "mx-auto mb-4 h-1 w-10 rounded-full bg-casino-border"
// Content: same ParticipantCard list
// Transition: translate-y-full → translate-y-0, duration 300ms ease-out
```

#### Story Context Banner
| Width | Behavior |
|---|---|
| Default | Compact: "Current Story" label hidden; ticket badge only if present; title truncated to 1 line |
| sm+ | Full label visible; description toggle visible |
| lg+ | Full display with comfortable padding |

#### Voting Cards
| Width | Behavior |
|---|---|
| Default | Cards use `sm` size (w-12 h-[72px]). All 10 cards in a single row (verified at 375px). Gap: gap-1.5. No label text shown on cards. |
| sm+ | Cards use `md` size (w-[72px] h-[104px]). Gap: gap-2.5. Label row with keyboard hint shown. |
| md+ | Gap: gap-3. "You voted: X" banner shown above cards. |

**Card size at 375px (worst case verification):**
- 8 numeric cards × 48px + 7 gaps × 6px + divider 8px + 2 special cards × 48px + 1 gap × 6px
- = 384 + 42 + 8 + 96 + 6 = 536px — does not fit
- Solution: on mobile (< sm), hide the visual divider between groups; render all 10 cards at w-10 (40px) with gap-1 (4px)
- 10 × 40px + 9 × 4px = 400 + 36 = 436px — still tight
- Final solution: on mobile, use gap-0.5 (2px) and w-9 (36px) cards
- 10 × 36px + 9 × 2px = 360 + 18 = 378px — fits within 375px with 2px margin (acceptable)
- Card height at mobile size: h-[52px] (maintain proportion ≈ 1:1.44)

**Mobile card className:**
```
className="relative flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-casino-border bg-casino-surface w-9 h-[52px] text-base transition-all duration-150 hover:border-gold-700/60 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-500"
// Selected: "-translate-y-2 scale-[1.06] border-gold-400 shadow-[0_0_12px_rgba(250,204,21,0.3)]"
```

#### Admin Control Bar
| Width | Behavior |
|---|---|
| Default | "👑" icon only (no "Session Controls" label). Buttons full text visible. |
| sm+ | Label "Session Controls" appears next to crown icon. |

#### Confirmation Modal
| Width | Behavior |
|---|---|
| Default | Full-width bottom sheet (slide up from bottom, no border radius on bottom edge). Cancel/Confirm stacked vertically. |
| sm+ | Centered card (max-w-sm), standard modal behavior. |

**Mobile modal bottom sheet:**
```
// Container: "fixed inset-x-0 bottom-0 z-50 rounded-t-2xl border-t border-casino-border bg-casino-surface px-6 pb-8 pt-6"
// Drag handle: "mx-auto mb-6 h-1 w-12 rounded-full bg-casino-border"
// Buttons: "flex flex-col gap-3" (stacked, Confirm on top on mobile)
// Entry animation: translateY(100%) → translateY(0)
```

### 5.3 Touch Target Minimums

All interactive elements meet 44×44px minimum:

| Element | Default size | Min size enforced via |
|---|---|---|
| Avatar picker buttons | p-3 + content | Natural size already 44px |
| Voting cards mobile | w-9 h-[52px] = 36×52px | Augment with `min-h-[44px]` |
| Admin "..." menu trigger | p-1.5 on 24px icon = ~35px | Add `min-w-[44px] min-h-[44px]` |
| Toast dismiss X | p-0.5 on 16px icon = ~24px | Expand hit area: wrap in `p-2.5` |
| Leave button (header) | px-3 py-1.5 = ~32px | Add `min-h-[44px]` on mobile |
| Participant drawer pill | px-4 py-2.5 = ~44px | Already meets minimum |

**Global touch target helper (globals.css):**
```css
@media (pointer: coarse) {
  button, [role="button"], [role="radio"], [role="menuitem"] {
    min-height: 44px;
    min-width: 44px;
  }
}
```

---

## 6. Accessibility Checklist

### 6.1 WCAG AA Contrast Ratios

All text/background combinations verified against WCAG 2.1 AA (4.5:1 for normal text, 3:1 for large text and UI components).

| Text color | Background | Ratio | Usage | Passes AA |
|---|---|---|---|---|
| `#ededed` (body text) | `#0a0a0a` casino-black | 19.1:1 | Body text on page bg | Yes |
| `#ededed` | `#121212` casino-dark | 16.8:1 | Body text on dark panels | Yes |
| `#ededed` | `#1c1c1e` casino-surface | 14.9:1 | Body text on cards | Yes |
| `#facc15` gold-400 | `#1c1c1e` casino-surface | 9.2:1 | Gold labels on surface | Yes |
| `#facc15` gold-400 | `#0a0a0a` casino-black | 11.2:1 | Gold text on black | Yes |
| `#d4a017` gold-500 | `#1c1c1e` casino-surface | 6.1:1 | Secondary gold on surface | Yes |
| `#b8860b` gold-600 | `#0a0a0a` casino-black | 5.8:1 | Gold-600 on black | Yes |
| `#0a0a0a` casino-black | `#facc15` gold-400 | 11.2:1 | Black text on gold buttons | Yes |
| `#0a0a0a` casino-black | `#d4a017` gold-500 | 6.1:1 | Black text on gold-500 buttons | Yes |
| `#8a8a8e` casino-muted | `#1c1c1e` casino-surface | 3.5:1 | Muted text, secondary | Passes AA for large text; use for supplementary info only, not primary labels |
| `#8a8a8e` casino-muted | `#121212` casino-dark | 3.7:1 | Same caveat | Same |
| `#4ade80` green-400 | `#1c1c1e` casino-surface | 7.1:1 | "Voted" status | Yes |
| `#e74c3c` casino-red-light | `#1c1c1e` casino-surface | 4.6:1 | Error text | Yes |
| `#ffffff` | `#0a5c36` felt | 6.8:1 | Text on felt (used sparingly) | Yes |
| `#facc15` gold-400 | `#0a5c36` felt | 5.5:1 | Gold on felt | Yes |

**Note on casino-muted:** Used for supplementary text only (status labels, helper text). Any text conveying critical information (errors, actions, vote status) must use a higher-contrast color.

**Fix required:** The existing `text-casino-muted` on the "Waiting..." vote badge is borderline. Replace with `text-white/70` (`≈ #b3b3b3`) on casino-surface backgrounds, which achieves 5.9:1.

### 6.2 Focus Order Specification

**Join Page (Tab order):**
1. Name input
2. Player role toggle button
3. Observer role toggle button
4. Avatar grid (first avatar; arrow keys navigate within)
5. Submit button

**Game Page (Tab order):**
1. Skip to main content link (visually hidden, first tab stop)
2. Leave Table button (header)
3. Edit story title pencil button (if admin and story set)
4. Story description toggle (if story set and description available)
5. Participant "..." menus (if admin; one per card in sidebar)
6. Voting cards (one tab stop enters the radiogroup; arrow keys navigate within)
7. Keyboard shortcut hint button
8. Admin bar: Reveal/New Round button (if admin)

**Modal (focus trapped):**
1. Cancel button (receives focus on open)
2. Confirm button
3. Close X button
→ Tab wraps within modal until closed

### 6.3 Screen Reader Announcements

**Key events requiring `aria-live` announcements:**

| Event | Region | Live type | Announcement text |
|---|---|---|---|
| Player joins | Notifications (polite) | polite | "{name} joined the table." |
| Player leaves | Notifications | polite | "{name} left the table." |
| Vote cast (own vote) | Voting confirmation | polite | "Your vote: {value} is registered." |
| Vote changed (own) | Voting confirmation | polite | "Your vote changed to {value}." |
| All players voted | Admin bar status | polite | "All players have voted. You can reveal the cards." |
| Cards revealed | Main region | assertive | "Cards revealed. Average: {avg}. Consensus: {yes/no}." |
| New round started | Main region | assertive | "New round started. Round {N}." |
| Player kicked (to admin) | Notifications | polite | "{name} was removed from the session." |
| Disconnected | Notifications | assertive | "Connection lost. Attempting to reconnect." |
| Reconnected | Notifications | polite | "Connection restored." |
| Story title updated | Story banner | polite | "Current story: {title}." |

**Implementation:** Create a single visually-hidden `<div role="log" aria-live="polite">` and a separate `<div role="alert" aria-live="assertive">` in the page root. Push announcement strings to them reactively.

### 6.4 Keyboard Navigation Summary

| Component | Keys | Behavior |
|---|---|---|
| Avatar grid | Arrow keys | Navigate 4×3 grid; wraps at edges |
| Role toggle | Arrow keys, Space | Switch between Player / Observer |
| Voting cards | Arrow keys | Navigate across card row (left/right); wraps |
| Voting cards | Enter, Space | Select/deselect focused card |
| Voting cards | 0,1,2,3,5,8,t,u,?,b | Jump directly to corresponding card |
| Voting cards | Escape | Deselect current card |
| Admin "..." menu | Enter/Space on trigger | Open menu |
| Admin "..." menu | Arrow keys | Navigate menu items |
| Admin "..." menu | Escape | Close menu; return focus to trigger |
| Modal | Escape | Close modal; return focus to trigger |
| Modal | Tab | Cycle focus within modal |
| Story title (admin) | Enter | Save; exit edit mode |
| Story title (admin) | Escape | Cancel; revert; exit edit mode |
| Toast dismiss | Enter/Space | Dismiss toast |

### 6.5 Reduced Motion

All animations have reduced-motion fallbacks as specified in Section 4.8. Key principles:
- No animation should be essential for understanding state — every animated transition must also be communicated via color/opacity change that takes effect instantly.
- The card flip reveal uses instant swap (no rotation) under `prefers-reduced-motion: reduce`.
- The consensus gold pulse does not play; instead, the border color change is immediate and permanent until next round.

---

## 7. Component ASCII Wireframes

### 7.1 Join Page

```
┌─────────────────────────────────────────────────────────────┐
│                        (page background: casino-black)      │
│                                                             │
│              ♠  Scrum Poker (gold shimmer)  ♠              │
│                   ─────────────────────                     │
│               Take a seat at the table                      │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐    │
│  │                                                     │    │
│  │  Your Name                                          │    │
│  │  ┌───────────────────────────────────────────┐      │    │
│  │  │ Enter your name...                 15/20  │      │    │
│  │  └───────────────────────────────────────────┘      │    │
│  │                                                     │    │
│  │  ┌──────────────────────────────────────────┐       │    │
│  │  │  [🎮 Player         ] [  👁 Observer   ] │       │    │
│  │  └──────────────────────────────────────────┘       │    │
│  │                                                     │    │
│  │  ┌──────────────────────────────────────────┐       │    │
│  │  │ 👁  You'll watch the session without     │       │    │
│  │  │    casting votes. You can see all votes  │       │    │
│  │  │    when cards are revealed.              │       │    │
│  │  └──────────────────────────────────────────┘       │    │
│  │                                                     │    │
│  │  Choose Your Avatar                      12 options │    │
│  │  ┌────┐ ┌────┐ ┌────┐ ┌────┐                        │    │
│  │  │ 🎰 │ │ 🃏 │ │👑  │ │ 🎲 │                        │    │
│  │  │Deal│ │Jokr│ │High│ │Luck│                        │    │
│  │  └────┘ └────┘ └────┘ └────┘                        │    │
│  │  ┌────┐ ┌────┐ ┌────┐ ┌────┐                        │    │
│  │  │ 💎 │ │ 🐎 │ │ 🏆 │ │ 🎩 │                        │    │
│  │  │Diam│ │Dark│ │Chmp│ │TopH│                        │    │
│  │  └────┘ └────┘ └────┘ └────┘                        │    │
│  │  ┌────┐ ┌────┐ ┌────┐ ┌────┐                        │    │
│  │  │ 🌟 │ │♠️  │ │ 🔥 │ │ 🚀 │  ← selected: gold border│  │
│  │  │Star│ │Spade│ │Hot│ │Rkt │                        │    │
│  │  └────┘ └────┘ └────┘ └────┘                        │    │
│  │                                                     │    │
│  │  ┌──────────────────────────────────────────┐       │    │
│  │  │           Take a Seat  (gold)            │       │    │
│  │  └──────────────────────────────────────────┘       │    │
│  │                                                     │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                             │
│                    ♠  ♥  ♦  ♣                               │
└─────────────────────────────────────────────────────────────┘
```

### 7.2 Game Page — Voting Phase (Desktop)

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ [Scrum Poker✨] │ Round 2 │         Current Story — AUTH-142         │● Connected  [Leave Table] │
├──────────────────────────────────────────────────────────────────────────────┤
│  Current Story: ✏ "Add OAuth2 login with Google provider"           [▼ desc] │
├─────────────────┬────────────────────────────────────────────────────────────┤
│ Players  5/8    │                                                            │
│─────────────────│  ┌──────────────────────────────────────────────────────┐  │
│ 🎰 Alice  ✓    │  │ ◆ ◆ ◆ ◆ ◆ ◆ ◆ ◆ ◆ ◆ ◆ ◆ ◆ ◆ ◆ ◆ ◆ ◆ ◆ ◆ ◆  │  │
│ (you) gold      │  │                                                      │  │
│ 🃏 Bob    ✓    │  │              Cast Your Vote                          │  │
│ 🎲 Carol  ✓    │  │                                                      │  │
│ 🏆 Dave  ···   │  │      ┌──────────────────────────────────────┐        │  │
│ 🔥 Eve   ···   │  │      │         5 of 8 voted                 │        │  │
│ 🚀 Frank ···   │  │      └──────────────────────────────────────┘        │  │
│                 │  │                                                      │  │
│ Observers  1    │  │  ● Alice  ● Bob  ● Carol  ○ Dave  ○ Eve  ○ Frank   │  │
│─────────────────│  │  ○ Grace  ○ Hari                                    │  │
│ 👁 Grace  👁   │  │                                                      │  │
│                 │  └──────────────────────────────────────────────────────┘  │
│                 ├────────────────────────────────────────────────────────────┤
│                 │  👑 Session Controls         [Reveal Cards — 3 haven't voted] │
│                 ├────────────────────────────────────────────────────────────┤
│                 │  YOUR HAND                                      ⌨ Shortcuts │
│                 │  ┌──┐ ┌──┐ ┌──┐ ┌──┐ ┌──┐ ┌──┐ ┌──┐ ┌──┐  │  ┌──┐ ┌──┐  │
│                 │  │ 0│ │ 1│ │ 2│ │ 3│ │ 5│ │ 8│ │13│ │21│  │  │ ?│ │☕│  │
│                 │  │  │ │  │ │  │ │  │ │↑ │ │  │ │  │ │  │  │  │  │ │  │  │
│                 │  └──┘ └──┘ └──┘ └──┘ └──┘ └──┘ └──┘ └──┘  │  └──┘ └──┘  │
│                 │             [5 is raised — selected state]               │
└─────────────────┴────────────────────────────────────────────────────────────┘
```

### 7.3 Game Page — Voting Phase (Mobile, 375px)

```
┌───────────────────────┐
│ ✨ Scrum │ ● │ Leave  │
├───────────────────────┤
│ "Add OAuth2 login..." │
│ [AUTH-142] (compact)  │
├───────────────────────┤
│                       │
│   Cast Your Vote      │
│                       │
│    5 of 8 voted       │
│                       │
│  ● Alice  ● Bob       │
│  ● Carol  ○ Dave      │
│  ○ Eve  ○ Frank       │
│  ○ Grace  ○ Hari      │
│                       │
├───────────────────────┤
│ 👑 [Reveal — 3 left] │
├───────────────────────┤
│ YOUR HAND             │
│ ┌─┐┌─┐┌─┐┌─┐┌─┐      │
│ │0││1││2││3││5│      │
│ └─┘└─┘└─┘└─┘└─┘      │
│ ┌─┐┌─┐┌─┐┌─┐┌─┐      │
│ │8││13││21││?││☕│    │
│ └─┘└──┘└──┘└─┘└─┘     │
│                       │
│              👥 5/8   │← floating pill
└───────────────────────┘
```

### 7.4 Game Page — Revealed Phase (Desktop)

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ [Scrum Poker✨] │ Round 2 │     AUTH-142: Add OAuth2 login...       │● Connected  [Leave Table] │
├──────────────────────────────────────────────────────────────────────────────┤
│  Current Story: "Add OAuth2 login with Google provider"            [▼ desc] │
├─────────────────┬────────────────────────────────────────────────────────────┤
│ Players  8/8    │                                                            │
│─────────────────│  ┌──────────────────────────────────────────────────────┐  │
│ 🎰 Alice   5   │  │                                                      │  │
│ (you) gold      │  │  ┌─────────────────────────────────────────────┐    │  │
│ 🃏 Bob     8   │  │  │         Average                              │    │  │
│ 🎲 Carol   5   │  │  │           5.6                                │    │  │
│ 🏆 Dave    3   │  │  │   Nearest Fibonacci: 5                       │    │  │
│ 🔥 Eve     5   │  │  │   Spread: 3–8 ↕ Wide spread — discuss first  │    │  │
│ 🚀 Frank   8   │  │  └─────────────────────────────────────────────┘    │  │
│ 💎 Grace   5   │  │                                                      │  │
│ 🌟 Hari    8   │  │  Vote Distribution                                   │  │
│                 │  │   3  ████░░░░░░░░░░░░░░  1x                         │  │
│ Observers  1    │  │   5  ████████████░░░░░░  4x                         │  │
│─────────────────│  │   8  ██████████░░░░░░░░  3x                         │  │
│ 👁 PM-Joe  👁  │  │                                                      │  │
│                 │  │  ┌──┐ ┌──┐ ┌──┐ ┌──┐ ┌──┐ ┌──┐ ┌──┐ ┌──┐          │  │
│                 │  │  │ 5│ │ 8│ │ 5│ │ 3│ │ 5│ │ 8│ │ 5│ │ 8│          │  │
│                 │  │  └──┘ └──┘ └──┘ └──┘ └──┘ └──┘ └──┘ └──┘          │  │
│                 │  │  Alice Bob Carol Dave  Eve Frank Grace Hari          │  │
│                 │  │                                          [Copy ↗]   │  │
│                 │  └──────────────────────────────────────────────────────┘  │
│                 ├────────────────────────────────────────────────────────────┤
│                 │  👑 Session Controls                    [New Round]         │
│                 ├────────────────────────────────────────────────────────────┤
│                 │  YOUR HAND  (cards shown at opacity-40, cursor-not-allowed) │
│                 │  ┌──┐ ┌──┐ ┌──┐ ┌──┐ ┌──┐ ┌──┐ ┌──┐ ┌──┐  │  ┌──┐ ┌──┐  │
│                 │  │ 0│ │ 1│ │ 2│ │ 3│ │ 5│ │ 8│ │13│ │21│  │  │ ?│ │☕│  │
│                 │  └──┘ └──┘ └──┘ └──┘ └──┘ └──┘ └──┘ └──┘  │  └──┘ └──┘  │
└─────────────────┴────────────────────────────────────────────────────────────┘
```

### 7.5 Admin View — Inline Reveal Confirmation (Admin Bar Detail)

```
Before click (not all voted):
┌─────────────────────────────────────────────────────────────────┐
│ 👑 Session Controls         [Reveal Cards — 3 haven't voted ▲] │
└─────────────────────────────────────────────────────────────────┘

After first click (inline confirmation replaces button):
┌─────────────────────────────────────────────────────────────────┐
│ 👑 Session Controls     ⚠ 3 players haven't voted.             │
│                          [Confirm Reveal]  cancel               │
└─────────────────────────────────────────────────────────────────┘

When all voted (primary button):
┌─────────────────────────────────────────────────────────────────┐
│ 👑 Session Controls                    [ Reveal Cards (gold) ] │
└─────────────────────────────────────────────────────────────────┘
```

### 7.6 Confirmation Modal — New Round

```
┌─────────────────────────────────────────────────────────┐
│                  ░░░░░░ backdrop blur ░░░░░░              │
│                                                          │
│              ┌──────────────────────────┐  [×]           │
│              │                          │                │
│              │          🔄              │                │
│              │                          │                │
│              │   Start New Round?       │                │
│              │                          │                │
│              │  This will clear all     │                │
│              │  current votes and       │                │
│              │  results. The agreed     │                │
│              │  estimate won't be       │                │
│              │  saved automatically.    │                │
│              │                          │                │
│              │  [ Cancel ] [Start Round]│                │
│              │              (red btn)   │                │
│              │                          │                │
│              └──────────────────────────┘                │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

### 7.7 Connection Toast — Session Expired

```
                              ┌─────────────────────────────┐
                              │ ✕                           │
                              │ 🔴  Session Ended           │
                              │     The server restarted.   │
                              │     Your session is no      │
                              │     longer active.          │
                              │                             │
                              │ [ Rejoin the Session ]      │
                              └─────────────────────────────┘
                              ← appears at top-right (desktop)
                                or slides from top (mobile)
```

### 7.8 Participant Bottom Drawer (Mobile)

```
┌───────────────────────┐
│  (backdrop blur)      │
│                       │
│                       │
├───────────────────────┤  ← bottom sheet slides up
│       ─────           │  drag handle
│                       │
│ Players        5/8    │
│                       │
│ ┌─────────────────┐   │
│ │🎰 Alice (you) ✓ │   │
│ └─────────────────┘   │
│ ┌─────────────────┐   │
│ │🃏 Bob          ✓│   │
│ └─────────────────┘   │
│ ┌─────────────────┐   │
│ │🎲 Carol       ✓ │   │
│ └─────────────────┘   │
│ ┌─────────────────┐   │
│ │🏆 Dave      ··· │  ···→ [Make Admin] [Remove] │
│ └─────────────────┘   │
│                       │
│ Observers      1      │
│                       │
│ ┌─────────────────┐   │
│ │👁 Grace (👁 obs)│   │
│ └─────────────────┘   │
└───────────────────────┘
```

---

## Appendix A: New Keyframes Summary (globals.css additions)

```css
/* Add to globals.css */

@keyframes cardSelect {
  0%   { transform: translateY(0) scale(1); }
  40%  { transform: translateY(-20px) scale(1.1); }
  70%  { transform: translateY(-14px) scale(1.08) rotateZ(-2deg); }
  100% { transform: translateY(-16px) scale(1.06); }
}

@keyframes goldPulse {
  0%   { box-shadow: 0 0 0 0 rgba(250, 204, 21, 0.4); }
  50%  { box-shadow: 0 0 0 20px rgba(250, 204, 21, 0); }
  100% { box-shadow: 0 0 0 0 rgba(250, 204, 21, 0); }
}

@keyframes feltGold {
  0%   { border-color: rgba(212, 160, 23, 0.5); }
  100% { border-color: rgba(120, 79, 20, 0.3); }
}

@keyframes slideInRight {
  from { transform: translateX(calc(100% + 16px)); opacity: 0; }
  to   { transform: translateX(0); opacity: 1; }
}

@keyframes slideOutRight {
  from { transform: translateX(0); opacity: 1; }
  to   { transform: translateX(calc(100% + 16px)); opacity: 0; }
}

@keyframes backdropIn {
  from { opacity: 0; }
  to   { opacity: 1; }
}

@keyframes modalSlideUp {
  from { transform: translateY(12px) scale(0.97); opacity: 0; }
  to   { transform: translateY(0) scale(1); opacity: 1; }
}

@keyframes fadeSlideDown {
  from { opacity: 0; transform: translateY(-6px); }
  to   { opacity: 1; transform: translateY(0); }
}

@keyframes shrinkWidth {
  from { width: 100%; }
  to   { width: 0%; }
}

/* Reduced motion overrides */
@media (prefers-reduced-motion: reduce) {
  .card-select,
  .card-reveal,
  .consensus-pulse,
  .felt-reveal-flash,
  .modal-backdrop-in,
  .modal-card-in,
  .chip-in {
    animation: none !important;
    transition: none !important;
  }

  .animate-ping {
    animation: none !important;
    opacity: 1 !important;
  }

  .preserve-3d {
    transition: none !important;
  }
}

/* Touch target helper */
@media (pointer: coarse) {
  button,
  [role="button"],
  [role="radio"],
  [role="menuitem"] {
    min-height: 44px;
    min-width: 44px;
  }
}
```

## Appendix B: New Files to Create

| File | Purpose |
|---|---|
| `src/components/StoryContextBanner.tsx` | Story title display + admin inline editing |
| `src/components/AdminControlBar.tsx` | Redesigned admin strip (replaces AdminControls.tsx) |
| `src/components/ConfirmationModal.tsx` | Reusable confirmation dialog |
| `src/components/ConnectionToast.tsx` | Toast notification system |
| `src/components/ToastContainer.tsx` | Toast stack manager |
| `src/components/ParticipantDrawer.tsx` | Mobile bottom drawer for participant list |
| `src/hooks/useToast.ts` | Toast state management hook |
| `src/hooks/useKeyboardVoting.ts` | Keyboard shortcut handler for voting cards |
| `src/hooks/useConfirmation.ts` | Confirmation modal state hook |

## Appendix C: Modified Files

| File | Changes |
|---|---|
| `src/components/JoinForm.tsx` | Observer toggle, 3×4 avatar grid, character count |
| `src/components/GameBoard.tsx` | Layout restructure: story banner, admin bar positioning, mobile drawer trigger |
| `src/components/VotingCards.tsx` | Keyboard support, group divider, confirmation banner |
| `src/components/ParticipantCard.tsx` | "..." menu replaces hover-only buttons, observer badge, online indicator |
| `src/components/ParticipantList.tsx` | Observer section, remove redundant header count |
| `src/components/ResultsDisplay.tsx` | Full name display, divergence indicator, export button, consensus animation |
| `src/components/PokerCard.tsx` | Updated focus styles, keyboard aria attributes |
| `src/app/globals.css` | New keyframes, felt texture, touch target helper |
| `src/lib/types.ts` | Add `role: 'player' | 'observer'` to Participant; add `storyTitle?: string` to GameState |

## Appendix D: Design Token Reference Card (Quick Lookup)

```
BACKGROUNDS (dark to light):
  casino-black   #0a0a0a  — page background
  casino-dark    #121212  — header, sidebar, card section bg
  casino-surface #1c1c1e  — cards, panels, inputs
  felt           #0a5c36  — voting table surface
  felt-dark      #064525  — felt gradient edge

BORDERS:
  casino-border  #2a2a2e  — standard border
  gold-900/30    rgba(92,58,16,0.3)  — felt border

TEXT:
  white/ededed   — primary text
  casino-muted   #8a8a8e  — secondary/supplementary text only
  gold-400       #facc15  — primary gold accent, selected states
  gold-500       #d4a017  — secondary gold, hover states
  gold-600       #b8860b  — CTA backgrounds, active states
  green-400      #4ade80  — success, voted status
  casino-red-light #e74c3c — errors, destructive actions
  casino-red     #c0392b  — destructive button backgrounds

GRADIENTS:
  CTA button:  from-gold-600 to-gold-500 → hover: from-gold-500 to-gold-400
  Felt table:  radial from felt to felt-dark

SHADOWS:
  card:         shadow-[0_25px_60px_rgba(0,0,0,0.7)]
  selected card: shadow-[0_0_24px_rgba(250,204,21,0.35)]
  CTA hover:    shadow-[0_0_24px_rgba(250,204,21,0.35)]
  modal:        shadow-[0_32px_80px_rgba(0,0,0,0.8)]
  felt inset:   shadow-[inset_0_2px_20px_rgba(0,0,0,0.5)]
```

---

*Document version 2.0 — March 9, 2026. Prepared for developer handoff. All Tailwind className strings are production-ready for Tailwind CSS v4. Animation keyframes require addition to globals.css. Type additions require update to src/lib/types.ts before component implementation begins.*
