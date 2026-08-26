# Tunza Vault

The project's second brain. Every Claude Code session reads this at start (a
SessionStart hook prints this index and the latest session note) and writes
back before finishing meaningful work. Pages are short, dated, and factual —
a wiki, not a diary.

## Protocol

- **Read**: this index arrives automatically; open the pages your task touches.
- **Write**: before ending a session that changed anything, (1) update the
  affected pages below, and (2) add a dated note to `vault/sessions/`.
- **Never store**: secrets, credentials, patient data, or personal data.

## Map

| Page | What it holds |
|---|---|
| [product.md](product.md) | The one idea, the three surfaces, the four verdicts |
| [design-system.md](design-system.md) | Tokens, the two-red discipline, type scale, research anchors |
| [architecture.md](architecture.md) | Modules, the referral machine, the copy layer, quality gates |
| [decisions.md](decisions.md) | Dated decision log, with the why |
| [backlog.md](backlog.md) | What's next, including ports from the old app |
| [sessions/](sessions/) | One dated note per working session |

## Current state (update when it changes)

- **Prototype one is merged to `main`** (PR #2, 2026-08-26): one Next.js app,
  household/CHP/facility surfaces, EN/SW throughout, matte red finish, the old
  app's home screen as the landing. 66 tests, four green gates.
- Interactive walkthrough artifact:
  https://claude.ai/code/artifact/8f8aa136-5685-4cc5-ab82-08b0e229d2ff
- The earlier production app lives in `evanmotovich1-web/medical-triage`
  (private) — the source for ports; read-only.
