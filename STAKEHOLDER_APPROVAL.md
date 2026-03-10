# bf-point-estimate Redesign — Stakeholder Approval Brief

**Project:** bf-point-estimate UI/UX Redesign (v2.0)
**Prepared by:** Product & Design
**Date:** March 9, 2026
**Status:** Pending Stakeholder Approval
**Source documents:** UX Research Findings (March 9, 2026) · UI Design Specification v2.0 (March 9, 2026)

---

## 1. Executive Summary

**What this is:** A targeted UI/UX redesign of bf-point-estimate — our casino-themed real-time planning poker tool — based on a structured heuristic evaluation of the current codebase and user journey analysis across three user personas.

**Why now:** The tool has a strong foundation (Next.js 16, React 19, Tailwind CSS v4, real-time SSE). However, repeated friction in daily estimation sessions — including admin accidents that disrupt entire teams, no way to show what a team is voting on, and zero keyboard accessibility — are measurably reducing its effectiveness for the agile teams it serves.

**The three headline improvements:**

1. **Story Context Banner** — teams will finally know what they are estimating without a parallel Jira/Slack window
2. **Confirmation-protected admin actions** — no more accidental reveals or round resets wiping active sessions
3. **Observer role** — stakeholders and PMs can attend without polluting vote data

**Scope:** This redesign changes the user interface, interaction patterns, and adds targeted new components. **The tech stack, real-time SSE architecture, game logic, color tokens, and casino theme are unchanged.**

---

## 2. Problem Statement

UX research identified 15 friction points across the current user experience. The top 5, framed by business impact:

| # | Problem | Business Impact |
|---|---|---|
| 1 | **No story/ticket context in the game view.** Players have no in-app reference for what they are estimating. | Teams must maintain a parallel video call or chat window throughout every session, adding coordination overhead and increasing the chance of estimation confusion. |
| 2 | **No confirmation on destructive admin actions** (Reveal, New Round, Kick). Any accidental tap permanently alters session state for all participants. | A single misclick by the facilitator discards all in-progress votes and forces a re-vote — wasting team time in every sprint. |
| 3 | **No observer/spectator mode.** Stakeholders and PMs must join as voting participants. | Uninformed votes from non-estimators corrupt the average and the nearest-Fibonacci suggestion, undermining the tool's core output. |
| 4 | **Reveal button active before all participants have voted.** | Premature reveals remove the anti-anchoring benefit of simultaneous reveal — the primary reason teams use planning poker in the first place. |
| 5 | **No keyboard accessibility for voting.** | Developers who prefer keyboard-first workflows — a significant portion of our user base — cannot vote without a pointer device. This is also a WCAG AA compliance gap. |

**User quotes illustrating the pain:**

> *"I need to keep 8 people aligned, not babysit a browser tab."* — Facilitator persona, on managing session state without recovery paths

> *"Joining mid-round shows no indication of round status or whether to wait or vote."* — Voter persona, on late-join disorientation

> *"No explanation of the Fibonacci scale or what '?' or '☕' cards mean — discoverable only through use."* — Observer persona, on first-session confusion

**Team productivity impact:** Every friction point above compounds across 2–4 estimation sessions per sprint, per team. The cumulative time lost to tool overhead — re-votes after accidental reveals, parallel windows for story context, confused stakeholders casting placeholder votes — is recoverable through this redesign.

---

## 3. Design Vision

### Visual Direction

The design direction for v2 is **"Private Room at the Grand Casino"** — less neon, more leather and brass. Version 1 established the vocabulary (green felt, gold accents, dark surfaces, Playfair Display typography). Version 2 adds **discipline**: every decorative element must also carry functional weight.

> *"A gold border is not merely ornament — it is a state indicator. A dark surface is not merely style — it defines spatial hierarchy."*

Gold usage is restricted to: selected states, primary CTAs, and revealed results. The felt table gains a subtle diamond-pattern texture at 4% opacity. Admin controls move out of the shared play area into a dedicated operator strip — visually distinct, unmistakably functional.

### Before / After Layout Comparison

**Current layout (v1) — key issues annotated:**

```
┌──────────────────────────────────────────────────────────────────┐
│ [Logo]  Round 2          ● Connected                [Leave Table] │
├─────────────────┬────────────────────────────────────────────────┤
│ X/Y voted       │                                                │
│─────────────────│   [Place Your Bets]        ← no story context  │
│ Alice  ✓ (chip) │                                                │
│ Bob    ✓ (chip) │   ● Alice  ● Bob  ○ Dave  ← vote status       │
│ Dave   ○ (chip) │   (duplicated here AND in sidebar)             │
│                 │                                                │
│                 │  [Reveal Cards]  ← inside the felt, admin-only │
│                 │  [New Round]     ← no confirmation, irreversible│
├─────────────────┴────────────────────────────────────────────────┤
│ YOUR HAND: [0][1][2][3][5][8][13][21][?][☕]   ← no kbd support  │
└──────────────────────────────────────────────────────────────────┘
```

