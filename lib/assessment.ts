import type {
  AssessmentAnswers,
  Decision,
  DecisionKind,
  QuestionId,
} from "./types";

export const EMPTY_ANSWERS: AssessmentAnswers = {
  who: null,
  presentation: "",
  photoAttached: false,
  awake: null,
  breathing: null,
  drinking: null,
  duration: null,
  mainProblem: null,
};

export const QUESTION_ORDER: QuestionId[] = [
  "who",
  "what",
  "awake",
  "breathing",
  "drinking",
  "duration",
  "main_problem",
];

const DANGER_PATTERNS: { re: RegExp; label: string }[] = [
  { re: /unconscious|not waking|won'?t wake/, label: "Not waking" },
  { re: /seizure|convulsion|fitting/, label: "Seizure" },
  { re: /not breathing|stopped breathing/, label: "Not breathing" },
  { re: /blue lips|blue face/, label: "Blue lips" },
  {
    re: /bleeding (a lot|heavily|won'?t stop)|heavy bleeding/,
    label: "Heavy bleeding",
  },
];

export function presentationDangerSigns(text: string): string[] {
  const lower = text.toLowerCase();
  return DANGER_PATTERNS.filter((item) => item.re.test(lower)).map(
    (item) => item.label,
  );
}

export function hasFever(text: string): boolean {
  return /fever|hot body|temperature|homa/.test(text.toLowerCase());
}

export function hasInjury(text: string): boolean {
  return /wound|cut|bleed|injury|burn|fall|ajali/.test(text.toLowerCase());
}

function tooIncomplete(answers: AssessmentAnswers): boolean {
  const critical = [answers.awake, answers.breathing, answers.drinking];
  const unknownCount = critical.filter(
    (value) => value === "unknown" || value === null,
  ).length;
  const noStory = answers.presentation.trim().length === 0 && !answers.photoAttached;
  return unknownCount >= 2 && noStory;
}

function confidentHomeWatch(answers: AssessmentAnswers): boolean {
  return (
    answers.awake === "alert" &&
    answers.breathing === "fine" &&
    answers.drinking === "yes"
  );
}

export function decide(answers: AssessmentAnswers): Decision {
  const dangerSigns: string[] = [...presentationDangerSigns(answers.presentation)];
  const reasons: string[] = [];
  const watchSigns = [
    "Not waking or very sleepy",
    "Breathing gets hard or fast",
    "Cannot drink",
    "Seizure or heavy bleeding",
  ];

  if (answers.awake === "not_waking") {
    dangerSigns.push("Not waking");
  }
  if (answers.breathing === "severe") {
    dangerSigns.push("Struggling to breathe");
  }
  if (answers.drinking === "no" && answers.who === "child") {
    dangerSigns.push("Child cannot drink");
  }
  if (answers.mainProblem === "injury" && hasInjury(answers.presentation)) {
    if (/heavy|won'?t stop|a lot/.test(answers.presentation.toLowerCase())) {
      dangerSigns.push("Heavy bleeding");
    }
  }

  const uniqueDanger = [...new Set(dangerSigns)];

  if (uniqueDanger.length > 0) {
    return {
      kind: "go_now",
      reasons: uniqueDanger.map((sign) => `Danger sign: ${sign}`),
      dangerSigns: uniqueDanger,
      watchSigns,
    };
  }

  if (answers.breathing === "difficult" && answers.awake === "sleepy") {
    reasons.push("Sleepy and breathing is hard");
    return {
      kind: "go_now",
      reasons,
      dangerSigns: uniqueDanger,
      watchSigns,
    };
  }

  if (tooIncomplete(answers) && answers.mainProblem !== null) {
    return {
      kind: "need_one_more_answer",
      reasons: ["Too little is known to choose safely"],
      dangerSigns: uniqueDanger,
      watchSigns,
    };
  }

  if (tooIncomplete(answers) && answers.duration !== null) {
    return {
      kind: "need_one_more_answer",
      reasons: ["One more question would make this safer"],
      dangerSigns: uniqueDanger,
      watchSigns,
    };
  }

  let kind: DecisionKind = "monitor_at_home";

  if (answers.breathing === "difficult") {
    kind = "get_care_today";
    reasons.push("Breathing is harder than usual");
  }
  if (answers.drinking === "little") {
    kind = "get_care_today";
    reasons.push("Drinking only a little");
  }
  if (answers.drinking === "no") {
    kind = "get_care_today";
    reasons.push("Not drinking");
  }
  if (answers.awake === "sleepy") {
    kind = "get_care_today";
    reasons.push("Sleepy or harder to wake");
  }
  if (answers.who === "child" && hasFever(answers.presentation)) {
    kind = "get_care_today";
    reasons.push("Child with fever");
  }
  if (answers.mainProblem === "fever" && answers.who === "child") {
    kind = "get_care_today";
    reasons.push("Child with fever");
  }
  if (answers.mainProblem === "injury") {
    kind = "get_care_today";
    reasons.push("Injury that should be seen");
  }
  if (answers.mainProblem === "breathing") {
    kind = "get_care_today";
    reasons.push("Breathing is the main problem");
  }
  if (
    answers.duration === "longer" &&
    (hasFever(answers.presentation) || answers.mainProblem === "fever")
  ) {
    kind = "get_care_today";
    reasons.push("This has gone on too long to only watch at home");
  }

  if (kind === "monitor_at_home") {
    if (!confidentHomeWatch(answers) && answers.mainProblem === null) {
      return {
        kind: "need_one_more_answer",
        reasons: ["One more question would make this safer"],
        dangerSigns: uniqueDanger,
        watchSigns,
      };
    }
    if (!confidentHomeWatch(answers) && tooIncomplete(answers)) {
      return {
        kind: "need_one_more_answer",
        reasons: ["Too little is known to choose safely"],
        dangerSigns: uniqueDanger,
        watchSigns,
      };
    }
    reasons.push("Awake, drinking, and breathing do not show a danger sign");
  }

  return {
    kind,
    reasons: [...new Set(reasons)],
    dangerSigns: uniqueDanger,
    watchSigns,
  };
}

export function shouldStopForDecision(
  answers: AssessmentAnswers,
  lastAsked: QuestionId,
): boolean {
  const decision = decide(answers);

  if (lastAsked === "what" && decision.kind === "go_now") {
    return true;
  }
  if (lastAsked === "awake" && answers.awake === "not_waking") {
    return true;
  }
  if (lastAsked === "breathing" && answers.breathing === "severe") {
    return true;
  }
  if (
    lastAsked === "drinking" &&
    answers.drinking === "no" &&
    answers.who === "child"
  ) {
    return true;
  }
  if (lastAsked === "duration") {
    return true;
  }
  if (lastAsked === "main_problem") {
    return true;
  }
  return false;
}

export function nextQuestion(
  answers: AssessmentAnswers,
  lastAsked: QuestionId,
): QuestionId | null {
  if (shouldStopForDecision(answers, lastAsked)) {
    return null;
  }

  switch (lastAsked) {
    case "who":
      return "what";
    case "what":
      return "awake";
    case "awake":
      return "breathing";
    case "breathing":
      return "drinking";
    case "drinking":
      return "duration";
    case "duration":
      return "main_problem";
    case "main_problem":
      return null;
  }
}

export function applyAnswer(
  answers: AssessmentAnswers,
  question: QuestionId,
  value: string,
): AssessmentAnswers {
  const next = { ...answers };
  switch (question) {
    case "who":
      next.who = value as AssessmentAnswers["who"];
      break;
    case "what":
      next.presentation = value;
      break;
    case "awake":
      next.awake = value as AssessmentAnswers["awake"];
      break;
    case "breathing":
      next.breathing = value as AssessmentAnswers["breathing"];
      break;
    case "drinking":
      next.drinking = value as AssessmentAnswers["drinking"];
      break;
    case "duration":
      next.duration = value as AssessmentAnswers["duration"];
      break;
    case "main_problem":
      next.mainProblem = value as AssessmentAnswers["mainProblem"];
      break;
  }
  return next;
}

export type MissingItem = {
  id: string;
  label: string;
  detail?: string;
};

export function missingInfo(
  answers: AssessmentAnswers,
  askMore: string | null,
): MissingItem[] {
  const items: MissingItem[] = [];

  if (!answers.who || answers.who === "unknown") {
    items.push({
      id: "who",
      label: "Who this is for is not clear",
      detail: "Child, adult, or self changes what we ask next.",
    });
  }
  if (!answers.presentation.trim() && !answers.photoAttached) {
    items.push({
      id: "what",
      label: "What is happening was not described",
    });
  }
  if (!answers.awake || answers.awake === "unknown") {
    items.push({ id: "awake", label: "Awake and responding is unknown" });
  }
  if (!answers.breathing || answers.breathing === "unknown") {
    items.push({ id: "breathing", label: "Breathing is unknown" });
  }
  if (!answers.drinking || answers.drinking === "unknown") {
    items.push({ id: "drinking", label: "Whether they can drink is unknown" });
  }
  if (askMore) {
    items.push({
      id: "ask-more",
      label: askMore,
      detail: "The facility asked for this before accepting.",
    });
  }
  return items;
}

export function personLabel(who: AssessmentAnswers["who"]): string {
  switch (who) {
    case "self":
      return "Adult (self)";
    case "household_adult":
      return "Adult in the household";
    case "child":
      return "Child in the household";
    default:
      return "Person not specified";
  }
}
