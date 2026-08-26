"use client";

import { AttentionNeeded } from "@/components/AttentionNeeded";
import { FacilityCard } from "@/components/FacilityCard";
import { PatientHandoff } from "@/components/PatientHandoff";
import { ReferralStatus } from "@/components/ReferralStatus";
import { Warning } from "@/components/Warning";
import { missingInfo } from "@/lib/assessment";
import { copy } from "@/lib/copy";
import { FAILURE_COPY } from "@/lib/failures";
import { facilityById } from "@/lib/facilities";
import { handoffFacts, whyComing } from "@/lib/handoff";
import { describeReferral, followUpItems } from "@/lib/referral";
import { activeFailures, useCare } from "@/lib/store";
import type { Role } from "@/lib/types";

export function CarePath({ role }: { role: Role }) {
  const { state, dispatch } = useCare();
  const referral = state.referral;
  const encounter = state.encounter;

  if (!referral || !encounter) {
    return null;
  }

  const decisionKind = encounter.decision?.kind ?? null;
  const view = describeReferral(role, referral, decisionKind);
  const facility = facilityById(referral.facilityId);
  const failures = activeFailures(state, referral);
  const missing = missingInfo(encounter.answers, referral.askMore);
  const followUps = followUpItems(role, referral, decisionKind);
  const stale = failures.includes("stale_information");
  const known = handoffFacts(encounter.answers, stale, encounter.updatedAt);
  const canHandle = decisionKind !== "go_now" || facility.canHandleUrgent;

  const action = view.actionLabel
    ? {
        label: view.actionLabel,
        onClick: () => {
          const label = view.actionLabel;
          if (label === "Send now" || label === "Send to the facility" || label === "Send referral") {
            dispatch.sendReferral();
          } else if (label === "Accept") {
            dispatch.acceptReferral();
          } else if (label === "We've left" || label === "They have left") {
            dispatch.markTraveling();
          } else if (label === "We've arrived" || label === "They're here") {
            dispatch.markArrived();
          } else if (label === "Complete visit") {
            dispatch.completeVisit();
          }
        },
      }
    : undefined;

  const facilityStatus = canHandle
    ? role === "facility"
      ? "We can handle this referral"
      : "This facility can take them"
    : "This facility may not be able to take them";

  const handoff = (
    <PatientHandoff
      why={whyComing(encounter.answers, decisionKind)}
      known={known}
      missing={missing.map((item) => item.label)}
    />
  );

  const facilityCard = (
    <FacilityCard
      name={facility.name}
      travelMinutes={facility.travelMinutes}
      canHandle={canHandle}
      services={facility.services}
      statusLabel={facilityStatus}
    />
  );

  const warnings = failures.map((named) => (
    <Warning
      key={named}
      named={named}
      title={FAILURE_COPY[named].title}
      body={FAILURE_COPY[named].body}
    />
  ));

  const secondaryActions =
    role === "facility" &&
    (referral.stage === "sent" || referral.stage === "received") ? (
      <details className="rounded-2xl border border-line bg-raised px-4 py-3">
        <summary className="cursor-pointer text-[0.95rem] font-medium text-ink">
          {copy.otherActions}
        </summary>
        <div className="mt-3 flex flex-col gap-2">
          <button
            type="button"
            onClick={dispatch.redirectReferral}
            className="min-h-12 rounded-xl border border-line px-3 text-left font-medium"
          >
            {copy.redirect}
          </button>
          <button
            type="button"
            onClick={dispatch.askMore}
            className="min-h-12 rounded-xl border border-line px-3 text-left font-medium"
          >
            {copy.askMore}
          </button>
        </div>
      </details>
    ) : null;

  return (
    <div className="flex flex-col gap-4">
      <ReferralStatus
        role={role}
        stage={referral.stage}
        headline={view.headline}
        status={view.status}
        arrivalMinutes={view.arrivalMinutes}
        action={action}
      >
        {warnings}
      </ReferralStatus>

      {role === "facility" ? (
        <>
          {handoff}
          {facilityCard}
          {secondaryActions}
          {missing.length > 0 ? (
            <AttentionNeeded title="Missing information" items={missing} />
          ) : null}
        </>
      ) : null}

      {role === "household" ? (
        <>
          {facilityCard}
          <details className="rounded-2xl border border-line bg-raised px-4 py-3">
            <summary className="cursor-pointer text-[0.95rem] font-medium text-ink">
              {copy.moreDetail}
            </summary>
            <div className="mt-3 flex flex-col gap-3">{handoff}</div>
          </details>
        </>
      ) : null}

      {role === "chp" ? (
        <>
          <AttentionNeeded
            title="Needs action"
            items={[...followUps, ...missing]}
            emptyLabel={followUps.length === 0 && missing.length === 0 ? "Nothing waiting" : undefined}
          />
          {facilityCard}
          <details className="rounded-2xl border border-line bg-raised px-4 py-3">
            <summary className="cursor-pointer text-[0.95rem] font-medium text-ink">
              {copy.moreDetail}
            </summary>
            <div className="mt-3">{handoff}</div>
          </details>
        </>
      ) : null}
    </div>
  );
}
