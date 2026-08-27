# Tunza design

One obvious next action.

This document is the design contract for the Tunza product. It sits beside the README: the README describes what the system is; this describes what a person holding a phone actually experiences, and the rules that keep that experience simple while the system underneath grows.

The whole product is designed around one idea:

At every moment, Tunza should make the next action obvious.

Complexity is allowed to live underneath Tunza. The person using it should never feel that complexity.

⸻

The test every screen must pass

Every screen answers one question:

What do I do next?

Each screen gets one dominant answer to that question. One primary action, one clear status, and secondary information only when someone asks for it.

If a screen ends up with five equally important buttons, the problem is not layout. It means a product decision underneath the screen has not been resolved. Resolve the decision, then design the screen.

This is the review question for every screen, in every role, in every state — including the failure states.

⸻

One foundation, three surfaces

Tunza is not three frontends.

The household, the Community Health Promoter, and the receiving facility are looking at the same care path from different angles. If we build them separately, one interface will eventually say a referral is accepted while another still thinks it is pending; translations will drift; offline behavior will be implemented three different ways; and every new workflow will be built three times.

So the structure is:

one shared system underneath
        │
        ├── Household surface
        ├── CHP surface
        └── Facility surface

Three very calculated surfaces on top of one foundation.

Each surface exists to do a small number of jobs:

Household
  tell Tunza what is wrong;
  answer the few questions that actually matter;
  understand what to do;
  get to the right care if necessary.

CHP
  start or continue an encounter;
  collect missing information;
  see what requires action;
  create or follow the referral;
  know who needs follow-up.

Facility / clinician
  understand why this person is coming before they arrive;
  decide whether we can handle them;
  accept, redirect, or ask for more information;
  return what happened.

Three views of the same journey. Anything that appears on more than one surface is the same component underneath.

⸻

The household journey

Start with almost nothing.

1. Who needs help?

Me. My child. Someone else. Nothing else on the screen.

2. What's happening?

Three natural ways to answer: speak, type, or add a photo when it is relevant. No form. No menu of body parts.

3. One question at a time.

This is not a chat interface and it is not a medical form. Each step is:

  a clear question;
  a small set of significant choices;
  an obvious "I don't know";
  the ability to speak the answer where useful.

The interaction should feel controlled and intentional. Every question appears because it changes the outcome — never because it makes the product look medically impressive. The missing-information check in the clinical core decides what to ask next; the UI only ever shows one question.

"I don't know" is a first-class answer, not a failure. The system is allowed to say it does not have enough information (see the README: forced certainty is a defect).

4. The answer.

Radically simpler than symptom-checker output. The top of the screen says one of:

  Go now.
  Get care today.
  Monitor at home for now.
  I need one more answer before I can safely tell you.

Everything else — reasoning, warning signs, what to watch for — sits underneath that. Warning signs appear on every assessment, but they support the decision; they do not compete with it.

5. The transformation.

If the person needs care, the UI fundamentally changes. It stops being an assessment and becomes a care path: where to go, how the facility responded, what to bring, what happens next. This is the moment Tunza stops resembling a symptom checker, and it should look like it.

⸻

The referral is the spine

There is one authoritative referral object, and it moves through the lifecycle the README defines:

CREATED → SENT → RECEIVED → ACCEPTED → PATIENT_MOVING → ARRIVED → SEEN → COMPLETED → OUTCOME_RETURNED

with named failures (NO_ACKNOWLEDGEMENT, WRONG_CARE_LEVEL, SERVICE_UNAVAILABLE, CAPACITY_UNAVAILABLE, TRANSPORT_FAILURE, PATIENT_DECLINED, REFERRED_ONWARD, LOST_TO_FOLLOWUP).

The UI never invents state and never stores its own copy of it. It translates the canonical state into whatever is relevant to the person looking at it.

The same event, three presentations:

  referral.accepted

  Household   "Facility accepted — you can leave now."
  CHP         "Referral accepted — patient travel not yet confirmed."
  Facility    "Incoming urgent referral — expected arrival 42 min."

That translation lives in exactly one place in the codebase: a single module that maps (referral state × role × language) to presentation. No surface hand-writes its own referral copy. That is how the three surfaces stay honest with each other, and how English and Kiswahili stay in step.

