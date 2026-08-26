"use client";

import { AssessmentFlow } from "@/components/AssessmentFlow";
import { CarePath } from "@/components/CarePath";
import { DecisionResult } from "@/components/DecisionResult";
import { Warning } from "@/components/Warning";
import { copy } from "@/lib/copy";
import { DANGER_WARNING, FAILURE_COPY, WATCH_WARNING } from "@/lib/failures";
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
  if (!decision) {
    return null;
  }

  const failures = activeFailures(state, null);
  const headline =
    decision.kind === "go_now"
      ? copy.goNow
      : decision.kind === "get_care_today"
        ? copy.getCareToday
        : decision.kind === "monitor_at_home"
          ? copy.monitorAtHome
          : copy.needOneMore;
  const status =
    decision.kind === "go_now"
      ? copy.goNowStatus
      : decision.kind === "get_care_today"
        ? copy.getCareStatus
        : decision.kind === "monitor_at_home"
          ? copy.monitorStatus
          : copy.needOneMoreStatus;

  const askedMain = state.encounter?.asked.includes("main_problem") ?? false;
  const action =
    decision.kind === "go_now" || decision.kind === "get_care_today"
      ? { label: copy.prepareFacility, onClick: dispatch.prepareReferral }
      : decision.kind === "need_one_more_answer" && !askedMain
        ? {
            label: copy.answerTheQuestion,
            onClick: dispatch.continueForOneMore,
          }
        : undefined;

  return (
    <DecisionResult
      kind={decision.kind}
      headline={headline}
      status={status}
      action={action}
      why={decision.reasons}
    >
      {failures.includes("incomplete_assessment") ? (
        <Warning
          named="incomplete_assessment"
          title={FAILURE_COPY.incomplete_assessment.title}
          body={FAILURE_COPY.incomplete_assessment.body}
        />
      ) : null}
      {failures.includes("offline") ? (
        <Warning
          named="offline"
          title={FAILURE_COPY.offline.title}
          body={FAILURE_COPY.offline.body}
        />
      ) : null}
      {decision.dangerSigns.length > 0 ? (
        <Warning
          named="danger_sign"
          title={DANGER_WARNING.title}
          body={decision.dangerSigns.join(" · ")}
        />
      ) : null}
      {decision.kind === "monitor_at_home" ? (
        <Warning
          named="watch_sign"
          title={WATCH_WARNING.title}
          body={WATCH_WARNING.body}
        />
      ) : null}
    </DecisionResult>
  );
}
