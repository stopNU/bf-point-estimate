# UX Research Findings: bf-point-estimate Scrum Poker App
**Prepared by:** UX Research
**Date:** March 9, 2026
**Status:** Final — Ready for Design Handoff
**App Version Reviewed:** Current codebase (Next.js 16, React 19, Tailwind CSS v4)

---

## Executive Summary

bf-point-estimate is a casino-themed real-time planning poker tool with strong thematic identity and clean initial implementation. However, a pattern of friction points — particularly around onboarding ambiguity, admin-only control concentration, lack of story context anchoring, and mobile layout compromises — reduces its effectiveness for the agile teams it serves. This document maps those friction points to specific, prioritized design recommendations for the upcoming UI redesign.

---

## 1. User Persona Analysis

### Persona A — "The Facilitator" (Scrum Master / Team Lead)

**Demographics:** 28–42 years old, agile practitioner, tech-comfortable but time-pressured
**Context:** Runs 2–4 estimation sessions per sprint, often while screen-sharing in a video call
**Goals:**
- Keep the session moving efficiently; minimize tool overhead
- Ensure all voices are heard (prevent anchoring bias before reveal)
- Capture outcomes (agreed estimate) and move to the next story quickly

**Behaviors:**
- Opens the session first, shares a link with the team
- Is responsible for pasting the story title/ticket ID into the conversation
- Reveals cards, facilitates discussion on disagreements, triggers new rounds

**Pain Points (Current App):**
- No in-app story context — must maintain a parallel Jira/Linear window and verbally relay ticket info
- As the only admin, a disconnection or accidental page-close transfers critical responsibilities with no clear UX recovery path
- No way to annotate which round matched which story — no session log

**Quote archetype:** "I need to keep 8 people aligned, not babysit a browser tab."

---

### Persona B — "The Voter" (Developer / QA / Designer)

**Demographics:** 22–45, varies widely in agile experience
**Context:** Joins a session link shared in Slack/Teams, may have the app open alongside their IDE or ticket tracker
**Goals:**
- Quickly understand what story is being estimated
- Pick a card that reflects their opinion without social pressure from seeing others' votes
- Understand the result quickly and move on

**Behaviors:**
- Joins mid-session or late
- May be on a laptop with limited screen real estate or a secondary monitor
- Occasionally uses mobile (e.g., in a standup room or on the go)

**Pain Points (Current App):**
- No indication of *what* they are voting on — no story text or ticket link visible in the game view
- Joining mid-round shows no indication of round status or whether to wait or vote
- Voting card row wraps on smaller screens in ways that obscure card count
- No feedback that their vote was registered on the server (only local optimistic UI)

---

### Persona C — "The Observer" (Product Manager / Stakeholder)

**Demographics:** 30–50, may not understand Fibonacci scale nuances
**Context:** Joins to listen and learn; may not be expected to vote
**Goals:**
- Understand what estimate the team landed on and why there was disagreement
- Not disrupt the session by accidentally voting or revealing cards

**Behaviors:**
- Often joins without being briefed on how the tool works
- May accidentally pick a card or be confused by the "you" indicator in the participant list
- Wants to see historical session context that currently does not exist

**Pain Points (Current App):**
- No observer/spectator mode — every participant is treated as a voter
- No explanation of the Fibonacci scale or what "?" or "☕" cards mean — discoverable only through use
- Consensus vs. average distinction not explained inline

---

## 2. Current User Journey Analysis

### Journey Map: "Team Decides to Estimate → Consensus Reached"

