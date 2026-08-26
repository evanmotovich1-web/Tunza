# Backlog

What's next, roughly in order of value. Check `README.md` "Engineering
priorities" for the system-level list; this is the working cut.

## Ports from the old app (`medical-triage`) — through the contract filter

- **Voice transcription route** (`app/api/transcribe`, Whisper): replaces the
  browser SpeechRecognition fallback with a real path; keep the designed
  degrade when offline.
- **Facility discovery** (Google Places + geohash): replaces `DEMO_FACILITIES`
  behind the same FacilityCard; keep capability-aware selection, not nearest-first.
- **Case history**: the home Continue card generalizes into "your past cases";
  needs the privacy projections from the README (cases vs case_signals).
- **Clinician verification + dashboard** (`app/doctor`): becomes the real
  facility surface identity story.
- **PWA bits** (manifest, service worker, web push): offline-first for real.

## Contract work

- Deterministic clinical safety layer to replace the demo rules in
  `lib/assessment.ts` (clinical review required before any real use).
- Referral event log UI (history entries exist on the object; nothing renders
  them yet).
- Supabase persistence + the EncounterContext boundary from the README.

## Hygiene

- `cursor/tunza-v1-care-path-8fc8` branch is fully merged — can be deleted on
  GitHub.
- `prototype-1` git tag exists only locally in an old session (tag pushes are
  blocked by the environment's git proxy); recreate from GitHub UI if wanted.
