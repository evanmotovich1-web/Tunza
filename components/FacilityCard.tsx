/** V1 care-path component. Reused across household, CHP, and facility. */

type Props = {
  name: string;
  travelMinutes: number;
  canHandle: boolean;
  services: string[];
  statusLabel: string;
};

export function FacilityCard({
  name,
  travelMinutes,
  canHandle,
  services,
  statusLabel,
}: Props) {
  return (
    <article className="rounded-2xl border border-line bg-raised px-4 py-4">
      <p className="text-sm font-medium uppercase tracking-[0.12em] text-ink-soft">
        Facility
      </p>
      <h2 className="mt-1 text-[1.2rem] font-semibold leading-snug text-ink">{name}</h2>
      <p className="mt-2 font-semibold text-ink">
        <span className="tabular-nums">{travelMinutes} min</span>
        <span className="font-medium text-ink-soft"> by typical road</span>
      </p>
      <p className={`mt-2 font-semibold ${canHandle ? "text-action" : "text-urgent"}`}>
        {statusLabel}
      </p>
      <p className="mt-2 text-[0.95rem] text-ink-soft">{services.join(" · ")}</p>
    </article>
  );
}