```
PHASE          TRIGGER              CURRENT UX                          PAIN POINTS
─────────────────────────────────────────────────────────────────────────────────────────────
1. SETUP       SM opens /           Name input + avatar picker           - No room name or session
               and shares URL       "Take a Seat" button                   code visible to share
                                                                         - Avatar selection is
                                                                           optional distraction
                                                                           before a time-pressured
                                                                           session

2. JOIN        Dev clicks           Same Join form for everyone          - No indication a session
               shared link          Redirects to /game on submit           is already in progress
                                                                         - No "Joining as late
                                                                           participant" context
                                                                         - localhost-only in dev;
                                                                           no shareable room code UX

3. ORIENT      Dev lands on         Sidebar: participant list            - No story/ticket info
               /game                Center: "Place Your Bets" or          visible anywhere
                                    "Votes Coming In..."                 - Round number shown in
                                    Bottom: voting card row                header but no story label
                                                                         - First-time users have
                                                                           no clue what ?, ☕ mean

4. VOTE        Dev picks a card     Card lifts with gold glow            - 10 cards in a row may
                                    Sidebar shows "Voted" in green         wrap on 375px mobile
                                    Others see face-down card            - No undo confirmation;
                                    indicator in center area               tap → immediate vote
                                                                         - No visual server-ack
                                                                           (only local state update)
                                                                         - Can change vote silently;
                                                                           no notification to team

5. WAIT        All voted or         "Votes Coming In..." text            - Admin must manually
               SM ready to          Gold chip badges per voter             decide when to reveal;
               reveal               Admin: "Reveal Cards" button           no auto-reveal option
                                                                         - Non-admins have no
                                                                           ability to "nudge" admin
                                                                         - If admin is AFK, session
                                                                           stalls with no recourse

6. REVEAL      Admin clicks         Cards flip face-up                   - No animation delay
               "Reveal Cards"       Results: average, distribution         between "clicked" and
                                    bars, individual cards                 "revealed" (feels abrupt)
                                                                         - "Reveal Cards" active
                                                                           even before all voted —
                                                                           risk of premature reveal
                                                                         - Admin controls sit
                                                                           inside the felt table
                                                                           area; not obvious they
                                                                           are admin-only

7. DISCUSS     Team sees            Distribution bars with counts        - No way to highlight
               results              Nearest Fibonacci shown               who voted high/low
                                    ?, ☕ callout banners                 - Names under revealed
                                                                           cards truncated at 48px
                                                                         - No chat or reaction
                                                                           mechanism
                                                                         - No timer for discussion

8. CONSENSUS   SM clicks            "New Round" replaces                 - All votes reset with no
   / RESET     "New Round"          "Reveal Cards"                         confirmation dialog
                                    Round counter increments             - No way to record the
                                    All votes clear                        agreed estimate before
                                                                           resetting
                                                                         - Story context (if any
                                                                           existed) not persisted
```

---

## 3. Usability Heuristic Evaluation

Evaluated against Nielsen's 10 Usability Heuristics.

### H1 — Visibility of System Status

**Rating: 3 / 5 — Partially Met**

What works:
- Green/red dot with "Connected / Reconnecting..." in the header communicates real-time connection health.
- The chip badges in the center table area show who has and has not voted.
- The sidebar participant list uses "Voted" (green) vs. "Waiting..." (muted) per player.

Issues:
- Vote count ("X of Y players have voted") is displayed in two different places (center table + sidebar header) using different formats (`X of Y voted` vs `X/Y voted`), which is redundant and creates visual noise.
- No indication of which player is taking a long time to vote — all pending players look the same.
- When the admin triggers "Reveal Cards," there is no visible intermediate loading state — the transition is instantaneous, making it unclear if the action was received.
- The round number is in the header but is easy to miss alongside the logo — no salient "Round X of N" context.

### H2 — Match Between System and Real World

**Rating: 4 / 5 — Mostly Met**

What works:
- The casino metaphor (felt table, poker cards, gold accents, "Place Your Bets") is coherent and memorable. Agile teams will recognize the planning poker framing immediately.
- Card values follow the standard Fibonacci sequence used in planning poker norms.
- "Take a Seat" and "Leave Table" use natural table metaphors.