**Proposed layout (v2) — from UI Design Spec Section 7.2:**

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ [Scrum Poker✨] │ Round 2 │         Current Story — AUTH-142         │● Connected  [Leave Table] │
├──────────────────────────────────────────────────────────────────────────────┤
│  Current Story: ✏ "Add OAuth2 login with Google provider"           [▼ desc] │  ← NEW
├─────────────────┬────────────────────────────────────────────────────────────┤
│ Players  5/8    │                                                            │
│─────────────────│  ┌──────────────────────────────────────────────────────┐  │
│ 🎰 Alice  ✓    │  │                                                      │  │
│ (you) gold      │  │              Cast Your Vote                          │  │
│ 🃏 Bob    ✓    │  │                                                      │  │
│ 🎲 Carol  ✓    │  │      ┌──────────────────────────────────────┐        │  │
│ 🏆 Dave  ···   │  │      │         5 of 8 voted                 │        │  │  ← consolidated
│ 🔥 Eve   ···   │  │      └──────────────────────────────────────┘        │  │
│                 │  │                                                      │  │
│ Observers  1    │  └──────────────────────────────────────────────────────┘  │
│─────────────────│                                                            │
│ 👁 Grace  👁   │                                                            │  ← NEW role
│                 ├────────────────────────────────────────────────────────────┤
│                 │  👑 Session Controls         [Reveal Cards — 3 haven't voted] │  ← moved out of felt
│                 ├────────────────────────────────────────────────────────────┤
│                 │  YOUR HAND                                      ⌨ Shortcuts │  ← NEW kbd support
│                 │  [0][1][2][3][5][8][13][21]  │  [?][☕]                    │
└─────────────────┴────────────────────────────────────────────────────────────┘
```

### Key Visual Changes

- **Story Context Banner** appears directly above the felt — highest-information-value real estate on screen
- **Admin Control Bar** is a distinct horizontal strip between the felt and the voting hand — no longer inside the shared play area
- **Special cards** (?, ☕) are visually separated from numeric Fibonacci cards with a divider
- **Observer participants** appear in a dedicated sidebar section with a 👁 badge
- **Vote status** is consolidated from three locations to one (sidebar only; felt shows only a single progress counter)
- **Felt texture** gains a subtle diamond pattern at 4% opacity — "private room" ambiance without clutter

---

## 4. Proposed Changes Summary

| Feature | Current State | Proposed Change | Priority |
|---|---|---|---|
| Story context | Not present — teams use a parallel window | **Story Context Banner**: admin sets title/ticket ID; read-only for others | Critical |
| Admin controls location | Inside the green felt table area | **Dedicated Admin Control Bar**: separate strip below the felt | Critical |
| Reveal confirmation | Single click → immediate reveal for all | **Inline confirmation** when not all voted; **modal** when all voted | Critical |
| New Round confirmation | Single click → irreversible reset | **Confirmation modal** required before clearing results | Critical |
| Observer/spectator mode | Not present — all participants vote | **Observer role toggle** at join; 👁 badge; cannot cast votes | Critical |
| Reveal button gating | Active after any 1 player votes | **Warning state** with pending count; Confirm required when not all voted | High |
| Keyboard voting | Not supported | **Global key shortcuts**: 0,1,2,3,5,8,t,u,?,b map to cards | High |
| Kick/transfer admin UX | Hover-only icon buttons (inaccessible on touch) | **"..." overflow menu**: labeled options, always visible on mobile | High |
| Connection error handling | Silent redirect to join page | **Toast notifications**: disconnect, reconnect, session expired + Rejoin | High |
| Mobile layout | Sidebar competes with table; cards may wrap | **Floating participant pill** + **bottom drawer**; cards never wrap at 375px | High |
| Vote status display | Triplicated: sidebar header + per-player + felt chips | **Consolidated**: sidebar per-player only; felt shows single `X of Y voted` | Medium |
| Results display | Names truncated at 48px; unsorted | **Full names** (2-line wrap); sorted by value ascending | Medium |
| Card legend | No explanation for ?, ☕ anywhere in UI | **Card Legend** help icon + overlay; first-visit onboarding banner | Medium |
| Felt texture | Plain radial gradient | **Diamond pattern** SVG mask at 4% opacity | Low |
| Admin language copy | "Place Your Bets" (gambling) throughout | Dynamic: "Place Your Bets" on load → "Cast Your Vote" during session | Low |

---

## 5. New Components / Features

### Story Context Banner
An editable strip at the top of the felt area where the admin sets the story title and optional ticket ID (e.g., AUTH-142). Non-admins see a read-only view; when no story is set they see nothing.

**Who it helps:** Everyone. Eliminates the single biggest session quality gap — teams no longer need a parallel communication channel to know what they are estimating.

**Complexity:** M (inline edit mode, state sync via SSE, ticket ID auto-detection)

---

### Observer Role
A "Join as Observer" toggle on the join form. Observers appear in the sidebar with a 👁 badge and cannot cast votes. Admin can promote observers to voters.

**Who it helps:** Product managers and stakeholders who attend for visibility without disrupting vote pools.

**Complexity:** M (schema change to participant role, conditional vote gating, sidebar section)

---

### Confirmation Modals
A focused dialog system for destructive actions: Reveal Cards, New Round, Kick Player, and Leave Table (admin). The reveal-when-not-all-voted case uses a lighter inline confirmation in the Admin Bar instead of a full modal.

**Who it helps:** The facilitator (admin) — protects against misclicks that currently derail active sessions for all participants.

**Complexity:** S (reusable modal component with 5 content variants)

---

### Connection Toast System
Non-blocking notifications for session state changes: disconnected, reconnected, session expired (with Rejoin button), player kicked, and info events (e.g., "Cards were revealed while you were away").

**Who it helps:** All participants — replaces the current silent redirect to the join page with actionable, contextual feedback.

**Complexity:** S (toast queue manager, SSE event listeners, 6 toast variants)

---

### Admin Control Bar
A dedicated horizontal strip between the felt table and the voting card section, visible only to the admin. Contains the "👑 Session Controls" identity chip and the primary action button (Reveal or New Round depending on phase). Visually distinct from both the shared play area and the player's hand.

**Who it helps:** The admin — removes the current ambiguity of admin-only buttons appearing inside the shared game space.

**Complexity:** S (layout restructure + button state machine already partially implemented)

---

### Keyboard Navigation for Voting
A global keydown listener mapping number keys and letter shortcuts to voting cards (0, 1, 2, 3, 5, 8, T for 13, U for 21, ? for the question card, B for the coffee card). A keyboard shortcut hint overlay is accessible via an icon next to "Your Hand."

**Who it helps:** Developers and keyboard-preferring power users; also closes the WCAG AA accessibility gap.

**Complexity:** S (`useEffect` keydown listener in `VotingCards.tsx`; shortcut overlay UI)

---

## 6. Accessibility & Quality Improvements

### WCAG AA Compliance
All text/background color pairs have been verified against WCAG 2.1 AA standards (4.5:1 minimum for normal text, 3:1 for large text and UI components). **All primary text combinations pass**, including gold-400 on casino-surface (9.2:1) and white on felt (6.8:1). One fix required: the "Waiting..." vote badge moves from `text-casino-muted` to `text-white/70` to achieve 5.9:1 on surface backgrounds.

### Keyboard Navigation
Full keyboard support across all interactive surfaces:
- **Avatar grid**: arrow key navigation within the 4×3 grid
- **Role toggle**: arrow keys and Space to switch Player / Observer
- **Voting cards**: arrow keys across the row; Enter/Space to select; direct key shortcuts
- **Admin menus**: arrow keys to navigate; Escape to close
- **Modals**: focus trapped; Cancel receives focus on open; Escape closes

### Mobile Improvements
- Participant sidebar collapses into a floating pill + bottom drawer on screens narrower than 1024px
- All voting cards fit in a single row at 375px (36px cards, 2px gaps — mathematically verified)
- All touch targets meet the 44×44px WCAG minimum (enforced via a global `pointer: coarse` CSS rule)
- Confirmation modals render as full-width bottom sheets on mobile

### Performance Considerations
- No new network requests introduced — all new components use existing SSE event stream
- The felt diamond texture is an inline SVG data URI — zero additional HTTP requests
- All new animations include `prefers-reduced-motion` overrides; no animation is essential for understanding state
- Toast system manages a maximum of 3 concurrent notifications, preventing unbounded DOM growth

---

## 7. What's NOT Changing

Stakeholders should be reassured that the following are **explicitly out of scope** for this redesign:

| Preserved Element | Why |
|---|---|
| **Tech stack** (Next.js 16, React 19, Tailwind CSS v4) | No framework changes; all new components follow existing patterns |
| **Real-time SSE architecture** | Server-Sent Events remain the transport layer; no WebSocket migration |
| **Core game logic** (vote, reveal, new round, admin transfer) | Business logic untouched; only UI surfaces change |
| **Color token system** | All existing tokens (`casino-black`, `gold-*`, `casino-muted`, etc.) preserved |
| **Casino theme and personality** | Matured, not replaced — same felt, gold, Playfair Display, poker cards |
| **PokerCard component** | 3D flip rendering is well-executed; no changes in scope |
| **AvatarPicker component** | Avatar selection UX is out of v2 scope |
| **Fibonacci card values** | 0, 1, 2, 3, 5, 8, 13, 21, ?, ☕ — unchanged |
| **Backward compatibility** | No breaking changes to participant join flow or session URL structure |

---

## 8. Success Criteria

We will consider the redesign successful when the following measurable outcomes are achieved within 60 days of Phase 3 completion:

| Metric | Target | Measurement Method |
|---|---|---|
| **Premature reveal rate** (reveal before all players voted) | **< 5% of rounds** (down from current unknown baseline) | Server-side event log: reveal event vs. all-voted event timing |
| **Story title field usage** | **> 60% of rounds** have a story title set | Field completion event in analytics |
| **Admin accidental action rate** (misclick on Reveal/New Round followed by retry within 10s) | **< 2% of sessions** | Event sequence analysis |
| **Observer mode adoption** | **> 15% of sessions** with 6+ participants have at least 1 observer | Role analytics |
| **SUS (System Usability Scale) score** | **> 80 (Good)** | Post-session survey with 5–10 teams |

**Leading indicators to track from Phase 1 launch:**
- Returning team rate (teams using the tool in ≥ 2 sprints within 30 days)
- Mobile session completion rate (parity with desktop)
- First-time user comprehension rate in usability testing (target > 85% "I understood what I was supposed to do")

---

## 9. Implementation Roadmap

### Phase 1 — Quick Wins (1–2 sprints)
Low-risk, high-impact changes that can ship independently:

- **Confirmation modal** for New Round (prevents the most common facilitator complaint)
- **Inline reveal confirmation** in Admin Bar (no full modal needed — inline sub-state)
- **Connection toast system** (replaces silent redirects; all variants, SSE event wiring)
- **"..." overflow menu** on participant cards (replaces hover-only admin icons; closes mobile accessibility gap)
- **Vote status consolidation** (remove duplicate chip badges from felt; single `X of Y voted` counter)
- **Waiting badge contrast fix** (`text-casino-muted` → `text-white/70`) — WCAG compliance

### Phase 2 — Core Redesign (2–3 sprints)
Structural layout and schema changes:

- **Story Context Banner** component (inline edit for admin, read-only for players, SSE state sync)
- **Observer role** (schema update, join form toggle, sidebar section, vote gating)
- **Admin Control Bar** layout restructure (move controls out of felt into dedicated strip)
- **Reveal button state machine** (disabled → warning → inline confirm → primary → loading)
- **Mobile layout** (floating participant pill, bottom drawer, responsive card sizes)
- **Leave Table confirmation modal** (admin vs. non-admin variants)

### Phase 3 — Polish & Enhancements (1–2 sprints)
Accessibility, keyboard support, and surface refinements:

- **Keyboard voting shortcuts** (`VotingCards.tsx` keydown listener + shortcut overlay)
- **Card Legend** component (help icon + overlay + first-visit onboarding banner)
- **Results display improvements** (full-name attribution, sorted vote order, divergence indicator, Copy button)
- **Felt diamond texture** (SVG mask CSS addition to `globals.css`)
- **Reduced-motion overrides** audit and completion across all new animations
- **Accessibility audit** (focus order verification, `aria-live` region wiring, screen reader testing)

---

## 10. Approval Request

**We are requesting approval to proceed with Phase 1 implementation.**

Phase 1 delivers the highest-impact protections for active sessions (confirmation dialogs, connection toasts, consolidated vote status) with minimal architectural risk — all changes are additive or isolated to existing components.

**What happens after approval:**

1. Engineering begins Phase 1 sprint within the current cycle
2. Phase 1 ships to staging for facilitator testing (target: end of sprint 1)
3. Stakeholder sign-off on Phase 1 in production gates Phase 2 kickoff
4. Design handoff materials (UI Design Spec v2.0) are already complete and developer-ready

**Questions or concerns?** Raise them before sign-off so they can be incorporated into the Phase 1 scope or flagged for Phase 2 planning.

---

---

## Sign-Off

*By signing below, stakeholders confirm they have reviewed this brief and approve proceeding with Phase 1 implementation of the bf-point-estimate v2.0 redesign.*

&nbsp;

| Role | Name | Signature | Date |
|---|---|---|---|
| Product Owner | | | |
| Engineering Lead | | | |
| Design Lead | | | |
| Scrum Master / Delivery | | | |
| Executive Sponsor | | | |

&nbsp;

---

*Document version: 1.0 · Prepared March 9, 2026 · Responds to UX Research Findings and UI Design Specification v2.0*
*Next review: After Phase 1 ships to production*
