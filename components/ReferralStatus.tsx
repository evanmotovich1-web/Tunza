/** V1 care-path component. Reused across household, CHP, and facility. */

import type { ReferralStage, Role } from "@/lib/types";
import type { ReactNode } from "react";

type Props = {
  role: Role;
  stage: ReferralStage;
  headline: string;
  status: string;
  arrivalMinutes: number | null;
  action?: { label: string; onClick: () => void };
  children?: ReactNode;
};

export function ReferralStatus({
  role,
  stage,
  headline,
  status,
  arrivalMinutes,
  action,
  children,
}: Props) {
  const showArrivalInHeadline =
    role === "facility" && stage === "accepted" && arrivalMinutes !== null;

  return (
    <section className="flex flex-col gap-5" aria-live="polite">
      <header className="flex flex-col gap-3">
        <p className="text-sm font-medium uppercase tracking-[0.14em] text-ink-soft">
          Referral · {stage.replaceAll("_", " ")}
        </p>
        <h1 className="text-[1.85rem] font-semibold leading-[1.1] tracking-tight text-ink">
          {headline}
          {showArrivalInHeadline ? (
            <>
              {" — expected arrival "}
              <span className="tabular-nums">{arrivalMinutes} min</span>
            </>
          ) : null}
        </h1>
        <p className="text-[1.05rem] font-semibold leading-snug text-ink">{status}</p>
        {arrivalMinutes !== null && !showArrivalInHeadline ? (
          <p className="text-[1rem] font-semibold text-ink-soft">
            Travel{" "}
            <span className="tabular-nums">{arrivalMinutes} min</span>
          </p>
        ) : null}
      </header>

      {action ? (
        <button
          type="button"
          onClick={action.onClick}
          className="min-h-14 rounded-2xl bg-action px-4 text-[1.05rem] font-semibold text-action-ink"
        >
          {action.label}
        </button>
      ) : null}

      {children}
    </section>
  );
}
