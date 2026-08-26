"use client";

import { CareShell } from "@/components/CareShell";
import { ChpSurface } from "@/components/surfaces/ChpSurface";
import { FacilitySurface } from "@/components/surfaces/FacilitySurface";
import { HouseholdSurface } from "@/components/surfaces/HouseholdSurface";
import { CareProvider, useCare } from "@/lib/store";

export function CareApp() {
  return (
    <CareProvider>
      <CareShell>
        <ActiveSurface />
      </CareShell>
    </CareProvider>
  );
}

function ActiveSurface() {
  const { state, hydrated } = useCare();

  if (!hydrated) {
    return <p className="font-medium text-ink-soft">Loading…</p>;
  }

  if (state.role === "chp") {
    return <ChpSurface />;
  }
  if (state.role === "facility") {
    return <FacilitySurface />;
  }
  return <HouseholdSurface />;
}
