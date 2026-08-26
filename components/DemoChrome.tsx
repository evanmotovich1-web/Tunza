"use client";

import { useEffect } from "react";
import { t, type CopyKey } from "@/lib/copy";
import { warningCopy } from "@/lib/failures";
import { INJECTABLE_FAILURES, useCare } from "@/lib/store";
import type { NamedFailure, Role } from "@/lib/types";

const ROLES: { id: Role; labelKey: CopyKey }[] = [
  { id: "household", labelKey: "roleHousehold" },
  { id: "chp", labelKey: "roleChp" },
  { id: "facility", labelKey: "roleFacility" },
];

export function DemoChrome() {
  const { state, dispatch, offline } = useCare();
  const locale = state.locale;

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  return (
    <header className="sticky top-0 z-10 border-b border-line/80 bg-paper/95 px-5 py-3 backdrop-blur">
      <div className="flex items-center justify-between gap-3">
        <p className="text-heading font-semibold tracking-tight text-ink">Tunza</p>
        <div className="flex items-center gap-3">
          <p className="text-label font-medium text-ink-soft">
            {t("viewingAs", locale)}{" "}
            {t(ROLES.find((item) => item.id === state.role)?.labelKey ?? "roleHousehold", locale)}
          </p>
          <button
            type="button"
            onClick={() => dispatch.setLocale(locale === "en" ? "sw" : "en")}
            aria-label={t("languageAria", locale)}
            className="min-h-10 rounded-lg border border-line px-2 text-label font-medium text-ink"
          >
            {t("languageButton", locale)}
          </button>
        </div>
      </div>
      <details className="mt-2">
        <summary className="cursor-pointer text-label font-medium text-ink-soft">
          {t("demoLabel", locale)}
        </summary>
        <div className="mt-3 flex flex-col gap-3">
          <div className="grid grid-cols-3 gap-1 rounded-xl bg-line/70 p-1">
            {ROLES.map((role) => (
              <button
                key={role.id}
                type="button"
                onClick={() => dispatch.setRole(role.id)}
                className={`min-h-10 rounded-lg text-label font-medium ${
                  state.role === role.id ? "bg-raised text-ink shadow-sm" : "text-ink-soft"
                }`}
              >
                {t(role.labelKey, locale)}
              </button>
            ))}
          </div>
          <p className="text-caption font-medium uppercase tracking-[0.12em] text-ink-soft">
            {t("namedConditions", locale)}
          </p>
          <div className="flex flex-col gap-1">
            {INJECTABLE_FAILURES.map((failure) => (
              <label key={failure} className="flex items-center gap-2 text-label text-ink">
                <input
                  type="checkbox"
                  checked={isActive(failure, state.injectedFailures, offline)}
                  onChange={() => dispatch.toggleFailure(failure)}
                  className="size-4 accent-action"
                />
                <span className="font-medium">{warningCopy(failure, locale).title}</span>
              </label>
            ))}
          </div>
          <button
            type="button"
            onClick={dispatch.reset}
            className="min-h-10 self-start text-label font-medium text-ink-soft underline"
          >
            {t("startOver", locale)}
          </button>
        </div>
      </details>
    </header>
  );
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
