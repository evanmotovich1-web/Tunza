"use client";

import { AssessmentQuestion } from "@/components/AssessmentQuestion";
import { AttentionNeeded } from "@/components/AttentionNeeded";
import { CarePath } from "@/components/CarePath";
import { copy } from "@/lib/copy";
import { useCare } from "@/lib/store";

export function FacilitySurface() {
  const { state, dispatch } = useCare();
  const referral = state.referral;

  if (!referral) {
    return (
      <AttentionNeeded
        title="Incoming"
        items={[
          {
            id: "none",
            label: copy.noIncoming,
            detail: copy.noIncomingDetail,
          },
        ]}
      />
    );
  }

  if (referral.stage === "completed" && !referral.outcome) {
    return (
      <AssessmentQuestion
        question={copy.outcomeQuestion}
        choices={[
          { id: "Seen and treated", label: copy.outcomeTreated },
          { id: "Needed a higher facility", label: copy.outcomeHigher },
          { id: "Did not arrive", label: copy.outcomeNoShow },
        ]}
        dontKnowLabel={copy.dontKnow}
        onDontKnow={() => dispatch.returnOutcome("Outcome not known")}
        onChoose={(id) => dispatch.returnOutcome(id)}
      />
    );
  }

  return <CarePath role="facility" />;
}
