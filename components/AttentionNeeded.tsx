/** V1 care-path component. Reused across household, CHP, and facility. */

export type AttentionItem = {
  id: string;
  label: string;
  detail?: string;
};

type Props = {
  title?: string;
  items: AttentionItem[];
  action?: { label: string; onClick: () => void };
  emptyLabel?: string;
};

export function AttentionNeeded({
  title = "Needs attention",
  items,
  action,
  emptyLabel,
}: Props) {
  if (items.length === 0 && !emptyLabel && !action) {
    return null;
  }

  return (
    <section className="rounded-2xl border border-line bg-raised px-4 py-4">
      <h2 className="text-sm font-medium uppercase tracking-[0.12em] text-ink-soft">
        {title}
      </h2>
      {items.length === 0 && emptyLabel ? (
        <p className="mt-2 text-[1.05rem] font-semibold text-ink">{emptyLabel}</p>
      ) : (
        <ul className="mt-3 flex flex-col gap-3">
          {items.map((item) => (
            <li key={item.id}>
              <p className="font-semibold text-ink">{item.label}</p>
              {item.detail ? (
                <p className="mt-0.5 text-[0.95rem] text-ink-soft">{item.detail}</p>
              ) : null}
            </li>
          ))}
        </ul>
      )}
      {action ? (
        <button
          type="button"
          onClick={action.onClick}
          className="mt-4 min-h-12 w-full rounded-2xl bg-action px-4 text-[1.05rem] font-semibold text-action-ink"
        >
          {action.label}
        </button>
      ) : null}
    </section>
  );
}
