# Darts

Frontend-only single-page app (Vite + React 19 + TypeScript, Zustand, react-router-dom, shadcn/ui). No backend or external services. State persists to `localStorage` (`darts-game-storage`). UI language is Russian. Architecture follows Feature-Sliced Design — see `.cursorrules`.

## Cursor Cloud specific instructions

- Package manager is npm (`package-lock.json`). Dependencies are installed by the startup update script; no extra setup is required.
- There is no lint script. `npm run build` runs `tsc -b` (type-check) then `vite build`, so use the build for static/type checking.
- Standard commands (see `package.json` scripts):
  - Dev server: `npm run dev` (Vite on port 5173; add `-- --host` to expose it).
  - Tests: `npm test` (vitest run) or `npm run test:watch`.
  - Build: `npm run build`.
