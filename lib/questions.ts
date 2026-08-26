import { copy } from "./copy";
import type { PersonKind, QuestionId } from "./types";

export function questionContent(
  id: QuestionId,
  who: PersonKind | null,
): { question: string; hint?: string; choices: { id: string; label: string }[] } {
  switch (id) {
    case "who":
      return {
        question: copy.whoQuestion,
        choices: [
          { id: "self", label: copy.whoSelf },
          { id: "household_adult", label: copy.whoAdult },
          { id: "child", label: copy.whoChild },
        ],
      };
    case "what":
      return {
        question: copy.whatQuestion,
        hint: copy.whatHint,
        choices: [],
      };
    case "awake":
      return {
        question: copy.awakeQuestion,
        choices: [
          { id: "alert", label: copy.awakeAlert },
          { id: "sleepy", label: copy.awakeSleepy },
          { id: "not_waking", label: copy.awakeNotWaking },
        ],
      };
    case "breathing":
      return {
        question: copy.breathingQuestion,
        choices: [
          { id: "fine", label: copy.breathingFine },
          { id: "difficult", label: copy.breathingDifficult },
          { id: "severe", label: copy.breathingSevere },
        ],
      };
    case "drinking":
      return {
        question: who === "child" ? copy.drinkingQuestionChild : copy.drinkingQuestion,
        choices: [
          { id: "yes", label: copy.drinkingYes },
          { id: "little", label: copy.drinkingLittle },
          { id: "no", label: copy.drinkingNo },
        ],
      };
    case "duration":
      return {
        question: copy.durationQuestion,
        choices: [
          { id: "today", label: copy.durationToday },
          { id: "two_days", label: copy.durationTwoDays },
          { id: "longer", label: copy.durationLonger },
        ],
      };
    case "main_problem":
      return {
        question: copy.mainProblemQuestion,
        choices: [
          { id: "breathing", label: copy.mainBreathing },
          { id: "fever", label: copy.mainFever },
          { id: "injury", label: copy.mainInjury },
          { id: "stomach", label: copy.mainStomach },
          { id: "other", label: copy.mainOther },
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