The internal state names never appear on screen.

⸻

The component set

v1 is built from a very small set of reusable components. Every role, every screen, is assembled from these:

1. Assessment Question
   One question, significant choices, obvious "I don't know", optional voice answer. Used by household and CHP.

2. Decision / Result
   The verdict at the top, support underneath. Household sees the plain-language version; CHP sees the same decision with clinical context.

3. Warning State
   The signs that change everything. Present on every assessment, styled to inform, not to alarm decoratively.

4. Referral Status
   The current state of the one referral object, translated for the viewer. The same component on all three surfaces.

5. Facility Card
   Where to go and why this facility: capability, distance, response. Selection, not browsing.

6. Attention Needed Card
   The unit of the CHP and facility work lists. One person, one reason they need attention, one action.

7. Patient Handoff View
   What the facility sees before and at arrival: why this person is coming, what is already known, what is missing.

No screen gets a custom one-off component until it has failed to be built from these. This is also how the product compounds: improve the referral component once, and every role benefits from the same improvement.

⸻

Failure is a designed state

The failure states get the same design attention as the happy path, because in the environments Tunza serves they are normal states, not exceptions:

  Offline               "Saved on this phone. It will send when the connection returns." The safety path still works.
  Weak connection       Sending in the background; the person is never blocked on a spinner to be safe.
  No facility response  Time-boxed. Then: what to do instead, stated plainly.
  Redirected            The new destination is the dominant information, with the reason underneath.
  Stale information     Values carry their age ("measured 8 minutes ago"). Old data is shown as old, never as live.
  Incomplete assessment "I need one more answer before I can safely tell you" — a state, not an error.

No generic error screens. Every failure state answers the same question as every other screen: what do I do next?

⸻

Type

One typeface: Inter (variable).

It is extremely readable on small screens, has a high x-height, clear numerals for vitals and times, handles our languages cleanly, and the variable file means we do not ship a stack of separate weights.

  font-family: "InterVariable", Inter, Roboto, system-ui, sans-serif;

The fallback is designed, not accidental: if the font fails to load, or we choose not to load it in a constrained environment, Android falls to Roboto and nothing looks broken.

Weights:

  400  supporting text
  500  labels
  600  actions and status
  700  the major decision only

If everything is bold, nothing is. 700 is reserved for the one thing the screen exists to say.

Anything clinical — vitals, travel time, countdowns, expected arrival — uses tabular numerals (font-variant-numeric: tabular-nums) so values do not visually jump as they update.

Type scale, five steps, nothing else:

  decision   28 / 34   700
  heading    20 / 26   600
  body       16 / 24   400
  label      14 / 18   500
  caption    12 / 16   400   provenance, freshness, legal

No second decorative typeface in the app. If Tunza wants a more ownable brand feel, that lives in the wordmark and the marketing site. The product stays stable and readable.

⸻

Color

Tunza's finish is matte red on warm paper.