Issues:
- "Place Your Bets" is gambling language that may feel slightly off-brand in a corporate/enterprise context.
- The admin crown emoji (👑) on the avatar badge is thematically appropriate but its functional meaning (admin privileges) is not labeled — relies on inference.
- The ☕ card (break requested) has no in-UI tooltip or legend explaining its meaning to first-time users. Same for the ? card.
- The term "New Round" resets context entirely, whereas real planning poker typically ties rounds to a specific story — this mismatch between the metaphor and agile workflow is a semantic gap.

### H3 — User Control and Freedom

**Rating: 2 / 5 — Significant Issues**

What works:
- Players can change their vote by clicking a different card (toggle behavior works).
- "Leave Table" is consistently available in the header.

Issues:
- **No confirmation on "Reveal Cards"** — an accidental click by the admin immediately exposes all votes, removing the anti-anchoring benefit of the simultaneous reveal process.
- **No confirmation on "New Round"** — clicking this irreversibly discards all votes and the results in view.
- **No confirmation on "Leave Table"** — especially critical if the leaving user is the admin, as admin responsibilities will transfer silently.
- **No undo for kick** — the admin can remove a participant with a single click on the small ✕ button revealed on hover. There is no "are you sure?" step.
- Non-admin users have zero control over the session even in edge cases (e.g., admin goes AFK). There is no mechanism to request a reveal or request admin transfer.

### H4 — Consistency and Standards

**Rating: 3 / 5 — Partially Met**

What works:
- Card rendering is consistent between the voting hand row and the revealed results area.
- Color coding (gold = active/selected, muted grey = inactive) is applied consistently.

Issues:
- The admin-only actions (Reveal Cards, New Round) live *inside* the green felt table area but are rendered conditionally — non-admins see the table without these buttons. The spatial position of admin controls within the play area rather than a dedicated control strip is inconsistent with the mental model that the table is the shared space.
- The kick/transfer-admin actions on participant cards are icon-only (👑 and ✕) revealed on hover — inaccessible on touch devices and inconsistent with the labeled-button convention used elsewhere.
- Vote status in the sidebar ("Voted" vs. "Waiting...") and in the center table (gold chips) use different visual languages for the same information.

### H5 — Error Prevention

**Rating: 2 / 5 — Significant Issues**

What works:
- The "Reveal Cards" button is disabled when `hasVotes === false`, preventing a reveal with no data.
- Name validation ("Enter your name to take a seat") prevents blank join.

Issues:
- No confirmation on the three most destructive admin actions: Reveal, New Round, Kick.
- The admin's "Reveal Cards" button is active as soon as any single player votes, not when all have voted — high risk of premature reveal in large teams.
- The "Leave Table" button has no confirmation and no warning that leaving as admin will trigger an implicit admin transfer.
- The kick button (✕) is small (p-1 padding, text-xs) and appears on hover near the transfer-admin button (👑). Proximity of two destructive/power actions with no confirmation is a misclick risk.
- Voters can silently change their vote after submitting, with no notification to other participants. In some team cultures this is acceptable; in others it undermines the process.

### H6 — Recognition Rather Than Recall

**Rating: 3 / 5 — Partially Met**

What works:
- Avatar labels (e.g., "The Dealer", "High Roller") are shown during avatar selection.
- Selected card is visually lifted and gold-highlighted — easy to recognize at a glance.

Issues:
- In the participant sidebar, avatars show only the emoji — the label is not displayed. Users who chose their avatar for its label will not see it reinforced.
- The ? and ☕ card values have no inline tooltip or legend. Their meanings must be recalled or inferred.
- The distribution bars in results label values by card face value only — no annotation explaining "? = needs discussion" for observers or new users.
- Admin actions (👑, ✕) on participant cards are tooltip-only (`title` attribute). Tooltips do not appear on mobile and are delayed on desktop.

### H7 — Flexibility and Efficiency of Use

**Rating: 2 / 5 — Significant Issues**

