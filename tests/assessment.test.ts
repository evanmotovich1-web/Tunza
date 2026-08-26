import { describe, expect, it } from "vitest";
import {
  applyAnswer,
  decide,
  EMPTY_ANSWERS,
  missingInfo,
  nextQuestion,
} from "../lib/assessment";
import type { AssessmentAnswers } from "../lib/types";

function fillAnswers(partial: Partial<AssessmentAnswers>): AssessmentAnswers {
  return { ...EMPTY_ANSWERS, ...partial };
}

describe("decide", () => {
  it("escalates unconscious presentation to go now before later questions", () => {
    const answers = fillAnswers({
      who: "child",
      presentation: "He is unconscious and not waking",
    });
    expect(decide(answers).kind).toBe("go_now");
    expect(nextQuestion(answers, "what")).toBeNull();
  });

  it("hears danger signs described in Kiswahili", () => {
    const answers = fillAnswers({
      who: "child",
      presentation: "Ana kifafa na haamki",
    });
    const decision = decide(answers);
    expect(decision.kind).toBe("go_now");
    expect(decision.dangerSignKeys).toContain("dangerSeizure");
    expect(decision.dangerSignKeys).toContain("dangerNotWaking");
  });

  it("sends a child who cannot drink now", () => {
    const answers = fillAnswers({
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
    const answers = fillAnswers({
      who: "child",
      presentation: "fever and coughing",
      awake: "alert",
      breathing: "fine",
      drinking: "yes",
      duration: "two_days",
    });
    const decision = decide(answers);
    expect(decision.kind).toBe("get_care_today");
    expect(decision.reasonKeys).toContain("reasonChildFever");
    expect(nextQuestion(answers, "duration")).toBeNull();
  });

  it("monitors at home when awake, drinking, and breathing are fine", () => {
    const answers = fillAnswers({
      who: "household_adult",
      presentation: "mild cough",
      awake: "alert",
      breathing: "fine",
      drinking: "yes",
      duration: "today",
    });
    const decision = decide(answers);
    expect(decision.kind).toBe("monitor_at_home");
    expect(decision.reasonKeys).toContain("reasonNoDanger");
    expect(decision.watchSignKeys.length).toBeGreaterThan(0);
  });

  it("needs one more answer when the story and critical signs are unknown", () => {
    const answers = fillAnswers({
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
  it("reuses the same missing items for any role, in the asked language", () => {
    const enItems = missingInfo(EMPTY_ANSWERS, "can_walk", "en");
    expect(enItems.map((item) => item.id)).toEqual([
      "who",
      "what",
      "awake",
      "breathing",
      "drinking",
      "ask-more",
    ]);
    const swItems = missingInfo(EMPTY_ANSWERS, "can_walk", "sw");
    expect(swItems.map((item) => item.id)).toEqual(enItems.map((item) => item.id));
    expect(swItems[swItems.length - 1].label).toBe(
      "Je, anaweza kutembea hadi ndani ya kituo?",
    );
  });
});

describe("applyAnswer", () => {
  it("walks who then what", () => {
    const afterWho = applyAnswer(EMPTY_ANSWERS, "who", "child");
    expect(nextQuestion(afterWho, "who")).toBe("what");
  });
});
