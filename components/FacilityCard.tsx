/** V1 care-path component. Reused across household, CHP, and facility. */

import { t, type Locale } from "@/lib/copy";

type Props = {
  locale: Locale;
  name: string;
  travelMinutes: number;
  canHandle: boolean;
  services: string[];
  statusLabel: string;
};

export function FacilityCard({
  locale,
  name,
  travelMinutes,
  canHandle,
  services,
  statusLabel,
}: Props) {
  const [before, after] = t("facilityTravelTpl", locale).split("{m}");
  return (
    <article className="rounded-2xl border border-line bg-raised px-4 py-4">
      <p className="text-caption font-medium uppercase tracking-[0.12em] text-ink-soft">
        {t("facilityEyebrow", locale)}
      </p>
      <h2 className="mt-1 text-heading font-semibold text-ink">{name}</h2>
      <p className="mt-2 text-body font-medium text-ink-soft">
        {before}
        <span className="tabular-nums font-semibold text-ink">{travelMinutes}</span>
        {after}
      </p>
      <p
        className={`mt-2 text-body font-semibold ${canHandle ? "text-ink" : "text-urgent"}`}
      >
        {statusLabel}
      </p>
      <p className="mt-2 text-label text-ink-soft">{services.join(" · ")}</p>
    </article>
  );
}
