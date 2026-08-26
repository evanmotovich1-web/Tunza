"use client";

import { AttentionNeeded } from "@/components/AttentionNeeded";
import { FacilityCard } from "@/components/FacilityCard";
import { PatientHandoff } from "@/components/PatientHandoff";
import { ReferralStatus } from "@/components/ReferralStatus";
import { Warning } from "@/components/Warning";
import { missingInfo } from "@/lib/assessment";
import { t } from "@/lib/copy";
import { warningCopy } from "@/lib/failures";
import { facilityById } from "@/lib/facilities";
import { handoffFacts, whyComing } from "@/lib/handoff";
import {
  describeReferral,
  followUpItems,
  type ReferralAction,
} from "@/lib/referral";
import { activeFailures, useCare } from "@/lib/store";
import type { Role } from "@/lib/types";

export function CarePath({ role }: { role: Role }) {
  const { state, dispatch } = useCare();
  const referral = state.referral;
  const encounter = state.encounter;
  const locale = state.locale;

  if (!referral || !encounter) {
    return null;
  }

  const decisionKind = encounter.decision?.kind ?? null;
  const view = describeReferral(role, referral, decisionKind, locale);
  const facility = facilityById(referral.facilityId);
  const failures = activeFailures(state, referral);
  const missing = missingInfo(encounter.answers, referral.askMore, locale);
  const followUps = followUpItems(role, referral, decisionKind, locale);
  const stale = failures.includes("stale_information");
  const known = handoffFacts(encounter.answers, stale, encounter.updatedAt, locale);
  const canHandle = decisionKind !== "go_now" || facility.canHandleUrgent;

  const performAction: Partial<Record<ReferralAction, () => void>> = {
    send: dispatch.sendReferral,
    accept: dispatch.acceptReferral,
    travel: dispatch.markTraveling,
    arrive: dispatch.markArrived,
    start_care: dispatch.startCare,
    complete: dispatch.completeVisit,
  };

  const onAction = view.action ? performAction[view.action.id] : undefined;
  const action =
    view.action && onAction
      ? { label: view.action.label, onClick: onAction }
      : undefined;

  const facilityStatus = canHandle
    ? role === "facility"
      ? t("facilityWeCanHandle", locale)
      : t("facilityCanTake", locale)
    : t("facilityMayNot", locale);

  const handoff = (
    <PatientHandoff
      locale={locale}
      why={whyComing(encounter.answers, decisionKind, locale)}
      known={known}
      missing={missing.map((item) => item.label)}
    />
  );

  const facilityCard = (
    <FacilityCard
      locale={locale}
      name={facility.name}
      travelMinutes={facility.travelMinutes}
      canHandle={canHandle}
      services={facility.services}
      statusLabel={facilityStatus}
    />
  );

  const warnings = failures.map((named) => {
    const copy = warningCopy(named, locale);
    return (
      <Warning
        key={named}
        named={named}
        eyebrow={copy.eyebrow}
        title={copy.title}
        body={copy.body}
      />
    );
  });

  const secondaryActions =
    role === "facility" &&
    (referral.stage === "sent" || referral.stage === "received") ? (
      <details className="rounded-2xl border border-line bg-raised px-4 py-3">
        <summary className="cursor-pointer text-label font-medium text-ink">
          {t("otherActions", locale)}
        </summary>
        <div className="mt-3 flex flex-col gap-2">
          <button
            type="button"
            onClick={dispatch.redirectReferral}
            className="min-h-12 rounded-xl border border-line px-3 text-left text-body font-medium"
          >
            {t("redirect", locale)}
          </button>
          <button
            type="button"
            onClick={dispatch.askMore}
            className="min-h-12 rounded-xl border border-line px-3 text-left text-body font-medium"
          >
            {t("askMore", locale)}
          </button>
        </div>
      </details>
    ) : null;

  return (
    <div className="flex flex-col gap-4">
      <ReferralStatus
        locale={locale}
        role={role}
        stage={referral.stage}
        stageLabel={view.stageLabel}
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
            <AttentionNeeded title={t("missingInformation", locale)} items={missing} />
          ) : null}
        </>
      ) : null}

      {role === "household" ? (
        <>
          {facilityCard}
          <details className="rounded-2xl border border-line bg-raised px-4 py-3">
            <summary className="cursor-pointer text-label font-medium text-ink">
              {t("moreDetail", locale)}
            </summary>
            <div className="mt-3 flex flex-col gap-3">{handoff}</div>
          </details>
        </>
      ) : null}

      {role === "chp" ? (
        <>
          <AttentionNeeded
            title={t("needsAction", locale)}
            items={[...followUps, ...missing]}
            emptyLabel={
              followUps.length === 0 && missing.length === 0
                ? t("nothingWaiting", locale)
                : undefined
            }
          />
          {facilityCard}
          <details className="rounded-2xl border border-line bg-raised px-4 py-3">
            <summary className="cursor-pointer text-label font-medium text-ink">
              {t("moreDetail", locale)}
            </summary>
            <div className="mt-3">{handoff}</div>
          </details>
        </>
      ) : null}
    </div>
  );
}
