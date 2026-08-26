/** V1 care-path component. Reused across household, CHP, and facility. */

import type { HandoffFact } from "@/lib/handoff";

type Props = {
  why: string;
  known: HandoffFact[];
  missing: string[];
};

export function PatientHandoff({ why, known, missing }: Props) {
  return (
    <section className="rounded-2xl border border-line bg-raised px-4 py-4">
      <p className="text-sm font-medium uppercase tracking-[0.12em] text-ink-soft">
        Handoff
      </p>
      <h2 className="mt-1 text-[1.15rem] font-semibold leading-snug text-ink">{why}</h2>
      <dl className="mt-4 flex flex-col gap-3">
        {known.map((fact) => (
          <div key={fact.label}>
            <dt className="text-sm font-medium text-ink-soft">{fact.label}</dt>
            <dd className="font-semibold text-ink">
              {looksNumeric(fact.value) ? (
                <span className="tabular-nums">{fact.value}</span>
              ) : (
                fact.value
              )}
            </dd>
            {fact.freshness ? (
              <p
                className={`text-sm font-medium ${fact.stale ? "text-today" : "text-ink-soft"}`}
              >
                {fact.freshness.includes("min") || fact.freshness.includes("month") ? (
                  <span className="tabular-nums">{fact.freshness}</span>
                ) : (
                  fact.freshness
                )}
              </p>
            ) : null}
          </div>
        ))}
      </dl>
      {missing.length > 0 ? (
        <div className="mt-4 border-t border-line pt-3">
          <p className="text-sm font-medium text-ink-soft">Still missing</p>
          <ul className="mt-1 flex flex-col gap-1 text-[0.95rem] font-semibold text-ink">
            {missing.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}

function looksNumeric(value: string): boolean {
  return /\d/.test(value);
}
