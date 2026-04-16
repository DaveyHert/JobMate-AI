# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this project is

JobMate AI+ is a Chrome Extension (Manifest V3) built with React + TypeScript + Vite + Tailwind CSS. It helps users track job applications, autofill forms, and manage resume profiles across browser sessions.

## Build commands

```bash
npm run build              # Full extension build (tsc + main Vite build + content script build)
npm run build:clean        # rm -rf dist, then full build
npm run build:extension    # build + copy manifest, icons, autofillEngine.js to dist/
npm run dev                # Vite dev server (popup + portal only; chrome.* APIs won't work)
npm run lint               # ESLint
```

To load in Chrome: `chrome://extensions/` → Enable Developer mode → Load unpacked → select `dist/`.

## Build pipeline — two Vite passes

The `build` script runs two separate Vite configs in sequence:

1. **`vite.config.ts`** — builds popup, portal, onboarding, and background service worker as ES modules. Entry points: `popup.html`, `portal.html`, `onboarding.html`, `index.html` (dev only), `src/background/background.ts`.
2. **`vite.content.config.ts`** — builds `src/content/contentScript.ts` as a single IIFE (no imports). `emptyOutDir: false` is required so this pass doesn't wipe the first pass output.

Content scripts must be IIFE because Chrome MV3 injects them as classic scripts, not ES modules.

## Path aliases

Defined in both Vite configs and `tsconfig`:
- `@` → `src/`
- `@hooks` → `src/hooks/`
- `@utils` → `src/utils/`
- `@components` → `src/components/`
- `@apps` → `src/apps/`
- `@shared` → `src/components/shared/`

## Folder structure

The `src/` layout is app-oriented — each of the three React roots lives under its own folder in `src/apps/`:

```
src/
├── apps/
│   ├── popup/         # popup.html root (580×700 extension popup)
│   │   ├── main.tsx   # React entry
│   │   ├── App.tsx    # tab shell
│   │   ├── pages/     # Home, Applications, Settings
│   │   └── components/
│   ├── portal/        # portal.html root (full-page web portal)
│   │   ├── main.tsx
│   │   ├── App.tsx    # hash router
│   │   ├── pages/home, pages/applications, pages/settings
│   │   └── components/  # PortalLayout, Header, QuickActions, AddApplicationModal
│   └── onboarding/    # onboarding.html root (first-install wizard)
│       ├── main.tsx
│       ├── App.tsx
│       ├── steps/
│       └── components/
├── components/
│   ├── ui/            # shadcn primitives
│   └── shared/        # components used by more than one app (e.g. settings tabs)
├── main.tsx           # dev-only SPA entry (index.html) — Vite convention at src root
├── App.tsx            # dev-only SPA router — hosts both popup and portal
├── background/        # MV3 service worker
├── content/           # contentScript (IIFE bundle)
├── engine/            # autofill engine used by content script
├── hooks/, utils/, store/, context/, models/, helpers/, lib/, data/, assets/
```

Import conventions:
- Same-app imports: relative (`./components/Foo`, `../pages/Bar`).
- Cross-cutting imports: use aliases (`@/models/models`, `@hooks/useJobMateData`, `@shared/settings/tabs/GeneralTab`).

## State management — `jobMateStore`

**All persistent state flows through `src/store/jobMateStore.ts`.** Never call `chrome.storage.local` directly.

- In extension contexts (popup, portal, background, content): uses `ChromeStorageBackend`
- In dev (Vite preview, no chrome.*): falls back to `LocalStorageBackend`
- Singleton — every import in a given context gets the same instance
- Cross-context sync happens via `chrome.storage.onChanged`

React components subscribe via the `useJobMateData` hook (`src/hooks/useJobMateData.ts`), which re-renders whenever the store emits. Always prefer this hook over calling the store directly in components.

## Data model

Canonical types live exclusively in `src/models/models.ts`. Do not define `Application`, `UserProfile`, or related shapes anywhere else.

Key shapes:
- `JobMateData` — top-level persisted object (profiles, applications, weeklyGoal, settings)
- `UserProfile` — one resume per profile (enforced by `splitMultiResumeProfiles` migration in the store)
- `Application` — status history is append-only; never delete events from `history[]`

Schema migrations run inside `jobMateStore` on every load. Unknown schema versions reset to defaults.

## Extension UI contexts

There are three independent React roots:
- **Popup** (`popup.html` → `src/apps/popup/main.tsx` → `src/apps/popup/App.tsx`) — 580×700px fixed, tab-based nav (Home / Applications / Settings)
- **Portal** (`portal.html` → `src/apps/portal/main.tsx` → `src/apps/portal/App.tsx`) — full-page web portal, opened via `chrome.tabs.create`. "Dashboard" is a route *inside* the portal, not the portal itself.
- **Onboarding** (`onboarding.html` → `src/apps/onboarding/main.tsx` → `src/apps/onboarding/App.tsx`) — first-install wizard, opened once by the background service worker.

In dev mode (`npm run dev`), popup and portal are accessible from `index.html` / `src/App.tsx` via React Router (`/` = popup, `/portal.html` = portal). A `DevNav` bar appears in dev mode only.

## Theme

`ThemeContext` (`src/context/ThemeContext.tsx`) syncs light/dark across popup and portal via `chrome.storage.local` (key: `"theme"`). Falls back to `localStorage` + system preference when chrome.storage is unavailable. Always use `useThemeContext` from `src/hooks/useThemeContext.ts`, not the context directly.

## Content script

`src/content/contentScript.ts` runs on every page (`<all_urls>`). It handles autofill and job data extraction. Communicate with it via `chrome.tabs.sendMessage` / `chrome.runtime.onMessage`.
