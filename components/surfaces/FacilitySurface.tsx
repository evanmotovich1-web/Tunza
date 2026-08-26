"use client";

import { AssessmentQuestion } from "@/components/AssessmentQuestion";
import { AttentionNeeded } from "@/components/AttentionNeeded";
import { CarePath } from "@/components/CarePath";
import { t } from "@/lib/copy";
import { useCare } from "@/lib/store";
import type { OutcomeCode } from "@/lib/types";

export function FacilitySurface() {
  const { state, dispatch } = useCare();
  const referral = state.referral;
  const locale = state.locale;

  if (!referral) {
    return (
      <AttentionNeeded
        title={t("incomingTitle", locale)}
        items={[
          {
            id: "none",
            label: t("noIncoming", locale),
            detail: t("noIncomingDetail", locale),
          },
        ]}
      />
    );
  }

  if (referral.stage === "completed" && !referral.outcome) {
    return (
      <AssessmentQuestion
        locale={locale}
        question={t("outcomeQuestion", locale)}
        choices={[
          { id: "treated", label: t("outcomeTreated", locale) },
          { id: "referred_onward", label: t("outcomeHigher", locale) },
          { id: "did_not_arrive", label: t("outcomeNoShow", locale) },
        ]}
        dontKnowLabel={t("dontKnow", locale)}
        onDontKnow={() => dispatch.returnOutcome("unknown")}
        onChoose={(id) => dispatch.returnOutcome(id as OutcomeCode)}
      />
    );
  }

  return <CarePath role="facility" />;
}
