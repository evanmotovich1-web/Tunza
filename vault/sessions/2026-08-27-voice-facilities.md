# 2026-08-27 — Voice and real facilities, ported from the old app

## What happened

1. Ported `/api/transcribe` (Whisper) and `/api/facilities` (Google Places
   New, stateless location-blind proxy) from `medical-triage`, with the old
   privacy pattern intact: only the precision-5 geohash cell center reaches
   the server; distances computed client-side from precise coords.
2. New `lib/voice.ts`: one tap-to-speak with the degrade chain server Whisper
   → on-device SpeechRecognition → "type instead". `lib/geohash.ts` is now
   self-contained (no ngeohash dependency).
3. Nearby view (`components/NearbyFacilities.tsx`) shows real ranked places
   (name, category, distance, address) and falls back to the demo list with
   an honest note on every failure path.
4. FacilityCard extended: optional `distanceKm` + `address` alongside the demo
   `travelMinutes` + `services`.
5. `.env.example` documents both optional keys; `.gitignore` un-ignores it.
6. 84 tests including direct route-handler tests (400/413/503 paths) and
   ported haversine/place-type/geohash suites. Verified in Chromium: granted
   geo + no key → fallback; denied geo → fallback; voice → type-instead;
   assessment regression.

## Bugs found while porting (both pre-existing patterns)

- The "speak isn't available, type instead" message rendered only inside the
  speak pane, but the fallback switches to the type pane — it was never
  visible. Moved above the pane tabs.
- Geolocation's `timeout` option does not run while the permission prompt is
  unanswered → "locating" could hang forever. Added a 12s watchdog →
  fallback.

## Gotchas

- Headless Chromium's SpeechRecognition neither errors nor ends — a bad test
  oracle. Delete it via `addInitScript` to test the degrade chain
  deterministically.
- Route handlers return plain `Response.json` (no `next/server` import) so
  vitest can call GET/POST directly with `new Request(...)`.
- Repo is public: never commit keys; routes answer 503 when unconfigured and
  every client path treats non-OK as "fall back by design".
