# 2026-08-26 — Prototype one, end to end

One long session, from empty repo to merged prototype.

## What happened

1. Wrote `DESIGN.md` (the design contract) and the `tunza` agent
   (`.claude/agents/tunza.md`) on top of the README thesis.
2. Merged the Cursor agent's v1 foundation and aligned it to the contract:
   full EN/SW copy layer (compile-enforced), canonical referral lifecycle with
   `seen`, semantic action ids, no internal enums on screen, five-step type
   scale, tokens only.
3. Deep research (105 agents, 21 verified claims) on matte red for health UI →
   the two-red discipline. Repainted: Tunza Red `#7c1f18` as brand/action,
   emergency `#b3261e`, contrast test parses tokens from `globals.css`.
4. Pulled the old app's home screen from `medical-triage` (copy verbatim from
   its i18n, structure adapted: live Continue card, nearby facilities,
   health-worker link → CHP).
5. Opened PR #2, user merged it (merge commit `46b1c47`). 66 tests, four green
   gates, real-browser journeys in both languages at every step.
6. Published the interactive walkthrough artifact (same URL across updates):
   https://claude.ai/code/artifact/8f8aa136-5685-4cc5-ab82-08b0e229d2ff
7. Set up this vault + CLAUDE.md protocol + SessionStart hook.

## Gotchas worth remembering

- The environment's git proxy only accepts pushes to the designated branch —
  tag pushes fail ("remote end hung up"). Don't fight it.
- `@vitejs/plugin-react@6` needs vite 8; vitest 3 bundles vite 7 → pin
  `@vitejs/plugin-react@^5`.
- Playwright: use `/opt/pw-browsers/chromium`, `createRequire` against the
  repo's package.json when scripts live outside it; CSS `::before` glyphs join
  a button's accessible name (breaks `exact: true`).
- localStorage schema changes → bump the storage key (`tunza.v2.care`).
- After a PR merges, restart the work branch from `origin/main` — never stack
  on merged history.