What works:
- Clicking a selected card deselects it (toggle) — good power-user behavior.

Issues:
- **No keyboard navigation** for voting cards — cannot select a card or confirm a vote via keyboard, which is a significant accessibility gap and efficiency loss for keyboard-preferring developers.
- No way to vote by just pressing a number key (0, 1, 2, 3, 5, 8, T for 13, etc.).
- No session persistence: refreshing the game page redirects to join if the server has restarted, losing all context.
- No way to pre-configure a story queue and auto-advance — requires manual admin action per round.
- No spectator/observer mode — everyone joining is a voter, which inflates the participant count and vote pool for stakeholders who are watching only.

### H8 — Aesthetic and Minimalist Design

**Rating: 3 / 5 — Partially Met**

What works:
- The casino dark theme is visually distinct and consistently applied.
- The Playfair Display / Inter font pairing creates clear hierarchy between decorative headers and functional text.
- The gold shimmer on the logo is a single, controlled use of motion that adds personality without clutter.

Issues:
- **Duplicate information density:** Vote status is presented in three locations simultaneously — the sidebar "Voted/Waiting" text, the sidebar header "X/Y voted" counter, and the center table gold chip badges. This redundancy competes for attention.
- The center table felt area feels empty during the voting phase. "Place Your Bets" + a count + chips leaves large amounts of unused green felt that could feel more purposeful with story context or a progress indicator.
- The results screen packs: a consensus/average number, a distribution bar chart, individual revealed cards (as small cards with truncated names), and callout banners for ? and ☕ — all in a single scrollable column inside the felt area. On smaller viewports this becomes very dense.
- The header contains the logo, round number, connection status, and Leave button in one row. On mobile (<sm), the round number and "Connected" label are hidden — important context that disappears rather than adapting.

### H9 — Help Users Recognize, Diagnose, and Recover from Errors

**Rating: 2 / 5 — Significant Issues**

What works:
- The join form shows an inline error if the name field is blank.
- The game page auto-redirects to join if the participant ID is missing from localStorage.

Issues:
- If a user's connection drops and reconnects, there is no toast or banner explaining what state they may have missed (e.g., "Cards were revealed while you were disconnected").
- If the server restarts, the participant is silently kicked to the join page with no explanation — the error message is `router.replace('/')`, not a user-readable error.
- No error state for the "Joining the table..." loading screen — if the SSE connection never establishes, the loading spinner runs indefinitely with no timeout or retry UI.
- Voting during the revealed phase is silently blocked (`disabled` prop, opacity-50) but there is no tooltip or message explaining why cards are greyed out.

### H10 — Help and Documentation

**Rating: 1 / 5 — Not Met**

Issues:
- There is no in-app onboarding, tooltip system, or help panel.
- The card values (Fibonacci sequence) are not explained anywhere in the UI.
- The ? and ☕ special cards have no labeled meaning on screen.
- The role distinction between admin and non-admin is not explained.
- New participants joining mid-session receive no brief orientation to the current state of the round.

---

## 4. Key Pain Points (Ranked by Severity)

