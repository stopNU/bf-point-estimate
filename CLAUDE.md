# BF Point Estimate — Claude Instructions

## Tech Stack

- **Next.js 16.1.6** (App Router) + **React 19** + **Tailwind v4**
- Tailwind v4 uses `@theme inline {}` in `src/app/globals.css` — not `tailwind.config.ts`
- Real-time via **SSE** (no Socket.IO, no external deps)
- In-memory state via singleton `GameService`

---

## Key Files by Concern

| Concern | Location |
|---|---|
| App routes / pages | `src/app/` |
| API endpoints | `src/app/api/game/` (one action per route) |
| SSE stream | `src/app/api/sse/game/route.ts` |
| Game state singleton | `src/lib/game-service.ts` |
| Shared types | `src/lib/types.ts` |
| Theme state & toggle logic | `src/hooks/useTheme.ts` |
| Theme toggle UI | `src/components/ThemeToggle.tsx` |
| Sound effects | `src/lib/sound-service.ts` + `src/hooks/useSoundEffects.ts` |
| Global styles / design tokens | `src/app/globals.css` |
| Root layout (FOUC prevention, fonts) | `src/app/layout.tsx` |
| Reusable UI components | `src/components/` |
| Custom hooks | `src/hooks/` |

---

## Architectural Patterns

### Theming
- Theming uses **CSS custom properties** on `<html>` via a `data-theme` attribute — **not** Tailwind's `dark:` variant.
- `data-theme="cosmoswin"` activates the Cosmoswin (mecha/anime) palette; default (no attribute) is Casino.
- Design tokens are defined in `src/app/globals.css` inside `@theme inline {}`.
- Theme is persisted in `localStorage` under key `bf-theme`.
- An anti-FOUC inline script in `src/app/layout.tsx` restores the theme before first paint.
- Cosmoswin fonts (Bebas Neue, Share Tech Mono, Rajdhani) are loaded lazily via `useTheme` to avoid blocking the casino theme.

### State / Real-time
- `GameService` is a singleton kept alive across hot-reloads via `globalThis`.
- SSE pushes full game state snapshots on every change — clients do not diff.
- Client identity is a UUID in `localStorage` (`participantId`).

### API
- Each game action is a separate POST route under `src/app/api/game/<action>/route.ts`.
- Routes read `participantId` from the request body for auth.

---

## Conventions

- **className strings**: write directly as template literals (e.g., `` `bg-gold-500 ${active ? 'opacity-100' : 'opacity-50'}` ``). There is no `cn()` / `clsx` utility in this project — do not introduce one unless explicitly requested.
- **Theming in components**: use `isCosmos` from `useTheme()` to branch styles, or rely on CSS custom properties that automatically switch with `data-theme`.
- **Hooks**: place new custom hooks in `src/hooks/`. Keep hooks focused — one concern per file.
- **API routes**: follow the existing pattern — validate body, call `GameService`, broadcast via SSE, return JSON.
- **No external state libraries**: do not add Redux, Zustand, Jotai, etc. State lives in `GameService` (server) and React `useState` (client).
- **Tailwind tokens**: define new design tokens in `globals.css` under `@theme inline {}`, not inline or in a config file.

---

## Do NOT Touch Without Coordination

- **`src/lib/game-service.ts`** — core game state machine; changes here affect all players in all sessions. Requires backend coordination and careful testing.
- **`src/app/api/sse/game/route.ts`** — SSE stream management; breaking this disconnects all clients.
- **`src/app/layout.tsx`** (the anti-FOUC script) — changing the inline script order or the `data-theme` attribute name will break theme persistence.
- **`localStorage` key `bf-theme`** — renaming this key silently resets every user's theme preference.
