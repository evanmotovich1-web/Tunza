# Design system

Tokens live in `app/globals.css` (`@theme`); `tests/contrast.test.ts` parses
them and enforces the rules mechanically. No raw hex or px in components.

## Color — matte red on warm paper

| Token | Value | Role |
|---|---|---|
| `--action` | `#7c1f18` | Tunza Red — brand + the one primary action, wordmark, focus |
| `--brand-deep` | `#4a1210` | Home screen ground only |
| `--urgent` | `#b3261e` | Emergencies only: Go now, danger signs (text + tinted panels, never a button fill) |
| `--today` | `#8a4b12` | Get care today (soft `#f6e6d0`) |
| `--watch` | `#1d4a73` | Monitor at home — calm blue, deliberately not green (soft `#e3eef7`) |
| `--warn` | `#7a4e0b` | Degraded states (soft `#f7edd6`) |
| ink `#1c1916` · ink-soft `#5c564c` · ground `#e8e0d2` · paper `#f4efe6` · raised `#fffcf7` · line `#e2d8c8` | | |

**Two-red discipline** (research-verified pattern — Stanford Cardinal vs
Digital red; USWDS theme-vs-state tokens; UCSF/OSHA severity tiers): the dark
matte red is identity/action; the emergency red is distinctly brighter (≥1.5×
luminance, test-enforced) and appears only on danger decisions/status. They
never swap roles. "Matte" in flat UI = low lightness, not desaturation.

**Kenya constraint**: the red cross emblem is criminally protected (Act No. 29
of 1965 + Geneva Conventions law). No cross motifs; never a saturated
red-on-white lockup.

**The front door wears the brand** (home screen: brand-deep → action gradient,
inverted raised CTA with brand text); every working screen wears paper.

## Type

Inter (Google Fonts, weights 400/500/600/700), fallback Roboto → system sans.
Five steps only: decision 28/34 · heading 20/26 · body 16/24 · label 14/18 ·
caption 12/16. **700 is reserved for the one thing a screen exists to say.**
Tabular numerals on anything clinical (times, vitals, countdowns).

## Layout

Single column, decision at top, one full-width primary action, 48px targets,
one radius (1rem), minimal motion, status never by color alone (always words),
every string in EN and SW (compile-enforced in `lib/copy.ts`).
