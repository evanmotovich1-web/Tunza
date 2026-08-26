"use client";

import { DemoChrome } from "@/components/DemoChrome";
import { copy } from "@/lib/copy";
import type { ReactNode } from "react";

export function CareShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh bg-[#e8e0d2] text-ink">
      <div className="mx-auto flex min-h-dvh max-w-[430px] flex-col bg-paper shadow-[0_0_0_1px_rgba(28,25,22,0.06)]">
        <DemoChrome />
        <main className="flex-1 px-5 py-5">{children}</main>
        <footer className="px-5 pb-6 pt-2">
          <p className="text-center text-xs leading-snug text-ink-soft">{copy.disclaimer}</p>
        </footer>
      </div>
    </div>
  );
}
