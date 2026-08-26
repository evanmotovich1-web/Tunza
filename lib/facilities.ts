import type { Facility } from "./types";

/** Clearly fake demo facilities — not real sites. */
export const DEMO_FACILITIES: Facility[] = [
  {
    id: "north-demo",
    name: "North Demo Health Centre",
    travelMinutes: 42,
    canHandleUrgent: true,
    services: ["Urgent care", "Under-5", "Observation"],
  },
  {
    id: "west-demo",
    name: "West Demo Sub-County Hospital",
    travelMinutes: 70,
    canHandleUrgent: true,
    services: ["Emergency", "Theatre", "Maternity"],
  },
];

export function facilityById(id: string): Facility {
  const found = DEMO_FACILITIES.find((item) => item.id === id);
  if (!found) {
    return DEMO_FACILITIES[0];
  }
  return found;
}

export function pickFacility(urgent: boolean): Facility {
  if (urgent) {
    return DEMO_FACILITIES.find((item) => item.canHandleUrgent) ?? DEMO_FACILITIES[0];
  }
  return DEMO_FACILITIES[0];
}

export function redirectFacility(currentId: string): Facility {
  return DEMO_FACILITIES.find((item) => item.id !== currentId) ?? DEMO_FACILITIES[1];
}
