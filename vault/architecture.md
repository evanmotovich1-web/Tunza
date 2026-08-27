# Architecture

One Next.js App Router app (v16, React 19, Tailwind 4, Vitest). Everything in
v1 is client-side and deterministic — no backend yet.

## Load-bearing modules

- `lib/copy.ts` — every user-visible string, EN + SW, one typed table.
  `sw` is `Record<CopyKey, string>`, so a missing translation is a compile
  error. `t(key, locale)` requires an explicit locale. Templates use `{f}`,
  `{m}`, `{who}` via `fill()`.
- `lib/referral.ts` — the canonical lifecycle from the README:
  `created → sent → received → accepted → patient_moving → arrived → seen →
  completed → outcome_returned`. `describeReferral(role, referral, kind,
  locale)` is the ONE place referral state becomes words: (state × role ×
  language) → headline, status, stage label, and a **semantic action id**
  (never matched by button text). Outcomes are codes.
- `lib/assessment.ts` — deterministic demo triage rules (conservative, hears
  EN + SW danger keywords, abstains via `need_one_more_answer`). Emits copy
  keys, not sentences. **Not clinically validated** — the README's
  deterministic safety layer replaces this before real use.
- `lib/store.tsx` — reducer + context; state: role, locale, view
  (household home/path/nearby), injectedFailures, encounter, referral, online.
  Persists to localStorage `tunza.v2.care`.
- `lib/failures.ts` — `warningCopy(named, locale)`: eyebrow/title/body for the
  six failure states + danger/watch.
- `components/` — the seven contract components + HomeScreen, NearbyFacilities,
  CareShell, DemoChrome (demo harness: role switcher, failure injection,
  language toggle, start over; wordmark navigates home for household).
- `lib/voice.ts` — one tap-to-speak path with a designed degrade chain:
  server Whisper (`/api/transcribe`, needs `OPENAI_API_KEY`) → on-device
  SpeechRecognition (`lib/speech.ts`) → "type instead" message. Capability
  probed via GET `/api/transcribe` (cached).
- `lib/places.ts` + `lib/geohash.ts` + `app/api/facilities` — real nearby
  facilities (Google Places New, needs `GOOGLE_PLACES_API_KEY`), ported from
  the old app's privacy pattern: precise coords never leave the device; the
  stateless proxy sees only the precision-5 geohash cell center; distances
  ranked client-side. Nearby view falls back to the demo list with an honest
  note on any failure (no geolocation, denied, unanswered prompt via a 12s
  watchdog, offline, 503-unconfigured, zero results).
- `.env.example` — `OPENAI_API_KEY`, `GOOGLE_PLACES_API_KEY`; both optional,
  everything degrades by design without them. The repo is PUBLIC: keys live
  only in `.env.local` / deploy env, never committed.

## Quality gates (all must pass before any push)

`npx tsc --noEmit` · `npm test` (66) · `npm run lint` · `npm run build`

Tests include: copy parity + placeholder equality, canonical lifecycle,
locked per-role phrases in both languages, component renders in both
languages, and `tests/contrast.test.ts` which parses `globals.css` tokens and
enforces WCAG pairs plus the two-red luminance split.

## Verification habit

Big UI changes get a real-browser pass: Playwright-core (temp devDependency,
uninstalled before commit) driving Chromium at `/opt/pw-browsers/chromium`
through the full journey in both languages. Scripts live in the session
scratchpad, not the repo.

## The old app (`evanmotovich1-web/medical-triage`, private)

Next 14 + Supabase + Anthropic triage + Whisper voice + Google Places +
web push. Source of ports (home screen already taken). Its i18n table
(`lib/i18n.ts`) is the reference for existing EN/SW copy.
