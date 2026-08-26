/** V1 care-path component. Reused across household, CHP, and facility. */

import { t, type Locale } from "@/lib/copy";
import type { HandoffFact } from "@/lib/handoff";

type Props = {
  locale: Locale;
  why: string;
  known: HandoffFact[];
  missing: string[];
};

export function PatientHandoff({ locale, why, known, missing }: Props) {
  return (
    <section className="rounded-2xl border border-line bg-raised px-4 py-4">
      <p className="text-caption font-medium uppercase tracking-[0.12em] text-ink-soft">
        {t("handoffEyebrow", locale)}
      </p>
      <h2 className="mt-1 text-heading font-semibold text-ink">{why}</h2>
      <dl className="mt-4 flex flex-col gap-3">
        {known.map((fact) => (
          <div key={fact.label}>
            <dt className="text-label font-medium text-ink-soft">{fact.label}</dt>
            <dd className="text-body font-semibold text-ink">
              {looksNumeric(fact.value) ? (
                <span className="tabular-nums">{fact.value}</span>
              ) : (
                fact.value
              )}
            </dd>
            {fact.freshness ? (
              <p
                className={`text-label font-medium ${fact.stale ? "text-today" : "text-ink-soft"}`}
              >
                <span className="tabular-nums">{fact.freshness}</span>
              </p>
            ) : null}
          </div>
        ))}
      </dl>
      {missing.length > 0 ? (
        <div className="mt-4 border-t border-line pt-3">
          <p className="text-label font-medium text-ink-soft">
            {t("handoffStillMissing", locale)}
          </p>
          <ul className="mt-1 flex flex-col gap-1 text-label font-semibold text-ink">
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
