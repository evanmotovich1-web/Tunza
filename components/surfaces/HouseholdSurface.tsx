"use client";

import { AssessmentFlow } from "@/components/AssessmentFlow";
import { CarePath } from "@/components/CarePath";
import { DecisionResult } from "@/components/DecisionResult";
import { Warning } from "@/components/Warning";
import { decisionHeadline, decisionStatus } from "@/lib/assessment";
import { t } from "@/lib/copy";
import { warningCopy } from "@/lib/failures";
import { activeFailures, useCare } from "@/lib/store";

export function HouseholdSurface() {
  const { state } = useCare();
  const encounter = state.encounter;
  const referral = state.referral;

  if (referral && encounter) {
    return <CarePath role="household" />;
  }

  if (encounter?.decision && !encounter.currentQuestion) {
    return <DecisionView />;
  }

  return <AssessmentFlow />;
}

function DecisionView() {
  const { state, dispatch } = useCare();
  const decision = state.encounter?.decision;
  const locale = state.locale;
  if (!decision) {
    return null;
  }

  const failures = activeFailures(state, null);
  const askedMain = state.encounter?.asked.includes("main_problem") ?? false;
  const action =
    decision.kind === "go_now" || decision.kind === "get_care_today"
      ? { label: t("prepareFacility", locale), onClick: dispatch.prepareReferral }
      : decision.kind === "need_one_more_answer" && !askedMain
        ? { label: t("answerTheQuestion", locale), onClick: dispatch.continueForOneMore }
        : undefined;

  const incomplete = warningCopy("incomplete_assessment", locale);
  const offlineCopy = warningCopy("offline", locale);
  const danger = warningCopy("danger_sign", locale);
  const watch = warningCopy("watch_sign", locale);

  return (
    <DecisionResult
      locale={locale}
      kind={decision.kind}
      headline={decisionHeadline(decision.kind, locale)}
      status={decisionStatus(decision.kind, locale)}
      action={action}
      why={decision.reasonKeys.map((key) => t(key, locale))}
    >
      {failures.includes("incomplete_assessment") ? (
        <Warning
          named="incomplete_assessment"
          eyebrow={incomplete.eyebrow}
          title={incomplete.title}
          body={incomplete.body}
        />
      ) : null}
      {failures.includes("offline") ? (
        <Warning
          named="offline"
          eyebrow={offlineCopy.eyebrow}
          title={offlineCopy.title}
          body={offlineCopy.body}
        />
      ) : null}
      {decision.dangerSignKeys.length > 0 ? (
        <Warning
          named="danger_sign"
          eyebrow={danger.eyebrow}
          title={danger.title}
          body={decision.dangerSignKeys.map((key) => t(key, locale)).join(" · ")}
        />
      ) : null}
      {decision.kind === "monitor_at_home" ? (
        <Warning
          named="watch_sign"
          eyebrow={watch.eyebrow}
          title={watch.title}
          body={decision.watchSignKeys.map((key) => t(key, locale)).join(" · ")}
        />
      ) : null}
    </DecisionResult>
  );
}
