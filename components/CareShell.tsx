"use client";

import { DemoChrome } from "@/components/DemoChrome";
import { t } from "@/lib/copy";
import { useCare } from "@/lib/store";
import type { ReactNode } from "react";

export function CareShell({ children }: { children: ReactNode }) {
  const { state } = useCare();
  // The front door wears the brand edge to edge — chrome and footer included.
  const onBrand = state.role === "household" && state.view === "home";
  return (
    <div
      className={`min-h-dvh ${onBrand ? "bg-brand-deep text-white" : "bg-ground text-ink"}`}
    >
      <div
        className={`mx-auto flex min-h-dvh max-w-[430px] flex-col shadow-[0_0_0_1px_rgba(28,25,22,0.06)] ${
          onBrand ? "bg-linear-to-b from-brand-deep to-action" : "bg-paper"
        }`}
      >
        <DemoChrome />
        <main className="flex flex-1 flex-col px-5 py-5">{children}</main>
        <footer className="px-5 pb-6 pt-2">
          <p
            className={`text-center text-caption ${onBrand ? "text-white/70" : "text-ink-soft"}`}
          >
            {t("disclaimer", state.locale)}
          </p>
        </footer>
      </div>
    </div>
  );
}
