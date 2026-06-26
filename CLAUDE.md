# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**CardDex Quest** is a client-side-only React web app for a 10-year-old trading card collector. It has three tabs: My Binder, Open a Pack, and Create a Card. All data persists via `localStorage`. There is no backend, no authentication, and no payments.

The spec lives in `starter-prompt.md` — treat it as the source of truth for feature requirements.

## Tech Stack

- **React** (state management via React state only — no Redux, no Zustand)
- **localStorage** for all persistence
- No backend, no external APIs

Since this is a greenfield project, initialize it with Vite + React (preferred for simplicity) or Create React App:

```bash
npm create vite@latest . -- --template react
npm install
npm run dev      # dev server
npm run build    # production build
npm run preview  # preview production build
npm run lint     # if eslint is configured
```

If tests are added (e.g. Vitest):
```bash
npm test              # run all tests
npm test -- MyBinder  # run a single test file by name
```

## Architecture

### Three-tab structure
Each tab maps to a top-level feature component:

- **My Binder** — card collection list with add-card form, responsive grid, type/rarity filters, favorites
- **Open a Pack** — randomized 5-card reveal with rarity-weighted distribution and glow animations for Rare/Ultra Rare
- **Create a Card** — split-pane form + live card preview, save to binder

### Data model
Cards shared across tabs should follow a shape like:
```js
{
  id,         // unique identifier
  name,
  type,       // creature type (e.g. Fire, Water)
  hp,
  rarity,     // "Common" | "Uncommon" | "Rare" | "Ultra Rare"
  condition,  // e.g. Mint, Good, Worn
  quantity,
  favorite,   // boolean
  attackName,
  attackDamage,
  description,
}
```

localStorage key for the binder: keep it consistent across the codebase (e.g. `cardex-binder`).

## Key Constraints

- **No official Pokémon branding** — card designs must be original. Do not copy Pokémon card layouts.
- **Beginner-readable code** — keep components simple, add brief comments on non-obvious logic.
- **Mobile-first** — large tap targets, responsive grid (CSS Grid or Flexbox).
- **Fun animations** — Rare and Ultra Rare cards get a CSS glow/shimmer effect. Open Pack reveal should animate.
- **Bright, energetic UI** — vivid colors, large buttons.