| # | Pain Point | Severity | Heuristics Violated | User(s) Affected |
|---|---|---|---|---|
| 1 | **No story/ticket context in game view.** Players have no in-app reference for what they are estimating. They must rely on a separate video call or chat. | Critical | H2, H8 | All |
| 2 | **No confirmation on destructive admin actions** (Reveal, New Round, Kick). Any accidental tap permanently alters session state for all participants. | Critical | H3, H5 | Admin, All |
| 3 | **No observer/spectator mode.** Stakeholders and PMs must join as voting participants, polluting vote data with uninformed or placeholder votes. | Critical | H2, H7 | Observers |
| 4 | **Reveal button active before all participants have voted.** Admin can prematurely expose votes, undermining the anti-anchoring value of simultaneous reveal. | High | H5 | Admin, All |
| 5 | **No keyboard accessibility for voting.** Cards are not keyboard-navigable. Power users and accessibility-dependent users cannot vote without a pointer device. | High | H7, Accessibility | All |
| 6 | **Admin controls have no visual separation from the shared table space.** They are placed inside the felt area conditionally — non-admins see the empty space; admins see buttons inside the play area with no "admin zone" framing. | High | H4, H6 | Admin |
| 7 | **Silent server restart redirects to join with no error message.** Users lose session context with no explanation, creating confusion and requiring a rejoin that resets their participant state. | High | H9 | All |
| 8 | **Kick and Transfer Admin buttons are hover-only and icon-only.** On touch devices these actions are completely inaccessible. Adjacent placement with no confirmation creates misclick risk. | High | H3, H5, H6 | Admin |
| 9 | **Vote status information is triplicated.** The sidebar header counter, the sidebar per-player status, and the center table chip badges all display the same voted/not-voted information in different formats. | Medium | H8 | All |
| 10 | **? and ☕ card meanings are undiscoverable.** There is no legend, tooltip, or first-run explanation for what these special values signify. | Medium | H6, H10 | New users, Observers |
| 11 | **Results display truncates player names at 48px** in the individual revealed card section, making attribution of votes unclear in larger teams. | Medium | H1, H8 | All |
| 12 | **No session history or round log.** Teams cannot review which story was estimated at which value. Every "New Round" discards all state. | Medium | H7 | Scrum Master |
| 13 | **Loading screen has no error or timeout state.** "Joining the table..." can run indefinitely if the SSE connection fails. | Medium | H9 | All |
| 14 | **Avatar labels not shown in the game view.** Players chose personas ("The Dealer", "High Roller") during join but these labels never surface again in the game. | Low | H6 | All |
| 15 | **"Place Your Bets" language may not suit corporate contexts.** Gambling terminology creates friction in conservative enterprise environments. | Low | H2 | All (enterprise) |

---

## 5. Opportunity Areas

### O1 — Story Context Panel
Introduce a story/ticket input field that the admin can set per round. Display the story title, ticket ID, and optionally a link at the top of the felt area throughout the voting phase. This is the single highest-impact improvement for session quality, as it eliminates the need for a parallel communication channel.

### O2 — Tiered Participant Roles
Implement an Observer role (spectator) that can see all activity but cannot vote. This keeps vote pools clean when PMs or stakeholders attend sessions. The role toggle should be self-selectable at join time or assignable by the admin.

### O3 — Progressive Reveal Pressure & Auto-Reveal Threshold
Allow the admin to configure an auto-reveal trigger (e.g., "Reveal when all have voted"). Additionally, add a non-admin "I'm ready" signal — a soft nudge visible only to the admin — so facilitators know when the team has settled rather than waiting passively.

### O4 — Persistent Round History / Session Log
Add an in-session log panel (collapsed by default) that records: round number, story title (if set), agreed estimate, and timestamp. This gives the Scrum Master a lightweight session artifact they can screenshot or export without leaving the app.

### O5 — Keyboard Shortcuts for Voting
Map number keys to card values (0, 1, 2, 3, 5, 8, T or Enter for 13, U for 21, Q for ?, B for ☕). Display a keyboard shortcut hint icon near the card row. This will significantly improve efficiency for developers who prefer keyboard-first workflows.

### O6 — Dedicated Admin Control Strip
Visually separate admin controls from the shared table area. A persistent, labelled admin toolbar — distinct from the green felt — makes it clear that Reveal/New Round are administrative actions that affect all participants, not just the current user's view. This also creates natural space for future admin features (timer, story input, auto-reveal toggle).

### O7 — Confirmation Dialogs for Destructive Actions
Implement lightweight confirmation for Reveal (when not all have voted), New Round (always), and Kick. A single-step modal or inline confirmation ("Click again to confirm") is sufficient — a full modal is not required for every case.

