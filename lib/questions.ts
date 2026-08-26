import { t, type Locale } from "./copy";
import type { PersonKind, QuestionId } from "./types";

export function questionContent(
  id: QuestionId,
  who: PersonKind | null,
  locale: Locale,
): { question: string; hint?: string; choices: { id: string; label: string }[] } {
  switch (id) {
    case "who":
      return {
        question: t("whoQuestion", locale),
        choices: [
          { id: "self", label: t("whoSelf", locale) },
          { id: "household_adult", label: t("whoAdult", locale) },
          { id: "child", label: t("whoChild", locale) },
        ],
      };
    case "what":
      return {
        question: t("whatQuestion", locale),
        hint: t("whatHint", locale),
        choices: [],
      };
    case "awake":
      return {
        question: t("awakeQuestion", locale),
        choices: [
          { id: "alert", label: t("awakeAlert", locale) },
          { id: "sleepy", label: t("awakeSleepy", locale) },
          { id: "not_waking", label: t("awakeNotWaking", locale) },
        ],
      };
    case "breathing":
      return {
        question: t("breathingQuestion", locale),
        choices: [
          { id: "fine", label: t("breathingFine", locale) },
          { id: "difficult", label: t("breathingDifficult", locale) },
          { id: "severe", label: t("breathingSevere", locale) },
        ],
      };
    case "drinking":
      return {
        question:
          who === "child"
            ? t("drinkingQuestionChild", locale)
            : t("drinkingQuestion", locale),
        choices: [
          { id: "yes", label: t("drinkingYes", locale) },
          { id: "little", label: t("drinkingLittle", locale) },
          { id: "no", label: t("drinkingNo", locale) },
        ],
      };
    case "duration":
      return {
        question: t("durationQuestion", locale),
        choices: [
          { id: "today", label: t("durationToday", locale) },
          { id: "two_days", label: t("durationTwoDays", locale) },
          { id: "longer", label: t("durationLonger", locale) },
        ],
      };
    case "main_problem":
      return {
        question: t("mainProblemQuestion", locale),
        choices: [
          { id: "breathing", label: t("mainBreathing", locale) },
          { id: "fever", label: t("mainFever", locale) },
          { id: "injury", label: t("mainInjury", locale) },
          { id: "stomach", label: t("mainStomach", locale) },
          { id: "other", label: t("mainOther", locale) },
        ],
      };
  }
}

export function dontKnowValue(question: QuestionId): string {
  if (question === "who") {
    return "unknown";
  }
  if (question === "what") {
    return "";
  }
  return "unknown";
}
