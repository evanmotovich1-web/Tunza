import { t, type Locale } from "./copy";
import type { NamedFailure } from "./types";

export type NamedWarning = NamedFailure | "danger_sign" | "watch_sign";

export type WarningCopy = {
  named: NamedWarning;
  eyebrow: string;
  title: string;
  body: string;
};

/** Failure states are designed states: each has a name, a title, and a next step. */
export function warningCopy(named: NamedWarning, locale: Locale): WarningCopy {
  switch (named) {
    case "offline":
      return {
        named,
        eyebrow: t("failOfflineEyebrow", locale),
        title: t("failOfflineTitle", locale),
        body: t("failOfflineBody", locale),
      };
    case "no_facility_response":
      return {
        named,
        eyebrow: t("failNoResponseEyebrow", locale),
        title: t("failNoResponseTitle", locale),
        body: t("failNoResponseBody", locale),
      };
    case "redirected":
      return {
        named,
        eyebrow: t("failRedirectedEyebrow", locale),
        title: t("failRedirectedTitle", locale),
        body: t("failRedirectedBody", locale),
      };
    case "stale_information":
      return {
        named,
        eyebrow: t("failStaleEyebrow", locale),
        title: t("failStaleTitle", locale),
        body: t("failStaleBody", locale),
      };
    case "incomplete_assessment":
      return {
        named,
        eyebrow: t("failIncompleteEyebrow", locale),
        title: t("failIncompleteTitle", locale),
        body: t("failIncompleteBody", locale),
      };
    case "weak_connection":
      return {
        named,
        eyebrow: t("failWeakEyebrow", locale),
        title: t("failWeakTitle", locale),
        body: t("failWeakBody", locale),
      };
    case "danger_sign":
      return {
        named,
        eyebrow: t("dangerEyebrow", locale),
        title: t("dangerTitle", locale),
        body: t("dangerBody", locale),
      };
    case "watch_sign":
      return {
        named,
        eyebrow: t("watchEyebrow", locale),
        title: t("watchTitle", locale),
        body: "",
      };
  }
}
