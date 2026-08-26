import { fill, t, type CopyKey, type Locale } from "./copy";
import type { AssessmentAnswers, DecisionKind } from "./types";

export type HandoffFact = {
  label: string;
  value: string;
  freshness?: string;
  stale?: boolean;
};

const AWAKE_KEY: Record<string, CopyKey> = {
  alert: "awakeAlert",
  sleepy: "awakeSleepy",
  not_waking: "awakeNotWaking",
};

const BREATHING_KEY: Record<string, CopyKey> = {
  fine: "breathingFine",
  difficult: "breathingDifficult",
  severe: "breathingSevere",
};

const DRINKING_KEY: Record<string, CopyKey> = {
  yes: "drinkingYes",
  little: "drinkingLittle",
  no: "drinkingNo",
};

const DURATION_KEY: Record<string, CopyKey> = {
  today: "durationToday",
  two_days: "durationTwoDays",
  longer: "durationLonger",
};

function answerLabel(
  value: string | null,
  table: Record<string, CopyKey>,
  locale: Locale,
): string {
  if (!value || !(value in table)) {
    return t("unknownValue", locale);
  }
  return t(table[value], locale);
}

export function handoffFacts(
  answers: AssessmentAnswers,
  stale: boolean,
  assessedAt: string,
  locale: Locale,
): HandoffFact[] {
  const freshness = stale
    ? t("freshnessOld", locale)
    : fill(t("freshnessAssessedTpl", locale), { m: relativeMinutes(assessedAt) });
  return [
    { label: t("handoffWho", locale), value: whoValue(answers, locale) },
    {
      label: t("handoffDescribed", locale),
      value:
        answers.presentation.trim() ||
        (answers.photoAttached
          ? t("handoffPhotoOnly", locale)
          : t("handoffNotDescribed", locale)),
    },
    {
      label: t("handoffAwake", locale),
      value: answerLabel(answers.awake, AWAKE_KEY, locale),
    },
    {
      label: t("handoffBreathing", locale),
      value: answerLabel(answers.breathing, BREATHING_KEY, locale),
    },
    {
      label: t("handoffDrinking", locale),
      value: answerLabel(answers.drinking, DRINKING_KEY, locale),
    },
    {
      label: t("handoffDuration", locale),
      value: answerLabel(answers.duration, DURATION_KEY, locale),
    },
    {
      label: t("handoffTemp", locale),
      value: "38.6 C",
      freshness,
      stale,
    },
  ];
}

export function whyComing(
  answers: AssessmentAnswers,
  decisionKind: DecisionKind | null,
  locale: Locale,
): string {
  const who =
    answers.who === "child"
      ? t("whoSubjectChild", locale)
      : answers.who === "self"
        ? t("whoSubjectSelf", locale)
        : t("whoSubjectOther", locale);
  if (decisionKind === "go_now") {
    return fill(t("whyComingUrgent", locale), { who });
  }
  if (decisionKind === "get_care_today") {
    return fill(t("whyComingToday", locale), { who });
  }
  return fill(t("whyComingDefault", locale), { who });
}

function whoValue(answers: AssessmentAnswers, locale: Locale): string {
  switch (answers.who) {
    case "self":
      return t("whoValueSelf", locale);
    case "household_adult":
      return t("whoValueAdult", locale);
    case "child":
      return t("whoValueChild", locale);
    default:
      return t("whoValueUnknown", locale);
  }
}

function relativeMinutes(iso: string): number {
  const then = new Date(iso).getTime();
  return Math.max(1, Math.round((Date.now() - then) / 60000));
}
