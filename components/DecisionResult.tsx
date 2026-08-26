/** V1 care-path component. Reused across household, CHP, and facility. */

import type { DecisionKind } from "@/lib/types";
import type { ReactNode } from "react";

type Props = {
  kind: DecisionKind;
  headline: string;
  status: string;
  action?: { label: string; onClick: () => void };
  why?: string[];
  children?: ReactNode;
};

const HEADLINE_COLOR: Record<DecisionKind, string> = {
  go_now: "text-urgent",
  get_care_today: "text-today",
  monitor_at_home: "text-watch",
  need_one_more_answer: "text-ink",
};

export function DecisionResult({
  kind,
  headline,
  status,
  action,
  why,
  children,
}: Props) {
  return (
    <section className="flex flex-col gap-6">
      <header className="flex flex-col gap-3">
        <p className="text-sm font-medium uppercase tracking-[0.14em] text-ink-soft">
          Next action
        </p>
        <h1
          className={`text-[2.35rem] font-bold leading-[1.05] tracking-tight ${HEADLINE_COLOR[kind]}`}
        >
          {headline}
        </h1>
        <p className="text-[1.05rem] font-semibold leading-snug text-ink">{status}</p>
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

      {why && why.length > 0 ? (
        <details className="rounded-2xl border border-line bg-raised px-4 py-3">
          <summary className="cursor-pointer text-[0.95rem] font-medium text-ink">
            Why this?
          </summary>
          <ul className="mt-3 flex flex-col gap-2 text-[0.95rem] text-ink-soft">
            {why.map((reason) => (
              <li key={reason}>{reason}</li>
            ))}
          </ul>
        </details>
      ) : null}
    </section>
  );
}