### O8 — Improved Mobile Layout
Restructure the mobile (< lg) layout to prioritize the voting card row and the felt table area. On mobile, the sidebar participant list (currently a horizontal strip above the table) should collapse into a pull-up drawer or a compact floating indicator rather than consuming vertical real estate. The voting card row should never wrap to more than two lines on any viewport wider than 375px.

---

## 6. Design Recommendations

### High Priority

**R1 — Story Context Header in Game View**
Add an editable story title field to the top of the felt table area. Admin-editable inline (click to edit); read-only for non-admins. Persist the story title in round state and display it in the session log.
- Components affected: `GameBoard.tsx`, `AdminControls.tsx`, game state schema
- Interaction: inline text edit with auto-save on blur/Enter; show pencil icon on hover for admin

**R2 — Confirmation for Reveal, New Round, and Kick**
Add a two-step confirmation pattern:
- "Reveal Cards" when not all have voted: show a secondary state ("X players haven't voted — Reveal anyway?") inline below the button
- "New Round": require a second click within 3 seconds, or a simple modal. Show the agreed estimate prominently before reset
- "Kick": inline confirmation ("Remove [Name]?") with a small Yes/Cancel
- Components affected: `AdminControls.tsx`, `ParticipantCard.tsx`

**R3 — Observer/Spectator Role**
Add a "Join as Observer" toggle on the `JoinForm`. Observers appear in the participant list with a distinct badge (e.g., 👁 icon) and cannot cast votes. Admin can promote observers to voters.
- Components affected: `JoinForm.tsx`, `ParticipantCard.tsx`, `ParticipantList.tsx`, game state schema

**R4 — Dedicated Admin Control Bar**
Move `AdminControls` out of the felt table area into a fixed horizontal bar at the very bottom of the viewport (above "Your Hand" on non-admin view, replacing it with a simpler status bar for non-admins). Label the bar "Session Controls" with a subtle admin crown indicator. This visually separates the shared play area from session management.
- Components affected: `GameBoard.tsx`, `AdminControls.tsx`

**R5 — Reveal Button: All-Voted Gating + Visual Indicator**
Change the "Reveal Cards" enabled state: show it as active only when all voters have voted, OR show it active at all times but with a prominent warning annotation ("3 players haven't voted") that requires the admin to read before clicking. The current `hasVotes` gate (any one vote triggers enable) is too permissive for teams larger than 2.
- Components affected: `AdminControls.tsx`, `GameBoard.tsx`

---

### Medium Priority

**R6 — Information Architecture: Consolidate Vote Status**
Remove the vote-status chip badges from the center table area (the gold chips with player names). The sidebar participant list with per-player "Voted / Waiting..." status is the canonical location for this. In the center table during voting, replace chips with a single, large, progress indicator (e.g., "5 / 8 Voted" in bold gold text) to reduce redundancy while maintaining status visibility.
- Components affected: `GameBoard.tsx`

**R7 — Keyboard Voting Support**
Add a `useEffect` in `VotingCards` that listens for keydown events and maps: `0→0`, `1→1`, `2→2`, `3→3`, `5→5`, `8→8`, `t→13`, `u→21`, `?→?`, `b→☕`. Show a small "Keyboard shortcuts available (press ?)" hint below the card row that toggles a shortcut overlay.
- Components affected: `VotingCards.tsx`

**R8 — Session Round Log (Collapsed Panel)**
Add a collapsible "Session History" panel accessible from the header. Each entry records round number, story title, consensus/average result, and time. Populated automatically on each "New Round" click, storing the just-completed round's results.
- New component: `SessionLog.tsx`

**R9 — Touch-Accessible Admin Actions on Participant Cards**
Replace hover-reveal admin buttons on `ParticipantCard` with a "..." (ellipsis) menu icon that appears at all times on mobile and on hover on desktop. This menu should contain labeled options: "Make Admin", "Remove from Session". Eliminates the accessibility gap and misclick risk.
- Components affected: `ParticipantCard.tsx`