Not alarm red. A dark, low-lightness oxblood — the "matte" in a flat interface comes from darkness, not gloss or texture — sitting on cream, the way institutions that live on a dark red do (Stanford's whole identity runs on Cardinal #8C1515). The app should feel like a considered object, not a hospital form.

Because this is a health product, the red is carried under a strict two-red discipline, the documented pattern for red brands that also raise alarms (Stanford splits Cardinal from its brighter Digital red for interaction; USWDS separates brand theme tokens from reserved state tokens; clinical-alert guidance reserves red for the top severity tier only, so alarm fatigue never sets in):

  the BRAND red is dark and matte, and it is the action role — filled surfaces only:
  the one primary button, the wordmark, focus and selection;

  the EMERGENCY red is distinctly brighter and more saturated, and appears only
  as text and tinted panels on danger decisions and status — never as a filled
  button, never as chrome;

  the two never swap roles, and the split is enforced by test, not convention.

  --action       #7c1f18   Tunza Red. The matte brand red; the one
                           primary action, the wordmark, focus.
  --brand-deep   #4a1210   The deep end of the brand red — the home
                           screen's ground, nothing else.
  --urgent       #b3261e   Emergencies only. Go now, danger signs.  (soft: #f8e4df)
  --today        #8a4b12   Get care today. Time-boxed.              (soft: #f6e6d0)
  --watch        #1d4a73   Monitor at home. Watch states.           (soft: #e3eef7)
  --warn         #7a4e0b   Degraded states: offline, weak,          (soft: #f7edd6)
                           stale, incomplete.
  --ink          #1c1916   primary text
  --ink-soft     #5c564c   supporting text
  --line         #e2d8c8   borders, dividers
  --ground       #e8e0d2   page ground behind the column
  --paper        #f4efe6   the app surface
  --raised       #fffcf7   cards, inputs

The front door wears the brand; every working screen wears paper. The household home screen — carried over from the earlier Tunza app's landing — is the one full-brand surface, and it is full-screen: the ground, the header chrome, and the footer all wear the red (brand-deep to Tunza Red), with the wordmark and controls in white on it. On it: the tagline, one inverted primary action (raised surface, brand-red text), quiet frosted cards for the secondary paths, and the mission line. The moment work begins, the product returns to paper, and red returns to being scarce.

The monitor-at-home verdict stays calm blue, and doubly so now: red–green is the most impaired axis of human color vision, and with red carrying the brand there is no green in the product to be confused with. Amber for "today" and "degraded" follows the same severity ladder clinical alerting uses (red above orange above yellow).

Two constraints specific to where Tunza lives:

  the red cross emblem is criminally protected in Kenya (Act No. 29 of 1965 and
  Geneva Conventions law) — no cross motifs anywhere, and the brand red never
  appears as a saturated red-on-white lockup; it lives dark, on warm cream;

  emergency meaning never rides on color alone — every urgent state carries its
  words, in both languages, exactly as SC 1.4.1 requires.

Rules:

  the emergency red appears only on danger decisions and status — never as decoration, never as a button fill;
  one action color, used by exactly one element per screen — red stays scarce even as the brand;
  every text pairing at WCAG AA minimum against cream (a stricter test than white), aimed at cheap screens in sunlight — verified in tests/contrast.test.ts, which also asserts the emergency red stays at least 1.5× brighter than the brand red;
  status is never communicated by color alone — always color plus words;
  no raw hex in components — every color goes through these tokens.

⸻

Layout

  a single column; content in reading order; the decision at the top;
  one primary action per screen — full width, anchored at the bottom, reachable with a thumb;
  minimum touch target 48px;
  spacing on a 4px grid, using a small fixed set (4, 8, 12, 16, 24, 32);
  one corner radius (12px) everywhere;
  secondary information behind one tap ("More" / expandable), never competing with the decision;
  motion minimal — state changes announce themselves with a quiet transition, nothing celebratory.

Language rules are layout rules here: sentence case, plain words, second person. Every string exists in English and Kiswahili from day one, and a screen is not finished until the decision fits at 700 in both languages.

⸻

How this maps to the build

One Next.js app (the existing stack: App Router, TypeScript, Tailwind, Supabase). Role determines the surface; the foundation is shared.

  tokens        Tailwind theme: the colors, type scale, spacing, radius above. No raw hex or px in components.
  components    the seven components, each implemented with all of its states — including failure and offline states — and tested in both languages.
  translation   one module: (referral state × role × language) → presentation. The only place referral copy exists. The copy table is typed so that a missing Kiswahili string is a compile error, not a runtime fallback.
  surfaces      household, CHP, facility — thin compositions of the seven components over the same data.

Build order for v1:

  1. tokens and type;
  2. Assessment Question + Decision/Result — the household path end to end;
  3. Referral Status + Facility Card — the care-path transformation;
  4. Attention Needed Card — the CHP surface;
  5. Patient Handoff View — the facility surface;
  6. failure states across all of it, treated as part of each step, not an afterthought.

Vitest covers component states the same way it covers logic: every component renders every state it claims to support, in both languages, before it ships.

⸻

What this design refuses to do

  a chat interface for assessment;
  more than one question on screen at a time;
  more than one primary action on a screen;
  referral state stored or invented by a surface;
  urgency color used decoratively;
  a second typeface in the product;
  a generic error screen;
  a screen shipped in one language;
  a new component while an existing one would do.

The objective, restated from the README in design terms:

make the next action obvious, make the path into care legible, and make the same referral tell the truth to everyone looking at it.
