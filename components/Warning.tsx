/** V1 care-path component. Reused across household, CHP, and facility. */

import type { NamedFailure } from "@/lib/types";

type Named = NamedFailure | "danger_sign" | "watch_sign";

type Props = {
  named: Named;
  title: string;
  body?: string;
};

const TONE: Record<Named, string> = {
  offline: "bg-warn-soft text-warn",
  no_facility_response: "bg-today-soft text-today",
  redirected: "bg-watch-soft text-watch",
  stale_information: "bg-warn-soft text-warn",
  incomplete_assessment: "bg-warn-soft text-warn",
  weak_connection: "bg-warn-soft text-warn",
  danger_sign: "bg-urgent-soft text-urgent",
  watch_sign: "bg-watch-soft text-watch",
};

export function Warning({ named, title, body }: Props) {
  return (
    <aside
      className={`rounded-2xl px-4 py-3 ${TONE[named]}`}
      role="status"
      data-named-state={named}
    >
      <p className="text-[0.8rem] font-medium uppercase tracking-[0.12em]">{named.replaceAll("_", " ")}</p>
      <p className="mt-1 font-semibold leading-snug">{title}</p>
      {body ? <p className="mt-1 text-[0.95rem] font-normal leading-snug opacity-90">{body}</p> : null}
    </aside>
  );
}