**R10 — Card Legend / Onboarding Tooltip**
Add a small "?" help icon next to the "Your Hand" label. Tapping it opens a compact legend explaining all 10 card values:
- 0–21: Fibonacci story point estimates
- ?: "I'm uncertain / need more information"
- ☕: "I need a break"
Include a one-time first-visit banner ("New here? Here's how planning poker works") that dismisses and sets a localStorage flag.
- New component: `CardLegend.tsx`

**R11 — Results Display: Name Attribution Improvement**
In the revealed cards row in `ResultsDisplay`, increase the name label max-width to at least 64px and display the full name on hover (CSS tooltip). Sort revealed cards by value (ascending numeric, then ?, then ☕) to make the distribution pattern scannable at a glance.
- Components affected: `ResultsDisplay.tsx`

**R12 — Empty/Loading Error States**
Add a timeout (10 seconds) to the "Joining the table..." loading screen. If the SSE connection is not established, show: "Could not connect to the session. [Retry] [Return to Join]". Display a toast notification ("You were disconnected. Reconnecting...") on connection loss rather than silent reconnection.
- Components affected: `game/page.tsx`, `GameBoard.tsx`

---

### Low Priority

**R13 — Avatar Label in Game Sidebar**
Show the avatar label (e.g., "High Roller") as a tooltip on hover over participant avatar circles in `ParticipantCard`. This reinforces the persona chosen at join time and adds personality to the sidebar.
- Components affected: `ParticipantCard.tsx`

**R14 — Mobile Layout: Participant List as Drawer**
On viewports < 640px, collapse the participant sidebar into a bottom-sheet drawer triggered by a floating indicator showing participant count and vote progress (e.g., "👥 5/8 voted"). This frees the full viewport height for the table and voting cards, which are the primary interaction surfaces.
- Components affected: `GameBoard.tsx`, `ParticipantList.tsx`

**R15 — Admin Transfer Confirmation**
When the admin intentionally transfers the admin role (👑 button), add an inline confirmation to prevent misclicks. The current admin icon is identical to the admin badge, so clicking the transfer button by accident is plausible.
- Components affected: `ParticipantCard.tsx`

**R16 — "Place Your Bets" Copy Review**
Offer an alternate microcopy setting or soften to "Cast Your Vote" for enterprise contexts while keeping the casino aesthetic through visual design rather than gambling-specific language. Alternatively, make the headline dynamic: "Place Your Bets" → "Votes Coming In..." → "Cards Revealed".
- Components affected: `GameBoard.tsx`

**R17 — Round Timer (Optional)**
Allow the admin to set an optional per-round countdown timer. Display a countdown in the felt area. Auto-reveal or prompt admin to reveal when timer expires. This addresses the "admin AFK" stall scenario without requiring explicit role actions from non-admins.
- New component: `RoundTimer.tsx`

**R18 — Visual Separation of Special Cards**
In the voting card row, visually separate the `?` and `☕` cards from the numeric Fibonacci cards using a subtle divider or increased gap. This communicates that they are categorically different (qualitative responses, not estimates) before users have read any documentation.
- Components affected: `VotingCards.tsx`

---

## 7. Success Metrics

### Primary Metrics (Session Quality)

| Metric | Current Baseline | Target After Redesign | Measurement Method |
|---|---|---|---|
| **Time from session start to first vote cast** | Unknown | < 60 seconds | Analytics event timing |
| **Premature reveal rate** (reveal before all voted) | Unknown | < 5% of rounds | Server-side event log |
| **Rounds per session** | Unknown | Increase by 20% | Session analytics |
| **Session abandonment rate** (user leaves before round completes) | Unknown | Decrease by 30% | Leave event tracking |

### Secondary Metrics (Usability)

