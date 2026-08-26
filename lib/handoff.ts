import type { AssessmentAnswers, DecisionKind } from "./types";

export type HandoffFact = {
  label: string;
  value: string;
  freshness?: string;
  stale?: boolean;
};

export function handoffFacts(
  answers: AssessmentAnswers,
  stale: boolean,
  assessedAt: string,
): HandoffFact[] {
  const freshness = stale ? "recorded 8 months ago" : relativeMinutes(assessedAt);
  const facts: HandoffFact[] = [
    { label: "Who", value: whoValue(answers) },
    {
      label: "What they described",
      value: answers.presentation.trim() || (answers.photoAttached ? "Photo only (demo)" : "Not described"),
    },
    { label: "Awake", value: labelOrUnknown(answers.awake) },
    { label: "Breathing", value: labelOrUnknown(answers.breathing) },
    { label: "Drinking", value: labelOrUnknown(answers.drinking) },
    { label: "How long", value: labelOrUnknown(answers.duration) },
    {
      label: "Temperature (demo)",
      value: "38.6 C",
      freshness,
      stale,
    },
  ];
  return facts;
}

export function whyComing(
  answers: AssessmentAnswers,
  decisionKind: DecisionKind | null,
): string {
  const who =
    answers.who === "child"
      ? "A child from a demo household"
      : answers.who === "self"
        ? "An adult (self) from a demo household"
        : "A person from a demo household";
  if (decisionKind === "go_now") {
    return `${who} needs urgent care. Danger signs were flagged in the community assessment.`;
  }
  if (decisionKind === "get_care_today") {
    return `${who} should be seen today. This is not a wait-at-home case.`;
  }
  return `${who} is on a Tunza referral.`;
}

function whoValue(answers: AssessmentAnswers): string {
  switch (answers.who) {
    case "self":
      return "Adult (self) · demo household";
    case "household_adult":
      return "Adult · demo household";
    case "child":
      return "Child · demo household";
    default:
      return "Not specified · demo household";
  }
}

function labelOrUnknown(value: string | null): string {
  if (!value || value === "unknown") {
    return "Unknown";
  }
  return value.replaceAll("_", " ");
}

function relativeMinutes(iso: string): string {
  const then = new Date(iso).getTime();
  const mins = Math.max(1, Math.round((Date.now() - then) / 60000));
  return `assessed ${mins} min ago`;
}
