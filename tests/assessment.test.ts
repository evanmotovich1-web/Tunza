import { describe, expect, it } from "vitest";
import {
  applyAnswer,
  decide,
  EMPTY_ANSWERS,
  missingInfo,
  nextQuestion,
} from "../lib/assessment";
import type { AssessmentAnswers } from "../lib/types";

function fill(partial: Partial<AssessmentAnswers>): AssessmentAnswers {
  return { ...EMPTY_ANSWERS, ...partial };
}

describe("decide", () => {
  it("escalates unconscious presentation to go now before later questions", () => {
    const answers = fill({
      who: "child",
      presentation: "He is unconscious and not waking",
    });
    expect(decide(answers).kind).toBe("go_now");
    expect(nextQuestion(answers, "what")).toBeNull();
  });

  it("sends a child who cannot drink now", () => {
    const answers = fill({
      who: "child",
      presentation: "fever",
      awake: "alert",
      breathing: "fine",
      drinking: "no",
    });
    expect(decide(answers).kind).toBe("go_now");
    expect(nextQuestion(answers, "drinking")).toBeNull();
  });

  it("asks for care today for a child with fever who can drink", () => {
    const answers = fill({
      who: "child",
      presentation: "fever and coughing",
      awake: "alert",
      breathing: "fine",
      drinking: "yes",
      duration: "two_days",
    });
    expect(decide(answers).kind).toBe("get_care_today");
    expect(nextQuestion(answers, "duration")).toBeNull();
  });

  it("monitors at home when awake, drinking, and breathing are fine", () => {
    const answers = fill({
      who: "household_adult",
      presentation: "mild cough",
      awake: "alert",
      breathing: "fine",
      drinking: "yes",
      duration: "today",
    });
    expect(decide(answers).kind).toBe("monitor_at_home");
  });

  it("needs one more answer when the story and critical signs are unknown", () => {
    const answers = fill({
      who: "unknown",
      presentation: "",
      awake: "unknown",
      breathing: "unknown",
      drinking: "unknown",
      duration: "unknown",
    });
    expect(decide(answers).kind).toBe("need_one_more_answer");
  });
});

describe("missingInfo", () => {
  it("reuses the same missing items for any role", () => {
    const items = missingInfo(EMPTY_ANSWERS, "Can they walk into the facility?");
    expect(items.map((item) => item.id)).toEqual([
      "who",
      "what",
      "awake",
      "breathing",
      "drinking",
      "ask-more",
    ]);
  });
});

describe("applyAnswer", () => {
  it("walks who then what", () => {
    const afterWho = applyAnswer(EMPTY_ANSWERS, "who", "child");
    expect(nextQuestion(afterWho, "who")).toBe("what");
  });
});
