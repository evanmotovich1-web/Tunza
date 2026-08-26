import { describe, expect, it } from "vitest";
import { t } from "../lib/copy";

describe("household copy", () => {
  it("keeps English as the working locale", () => {
    expect(t("whoQuestion")).toBe("Who needs help?");
    expect(t("whatQuestion")).toBe("What is happening?");
    expect(t("goNow")).toBe("Go now");
    expect(t("getCareToday")).toBe("Get care today");
    expect(t("monitorAtHome")).toBe("Monitor at home");
    expect(t("needOneMore")).toBe("I need one more answer");
  });

  it("stubs Kiswahili household strings with English fallback", () => {
    expect(t("whoQuestion", "sw")).toBe("Nani anahitaji msaada?");
    expect(t("goNow", "sw")).toBe("Nenda sasa");
    expect(t("whatContinue", "sw")).toBe("Continue");
  });
});
