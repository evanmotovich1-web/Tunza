"use client";

import { copy } from "@/lib/copy";
import { FAILURE_COPY } from "@/lib/failures";
import { INJECTABLE_FAILURES, useCare } from "@/lib/store";
import type { NamedFailure, Role } from "@/lib/types";

const ROLES: { id: Role; label: string }[] = [
  { id: "household", label: "Household" },
  { id: "chp", label: "CHP" },
  { id: "facility", label: "Facility" },
];

export function DemoChrome() {
  const { state, dispatch, offline } = useCare();

  return (
    <header className="sticky top-0 z-10 border-b border-line/80 bg-paper/95 px-5 py-3 backdrop-blur">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[1.05rem] font-semibold tracking-tight text-ink">Tunza</p>
        <p className="text-sm font-medium text-ink-soft">
          {copy.viewingAs} {roleLabel(state.role)}
        </p>
      </div>
      <details className="mt-2">
        <summary className="cursor-pointer text-sm font-medium text-ink-soft">
          Demo
        </summary>
        <div className="mt-3 flex flex-col gap-3">
          <div className="grid grid-cols-3 gap-1 rounded-xl bg-line/70 p-1">
            {ROLES.map((role) => (
              <button
                key={role.id}
                type="button"
                onClick={() => dispatch.setRole(role.id)}
                className={`min-h-10 rounded-lg text-sm font-medium ${
                  state.role === role.id ? "bg-raised text-ink shadow-sm" : "text-ink-soft"
                }`}
              >
                {role.label}
              </button>
            ))}
          </div>
          <p className="text-xs font-medium uppercase tracking-[0.12em] text-ink-soft">
            Named conditions
          </p>
          <div className="flex flex-col gap-1">
            {INJECTABLE_FAILURES.map((failure) => (
              <label key={failure} className="flex items-center gap-2 text-sm text-ink">
                <input
                  type="checkbox"
                  checked={isActive(failure, state.injectedFailures, offline)}
                  onChange={() => dispatch.toggleFailure(failure)}
                  className="size-4 accent-action"
                />
                <span className="font-medium">{FAILURE_COPY[failure].title}</span>
              </label>
            ))}
          </div>
          <button
            type="button"
            onClick={dispatch.reset}
            className="min-h-10 self-start text-sm font-medium text-ink-soft underline"
          >
            Start over
          </button>
        </div>
      </details>
    </header>
  );
}

function roleLabel(role: Role): string {
  return ROLES.find((item) => item.id === role)?.label ?? role;
}

function isActive(
  failure: NamedFailure,
  injected: NamedFailure[],
  offline: boolean,
): boolean {
  if (failure === "offline") {
    return offline || injected.includes("offline");
  }
  return injected.includes(failure);
}
