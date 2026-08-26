"use client";

import { AssessmentFlow } from "@/components/AssessmentFlow";
import { AttentionNeeded } from "@/components/AttentionNeeded";
import { CarePath } from "@/components/CarePath";
import { DecisionResult } from "@/components/DecisionResult";
import { Warning } from "@/components/Warning";
import { decisionHeadline, decisionStatus, missingInfo } from "@/lib/assessment";
import { t } from "@/lib/copy";
import { warningCopy } from "@/lib/failures";
import { followUpItems } from "@/lib/referral";
import { activeFailures, useCare } from "@/lib/store";

export function ChpSurface() {
  const { state, dispatch } = useCare();
  const encounter = state.encounter;
  const referral = state.referral;
  const locale = state.locale;

  if (!encounter) {
    return (
      <AttentionNeeded
        title={t("encounterTitle", locale)}
        items={[
          {
            id: "none",
            label: t("noEncounter", locale),
            detail: t("noEncounterDetail", locale),
          },
        ]}
        action={{ label: t("startEncounter", locale), onClick: dispatch.startEncounter }}
      />
    );
  }

  if (referral) {
    return <CarePath role="chp" />;
  }

  if (encounter.decision && !encounter.currentQuestion) {
    const missing = missingInfo(encounter.answers, null, locale);
    const followUps = followUpItems("chp", null, encounter.decision.kind, locale);
    const failures = activeFailures(state, null);
    const kind = encounter.decision.kind;
    const askedMain = encounter.asked.includes("main_problem");
    const action =
      kind === "go_now" || kind === "get_care_today"
        ? { label: t("createReferral", locale), onClick: dispatch.prepareReferral }
        : kind === "need_one_more_answer" && !askedMain
          ? { label: t("answerTheQuestion", locale), onClick: dispatch.continueForOneMore }
          : undefined;
    const incomplete = warningCopy("incomplete_assessment", locale);

    return (
      <div className="flex flex-col gap-4">
        <DecisionResult
          locale={locale}
          kind={kind}
          headline={decisionHeadline(kind, locale)}
          status={decisionStatus(kind, locale)}
          action={action}
          why={encounter.decision.reasonKeys.map((key) => t(key, locale))}
        >
          {failures.includes("incomplete_assessment") ? (
            <Warning
              named="incomplete_assessment"
              eyebrow={incomplete.eyebrow}
              title={incomplete.title}
              body={incomplete.body}
            />
          ) : null}
        </DecisionResult>
        <AttentionNeeded title={t("missingInformation", locale)} items={missing} />
        <AttentionNeeded title={t("whoNeedsFollowUp", locale)} items={followUps} />
      </div>
    );
  }

  const missing = missingInfo(encounter.answers, null, locale);
  return (
    <div className="flex flex-col gap-4">
      <AssessmentFlow />
      {encounter.asked.length > 0 ? (
        <details className="rounded-2xl border border-line bg-raised px-4 py-3">
          <summary className="cursor-pointer text-label font-medium text-ink">
            {t("missingInformation", locale)}
          </summary>
          <div className="mt-3">
            <AttentionNeeded items={missing} />
          </div>
        </details>
      ) : null}
    </div>
  );
}
