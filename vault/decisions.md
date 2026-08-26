# Decisions

Dated, newest first. Each entry: what was decided, and why it holds.

## 2026-08-26 — The front door wears the brand
The household landing is the old app's home screen rebuilt in the matte
finish — the ONE full-brand surface (`--brand-deep` → `--action`). Everything
after it wears paper, keeping red scarce. Old copy reused verbatim from
`medical-triage/lib/i18n.ts`; History slot became a live Continue card fed by
the referral machine; "Are you a doctor?" became "Are you a health worker?" →
CHP surface.

## 2026-08-26 — Two reds, one discipline (matte red finish)
Brand/action = dark oxblood `#7c1f18`; emergency = brighter `#b3261e`, ≥1.5×
luminance apart (test-enforced), same warm hue family. Verified precedents:
Stanford Cardinal vs Digital red split, USWDS theme-vs-state token roles,
UCSF/OSHA "red = top severity tier only". Green left the product entirely.
Emergency red never fills a button; brand red never marks danger.

## 2026-08-26 — Monitor verdict is watch-blue, not green
"Stay home" must read as "keep watching", never "all clear" — and red–green
is the most impaired color-vision axis. Doubly right once red became brand.

## 2026-08-26 — Canonical referral states win
The README's lifecycle (with `seen`, `patient_moving`) replaced the ad-hoc
`prepared/traveling` set from the first bot build. Internal names never
appear on screen; `describeReferral` is the single translation point and
returns semantic action ids (English-label dispatch was a latent i18n bug).

## 2026-08-26 — Language is compile-enforced
`sw: Record<CopyKey, string>` + `t(key, locale)` with required locale: a
screen cannot ship in one language by accident. Decisions carry copy keys so
language applies at render, not at decision time.

## 2026-08-26 — One codebase, not parallel builds
The Cursor agent's v1 was merged into the contract branch and aligned, rather
than building a rival — per the contract's own "one foundation" rule.