| Metric | Target | Measurement Method |
|---|---|---|
| **Admin accidental action rate** (misclicks on Reveal/New Round/Kick followed by retry) | < 2% of sessions | Event sequence analysis |
| **Observer mode adoption** | > 15% of sessions with 6+ participants have at least 1 observer | Role analytics |
| **Story title field usage** | > 60% of rounds have a story title set | Field completion event |
| **Mobile session completion rate** | Parity with desktop (currently unknown) | Platform-segmented session analytics |
| **Card legend help icon engagement** | < 20% of sessions (indicating most users don't need it) | Click analytics |

### Qualitative Metrics

- **SUS (System Usability Scale) score:** Target > 80 (Good) — benchmark via post-session survey with 5–10 teams
- **Task completion rate** in usability testing: Target > 90% for: (a) joining a session, (b) casting a vote, (c) admin revealing cards
- **First-time user comprehension:** "I understood what I was supposed to do" agreement rate > 85% in post-test interviews

### Leading Indicators (Adoption)

- **Returning team rate:** Teams that use the tool in ≥ 2 sprints within 30 days
- **Team size growth:** Average participants per session (larger teams = higher confidence in onboarding)
- **Invite completion rate:** Participants who join via a shared link vs. drop off at the join form

---

## Appendix A: Component-to-Recommendation Mapping

| Component | Recommendations |
|---|---|
| `GameBoard.tsx` | R1, R4, R5, R6, R12, R14, R16 |
| `AdminControls.tsx` | R2, R4, R5 |
| `JoinForm.tsx` | R3 |
| `VotingCards.tsx` | R7, R18 |
| `ParticipantCard.tsx` | R2, R3, R9, R13, R15 |
| `ParticipantList.tsx` | R3, R14 |
| `ResultsDisplay.tsx` | R11 |
| `PokerCard.tsx` | (No changes required; 3D flip and card rendering are well-executed) |
| `AvatarPicker.tsx` | (No changes required for v2 scope) |
| New: `SessionLog.tsx` | R8 |
| New: `CardLegend.tsx` | R10 |
| New: `RoundTimer.tsx` | R17 |
| `game/page.tsx` | R12 |

---

## Appendix B: Information Architecture — Proposed Game View Layout

```
┌─────────────────────────────────────────────────────────────┐
│ HEADER: [Logo] [Story: "User auth flow — #AUTH-142"] [R:3] [● Connected] [Leave Table] │
├──────────────┬──────────────────────────────────────────────┤
│              │                                              │
│ SIDEBAR      │  FELT TABLE AREA                             │
│              │                                              │
│ Players      │  [Story title displayed prominently]         │
│ (5/8 voted)  │                                              │
│              │  Voting phase: Large progress indicator      │
│ ● Alice  ✓   │  "5 of 8 voted"                              │
│ ● Bob    ✓   │                                              │
│ ● Carol  ✓   │  Revealed phase: Average/Consensus,          │
│ ○ Dave   …   │  distribution bars, revealed cards           │
│ ○ Eve    …   │                                              │
│              │                                              │
│              │                                              │
├──────────────┴──────────────────────────────────────────────┤
│ ADMIN BAR (admin only):  [Reveal Cards — 3 haven't voted ▲] │
│              OR          [New Round]                         │
├─────────────────────────────────────────────────────────────┤
│ YOUR HAND:  [0][1][2][3][5][8][13][21] | [?][☕]  [?]help  │
└─────────────────────────────────────────────────────────────┘
```

Key changes from current layout:
- Story context in the header/table area (new)
- Admin bar as a distinct horizontal strip between the table and the hand (moved from inside the felt)
- Special cards (?, ☕) visually separated from numeric cards (new)
- Help icon adjacent to the hand label (new)

---

*Document prepared for stakeholder review and UI design handoff. All recommendations are grounded in direct codebase analysis and established UX heuristics. Severity ratings reflect both frequency of encounter and potential impact on session integrity.*
