# Product

The one idea: **at every moment, Tunza makes the next action obvious.**
Complexity lives underneath; the person using it never feels it. Full contract
in `DESIGN.md`; system thesis in `README.md`.

## One foundation, three surfaces

Household, CHP, and facility are three views of the same care path — never
three frontends. Shared referral truth, shared translations, shared offline
behavior.

- **Household**: say what's wrong → answer the few questions that matter →
  understand what to do → get to the right care.
- **CHP**: start/continue an encounter → collect missing info → see what needs
  action → create/follow the referral → know who needs follow-up.
- **Facility**: know why this person is coming before arrival → accept,
  redirect, or ask for one missing fact → return what happened.

## The household journey

Home (brand landing, from the old app) → Who needs help? → What's happening?
(speak / type / photo) → one question at a time (significant choices, an
obvious "I don't know") → one of four verdicts → if care is needed, the UI
transforms from assessment into a care path.

## The four verdicts

Go now · Get care today · Monitor at home · I need one more answer
(abstention is a first-class outcome — forced certainty is a defect).

## The seven components

Assessment Question, Decision/Result, Warning State, Referral Status,
Facility Card, Attention Needed Card, Patient Handoff View. Screens are
assembled from these; no new component until a screen has failed to be built
from them.

## Failure is a designed state

offline · weak connection · no facility response · redirected · stale
information · incomplete assessment — each has a name, words, and a next
action. No generic error screens, ever.
