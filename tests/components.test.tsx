// @vitest-environment jsdom
import { cleanup, render, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { AssessmentQuestion } from "../components/AssessmentQuestion";
import { HomeScreen } from "../components/HomeScreen";
import { AttentionNeeded } from "../components/AttentionNeeded";
import { DecisionResult } from "../components/DecisionResult";
import { FacilityCard } from "../components/FacilityCard";
import { PatientHandoff } from "../components/PatientHandoff";
import { ReferralStatus } from "../components/ReferralStatus";
import { Warning } from "../components/Warning";
import { decisionHeadline, decisionStatus, EMPTY_ANSWERS } from "../lib/assessment";
import { t, type Locale } from "../lib/copy";
import { warningCopy, type NamedWarning } from "../lib/failures";
import { handoffFacts } from "../lib/handoff";
import type { DecisionKind } from "../lib/types";

const LOCALES: Locale[] = ["en", "sw"];
const noop = () => {};

afterEach(cleanup);

describe("HomeScreen", () => {
  it.each(LOCALES)("renders the landing with one dominant action (%s)", (locale) => {
    const { getByText, queryByText } = render(
      <HomeScreen
        locale={locale}
        continueDetail={null}
        onStart={noop}
        onNearby={noop}
        onContinue={noop}
        onHealthWorker={noop}
      />,
    );
    expect(getByText(t("homeTagline", locale))).toBeTruthy();
    expect(getByText(t("homeGetStarted", locale))).toBeTruthy();
    expect(getByText(t("homeMission", locale))).toBeTruthy();
    expect(getByText(t("homeHealthWorker", locale))).toBeTruthy();
    expect(queryByText(t("homeCardContinueTitle", locale))).toBeNull();
  });

  it.each(LOCALES)("surfaces a live care path on the continue card (%s)", (locale) => {
    const { getByText } = render(
      <HomeScreen
        locale={locale}
        continueDetail={`${t("referralEyebrow", locale)} · ${t("stageAccepted", locale)}`}
        onStart={noop}
        onNearby={noop}
        onContinue={noop}
        onHealthWorker={noop}
      />,
    );
    expect(getByText(t("homeCardContinueTitle", locale))).toBeTruthy();
    expect(
      getByText(`${t("referralEyebrow", locale)} · ${t("stageAccepted", locale)}`),
    ).toBeTruthy();
  });
});

describe("RoleGate", () => {
  it("offers both gated roles behind one sign-in screen", async () => {
    const { CareProvider } = await import("../lib/store");
    const { RoleGate } = await import("../components/RoleGate");
    const { getByText } = render(
      <CareProvider>
        <RoleGate />
      </CareProvider>,
    );
    expect(getByText(t("gateHeading", "en"))).toBeTruthy();
    expect(getByText(t("gateChooseChp", "en"))).toBeTruthy();
    expect(getByText(t("gateChooseFacility", "en"))).toBeTruthy();
  });
});

describe("AssessmentQuestion", () => {
  it.each(LOCALES)("renders one question, choices, and I don't know (%s)", (locale) => {
    const { getByText, getByRole } = render(
      <AssessmentQuestion
        locale={locale}
        question={t("whoQuestion", locale)}
        choices={[
          { id: "self", label: t("whoSelf", locale) },
          { id: "child", label: t("whoChild", locale) },
        ]}
        dontKnowLabel={t("whoUnknown", locale)}
        onDontKnow={noop}
        onChoose={noop}
      />,
    );
    expect(getByRole("heading", { level: 1 }).textContent).toBe(
      t("whoQuestion", locale),
    );
    expect(getByText(t("whoChild", locale))).toBeTruthy();
    expect(getByText(t("whoUnknown", locale))).toBeTruthy();
  });

  it.each(LOCALES)("labels the three entry modes in words (%s)", (locale) => {
    const { getAllByRole } = render(
      <AssessmentQuestion
        locale={locale}
        question={t("whatQuestion", locale)}
        dontKnowLabel={t("dontKnow", locale)}
        onDontKnow={noop}
        entry={{
          mode: "speak",
          onMode: noop,
          text: "",
          onText: noop,
          listening: false,
          speakAvailable: false,
          onSpeak: noop,
          photoAttached: false,
          onPhoto: noop,
        }}
      />,
    );
    const tabs = getAllByRole("tab").map((tab: HTMLElement) => tab.textContent);
    expect(tabs).toEqual([
      t("modeSpeak", locale),
      t("modeType", locale),
      t("modePhoto", locale),
    ]);
  });
});

describe("DecisionResult", () => {
  const kinds: DecisionKind[] = [
    "go_now",
    "get_care_today",
    "monitor_at_home",
    "need_one_more_answer",
  ];

  it.each(LOCALES)("renders all four decisions with one headline (%s)", (locale) => {
    for (const kind of kinds) {
      const { getByRole, unmount } = render(
        <DecisionResult
          locale={locale}
          kind={kind}
          headline={decisionHeadline(kind, locale)}
          status={decisionStatus(kind, locale)}
          why={[t("reasonNoDanger", locale)]}
        />,
      );
      expect(getByRole("heading", { level: 1 }).textContent).toBe(
        decisionHeadline(kind, locale),
      );
      unmount();
    }
  });

  it.each(LOCALES)("keeps the why behind one tap (%s)", (locale) => {
    const { getByText } = render(
      <DecisionResult
        locale={locale}
        kind="monitor_at_home"
        headline={decisionHeadline("monitor_at_home", locale)}
        status={decisionStatus("monitor_at_home", locale)}
        why={[t("reasonNoDanger", locale)]}
      />,
    );
    expect(getByText(t("whyThis", locale))).toBeTruthy();
  });
});

describe("Warning", () => {
  const named: NamedWarning[] = [
    "offline",
    "no_facility_response",
    "redirected",
    "stale_information",
    "incomplete_assessment",
    "weak_connection",
    "danger_sign",
    "watch_sign",
  ];

  it.each(LOCALES)("renders every named state in words, never enums (%s)", (locale) => {
    for (const name of named) {
      const copy = warningCopy(name, locale);
      const { container, unmount } = render(
        <Warning
          named={name}
          eyebrow={copy.eyebrow}
          title={copy.title}
          body={copy.body || undefined}
        />,
      );
      const aside = container.querySelector("aside");
      expect(aside?.getAttribute("data-named-state")).toBe(name);
      expect(aside?.textContent).toContain(copy.title);
      expect(aside?.textContent).not.toContain("_");
      unmount();
    }
  });
});

describe("ReferralStatus", () => {
  it.each(LOCALES)(
    "shows the facility arrival inside the headline with tabular figures (%s)",
    (locale) => {
      const { getByRole } = render(
        <ReferralStatus
          locale={locale}
          role="facility"
          stage="accepted"
          stageLabel={t("stageAccepted", locale)}
          headline={t("refAcceptedFacilityUrgentHeadline", locale)}
          status={t("refAcceptedFacilityStatus", locale)}
          arrivalMinutes={42}
        />,
      );
      const heading = getByRole("heading", { level: 1 });
      expect(heading.textContent).toContain(
        t("refAcceptedFacilityUrgentHeadline", locale),
      );
      expect(heading.textContent).toContain("42");
      expect(heading.querySelector(".tabular-nums")?.textContent).toBe("42");
    },
  );

  it.each(LOCALES)("names the stage in words, not enums (%s)", (locale) => {
    const { container } = render(
      <ReferralStatus
        locale={locale}
        role="household"
        stage="patient_moving"
        stageLabel={t("stagePatientMoving", locale)}
        headline={t("refMovingHouseholdHeadline", locale)}
        status={t("refMovingHouseholdStatus", locale)}
        arrivalMinutes={null}
      />,
    );
    expect(container.textContent).toContain(t("stagePatientMoving", locale));
    expect(container.textContent).not.toContain("patient_moving");
  });
});

describe("FacilityCard", () => {
  it.each(LOCALES)("shows travel time in tabular figures (%s)", (locale) => {
    const { container, getByText } = render(
      <FacilityCard
        locale={locale}
        name="North Demo Health Centre"
        travelMinutes={42}
        canHandle
        services={["Urgent care"]}
        statusLabel={t("facilityCanTake", locale)}
      />,
    );
    expect(getByText(t("facilityCanTake", locale))).toBeTruthy();
    expect(container.querySelector(".tabular-nums")?.textContent).toBe("42");
  });
});

describe("AttentionNeeded", () => {
  it.each(LOCALES)("renders items and the empty state (%s)", (locale) => {
    const withItems = render(
      <AttentionNeeded
        title={t("needsAction", locale)}
        items={[{ id: "a", label: t("fuConfirmTravel", locale) }]}
      />,
    );
    expect(withItems.getByText(t("fuConfirmTravel", locale))).toBeTruthy();
    withItems.unmount();

    const empty = render(
      <AttentionNeeded
        title={t("needsAction", locale)}
        items={[]}
        emptyLabel={t("nothingWaiting", locale)}
      />,
    );
    expect(empty.getByText(t("nothingWaiting", locale))).toBeTruthy();
  });
});

describe("PatientHandoff", () => {
  it.each(LOCALES)("renders facts with freshness and missing list (%s)", (locale) => {
    const facts = handoffFacts(
      { ...EMPTY_ANSWERS, who: "child", awake: "alert" },
      false,
      new Date().toISOString(),
      locale,
    );
    const { container, getByText } = render(
      <PatientHandoff
        locale={locale}
        why={t("whyComingDefault", locale).replace("{who}", t("whoSubjectChild", locale))}
        known={facts}
        missing={[t("missingBreathing", locale)]}
      />,
    );
    expect(getByText(t("handoffStillMissing", locale))).toBeTruthy();
    expect(getByText(t("missingBreathing", locale))).toBeTruthy();
    const dl = container.querySelector("dl");
    expect(within(dl as HTMLElement).getByText(t("awakeAlert", locale))).toBeTruthy();
    expect(container.textContent).not.toContain("not_waking");
  });
});
