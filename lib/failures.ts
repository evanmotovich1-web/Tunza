import type { NamedFailure } from "./types";

export type WarningCopy = {
  named: NamedFailure | "danger_sign" | "watch_sign";
  title: string;
  body: string;
};

export const FAILURE_COPY: Record<NamedFailure, WarningCopy> = {
  offline: {
    named: "offline",
    title: "You're offline",
    body: "The assessment still works on this phone. Sending a referral waits until you are back.",
  },
  no_facility_response: {
    named: "no_facility_response",
    title: "No facility response",
    body: "The referral left this phone. The facility has not answered. Stay where you can travel when they do.",
  },
  redirected: {
    named: "redirected",
    title: "Redirected to another facility",
    body: "This place cannot take them. Another facility is now on the referral.",
  },
  stale_information: {
    named: "stale_information",
    title: "This information may be stale",
    body: "A recorded value is too old to drive today's decision the same way as a fresh one.",
  },
  incomplete_assessment: {
    named: "incomplete_assessment",
    title: "This assessment is incomplete",
    body: "There is not enough information to make this decision safely. One more answer is required.",
  },
  weak_connection: {
    named: "weak_connection",
    title: "Weak connection",
    body: "This may take longer. The care path stays on this phone until the send is confirmed.",
  },
};

export const DANGER_WARNING: WarningCopy = {
  named: "danger_sign",
  title: "Danger sign",
  body: "Do not wait at home with this sign.",
};

export const WATCH_WARNING: WarningCopy = {
  named: "watch_sign",
  title: "Go now if this starts",
  body: "Not waking, hard breathing, cannot drink, seizure, or heavy bleeding.",
};
