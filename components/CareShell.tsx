"use client";

import { DemoChrome } from "@/components/DemoChrome";
import { t } from "@/lib/copy";
import { useCare } from "@/lib/store";
import type { ReactNode } from "react";

export function CareShell({ children }: { children: ReactNode }) {
  const { state } = useCare();
  return (
    <div className="min-h-dvh bg-ground text-ink">
      <div className="mx-auto flex min-h-dvh max-w-[430px] flex-col bg-paper shadow-[0_0_0_1px_rgba(28,25,22,0.06)]">
        <DemoChrome />
        <main className="flex flex-1 flex-col px-5 py-5">{children}</main>
        <footer className="px-5 pb-6 pt-2">
          <p className="text-center text-caption text-ink-soft">
            {t("disclaimer", state.locale)}
          </p>
        </footer>
      </div>
    </div>
  );
}
