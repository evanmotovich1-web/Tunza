"use client";

import { AssessmentFlow } from "@/components/AssessmentFlow";
import { AttentionNeeded } from "@/components/AttentionNeeded";
import { CarePath } from "@/components/CarePath";
import { DecisionResult } from "@/components/DecisionResult";
import { Warning } from "@/components/Warning";
import { missingInfo } from "@/lib/assessment";
import { copy } from "@/lib/copy";
import { FAILURE_COPY } from "@/lib/failures";
import { followUpItems } from "@/lib/referral";
import { activeFailures, useCare } from "@/lib/store";

export function ChpSurface() {
  const { state, dispatch } = useCare();
  const encounter = state.encounter;
  const referral = state.referral;

  if (!encounter) {
    return (
      <AttentionNeeded
        title="Encounter"
        items={[
          {
            id: "none",
            label: copy.noEncounter,
            detail: copy.noEncounterDetail,
          },
        ]}
        action={{ label: copy.startEncounter, onClick: dispatch.startEncounter }}
      />
    );
  }

  if (referral) {
    return <CarePath role="chp" />;
  }

  if (encounter.decision && !encounter.currentQuestion) {
    const missing = missingInfo(encounter.answers, null);
    const followUps = followUpItems("chp", null, encounter.decision.kind);
    const failures = activeFailures(state, null);
    const kind = encounter.decision.kind;
    const headline =
      kind === "go_now"
        ? copy.goNow
        : kind === "get_care_today"
          ? copy.getCareToday
          : kind === "monitor_at_home"
            ? copy.monitorAtHome
            : copy.needOneMore;
    const status =
      kind === "go_now"
        ? copy.goNowStatus
        : kind === "get_care_today"
          ? copy.getCareStatus
          : kind === "monitor_at_home"
            ? copy.monitorStatus
            : copy.needOneMoreStatus;
    const askedMain = encounter.asked.includes("main_problem");
    const action =
      kind === "go_now" || kind === "get_care_today"
        ? { label: "Create referral", onClick: dispatch.prepareReferral }
        : kind === "need_one_more_answer" && !askedMain
          ? { label: copy.answerTheQuestion, onClick: dispatch.continueForOneMore }
          : undefined;

    return (
      <div className="flex flex-col gap-4">
        <DecisionResult
          kind={kind}
          headline={headline}
          status={status}
          action={action}
          why={encounter.decision.reasons}
        >
          {failures.includes("incomplete_assessment") ? (
            <Warning
              named="incomplete_assessment"
              title={FAILURE_COPY.incomplete_assessment.title}
              body={FAILURE_COPY.incomplete_assessment.body}
            />
          ) : null}
        </DecisionResult>
        <AttentionNeeded title="Missing information" items={missing} />
        <AttentionNeeded title="Who needs follow-up" items={followUps} />
      </div>
    );
  }

  const missing = missingInfo(encounter.answers, null);
  return (
    <div className="flex flex-col gap-4">
      <AssessmentFlow />
      {encounter.asked.length > 0 ? (
        <details className="rounded-2xl border border-line bg-raised px-4 py-3">
          <summary className="cursor-pointer text-[0.95rem] font-medium text-ink">
            Missing information
          </summary>
          <div className="mt-3">
            <AttentionNeeded items={missing} />
          </div>
        </details>
      ) : null}
    </div>
  );
}
