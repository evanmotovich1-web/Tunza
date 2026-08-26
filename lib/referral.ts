import { facilityById, pickFacility, redirectFacility } from "./facilities";
import { createId, nowIso } from "./ids";
import type { DecisionKind, Referral, ReferralStage, Role } from "./types";

export const REFERRAL_STAGES: ReferralStage[] = [
  "prepared",
  "sent",
  "received",
  "accepted",
  "traveling",
  "arrived",
  "completed",
  "outcome_returned",
];

export type ReferralAction =
  | "send"
  | "receive"
  | "accept"
  | "travel"
  | "arrive"
  | "complete"
  | "return_outcome"
  | "redirect"
  | "ask_more";

const STAGE_AFTER: Record<ReferralAction, ReferralStage | null> = {
  send: "sent",
  receive: "received",
  accept: "accepted",
  travel: "traveling",
  arrive: "arrived",
  complete: "completed",
  return_outcome: "outcome_returned",
  redirect: "sent",
  ask_more: "received",
};

export type ReferralView = {
  headline: string;
  status: string;
  actionLabel: string | null;
  arrivalMinutes: number | null;
};

export function createReferral(input: {
  encounterId: string;
  urgent: boolean;
  by: Role;
}): Referral {
  const facility = pickFacility(input.urgent);
  const at = nowIso();
  return {
    id: createId("ref"),
    encounterId: input.encounterId,
    stage: "prepared",
    facilityId: facility.id,
    expectedArrivalMinutes: facility.travelMinutes,
    queued: false,
    failure: null,
    askMore: null,
    outcome: null,
    history: [{ stage: "prepared", at, by: input.by }],
    createdAt: at,
    updatedAt: at,
  };
}

export function canPerform(
  referral: Referral,
  action: ReferralAction,
): boolean {
  const { stage } = referral;

  switch (action) {
    case "send":
      return stage === "prepared";
    case "receive":
      return stage === "sent";
    case "accept":
      return stage === "sent" || stage === "received";
    case "travel":
      return stage === "accepted";
    case "arrive":
      return stage === "traveling";
    case "complete":
      return stage === "arrived";
    case "return_outcome":
      return stage === "completed";
    case "redirect":
      return stage === "sent" || stage === "received" || stage === "accepted";
    case "ask_more":
      return stage === "sent" || stage === "received";
    default:
      return false;
  }
}

export function applyReferralAction(
  referral: Referral,
  action: ReferralAction,
  by: Role,
  options: {
    offline: boolean;
    noFacilityResponse: boolean;
    weakConnection: boolean;
    outcome?: string;
  },
): Referral {
  const at = nowIso();

  if (action === "send" && options.offline) {
    return {
      ...referral,
      queued: true,
      failure: "offline",
      updatedAt: at,
    };
  }

  if (action === "send" && options.noFacilityResponse) {
    return {
      ...referral,
      stage: "sent",
      queued: false,
      failure: "no_facility_response",
      history: [...referral.history, { stage: "sent", at, by }],
      updatedAt: at,
    };
  }

  if (action === "send") {
    const failure = options.weakConnection ? "weak_connection" : null;
    return {
      ...referral,
      stage: "sent",
      queued: false,
      failure,
      history: [...referral.history, { stage: "sent", at, by }],
      updatedAt: at,
    };
  }

  if (action === "redirect") {
    const nextFacility = redirectFacility(referral.facilityId);
    return {
      ...referral,
      stage: "sent",
      facilityId: nextFacility.id,
      expectedArrivalMinutes: nextFacility.travelMinutes,
      failure: "redirected",
      askMore: null,
      history: [
        ...referral.history,
        {
          stage: "sent",
          at,
          by,
          note: `Redirected to ${nextFacility.name}`,
        },
      ],
      updatedAt: at,
    };
  }

  if (action === "ask_more") {
    return {
      ...referral,
      stage: "received",
      askMore: "Can they walk into the facility?",
      history: [
        ...referral.history,
        {
          stage: "received",
          at,
          by,
          note: "Facility asked for more information",
        },
      ],
      updatedAt: at,
    };
  }

  if (action === "accept") {
    const receivedHistory =
      referral.stage === "sent"
        ? [...referral.history, { stage: "received" as const, at, by }]
        : referral.history;
    return {
      ...referral,
      stage: "accepted",
      failure: referral.failure === "no_facility_response" ? null : referral.failure,
      queued: false,
      history: [...receivedHistory, { stage: "accepted", at, by }],
      updatedAt: at,
    };
  }

  if (action === "return_outcome") {
    return {
      ...referral,
      stage: "outcome_returned",
      outcome: options.outcome ?? "Seen and treated",
      history: [...referral.history, { stage: "outcome_returned", at, by }],
      updatedAt: at,
    };
  }

  const stage = STAGE_AFTER[action];
  if (!stage) {
    return referral;
  }

  return {
    ...referral,
    stage,
    history: [...referral.history, { stage, at, by }],
    updatedAt: at,
  };
}

export function describeReferral(
  role: Role,
  referral: Referral,
  decisionKind: DecisionKind | null,
): ReferralView {
  const facility = facilityById(referral.facilityId);
  const urgent = decisionKind === "go_now";
  const minutes = referral.expectedArrivalMinutes;

  if (referral.queued || referral.failure === "offline") {
    if (role === "household") {
      return {
        headline: "Saved on this phone",
        status: "You're offline. The referral will send when you're back.",
        actionLabel: "Send to the facility",
        arrivalMinutes: null,
      };
    }
    if (role === "chp") {
      return {
        headline: "Referral queued — offline",
        status: "It is on this device. Send when the connection returns.",
        actionLabel: "Send referral",
        arrivalMinutes: null,
      };
    }
  }

  if (referral.failure === "no_facility_response" && referral.stage === "sent") {
    if (role === "facility") {
      return {
        headline: "New referral — not yet reviewed",
        status: `${facility.name} has not responded.`,
        actionLabel: "Accept",
        arrivalMinutes: null,
      };
    }
    if (role === "household") {
      return {
        headline: "No facility response",
        status: "Stay where you can travel when they answer.",
        actionLabel: null,
        arrivalMinutes: null,
      };
    }
    return {
      headline: "No facility response",
      status: "Referral sent — the facility has not answered.",
      actionLabel: null,
      arrivalMinutes: null,
    };
  }

  switch (referral.stage) {
    case "prepared":
      if (role === "household") {
        return {
          headline: "A facility is being prepared",
          status: "Nothing has been sent yet.",
          actionLabel: urgent ? "Send now" : "Send to the facility",
          arrivalMinutes: null,
        };
      }
      if (role === "chp") {
        return {
          headline: "Referral prepared — not sent yet",
          status: `Ready for ${facility.name}.`,
          actionLabel: "Send referral",
          arrivalMinutes: null,
        };
      }
      return {
        headline: "A community referral is being prepared",
        status: "It has not reached this facility yet.",
        actionLabel: null,
        arrivalMinutes: null,
      };
    case "sent":
      if (role === "household") {
        return {
          headline: "Your referral is on the way",
          status: `${facility.name} has not answered yet.`,
          actionLabel: null,
          arrivalMinutes: null,
        };
      }
      if (role === "chp") {
        return {
          headline: "Referral sent — waiting for the facility",
          status: `${facility.name} has not accepted yet.`,
          actionLabel: null,
          arrivalMinutes: null,
        };
      }
      return {
        headline: "New referral — not yet reviewed",
        status: "Decide whether this facility can take them.",
        actionLabel: "Accept",
        arrivalMinutes: null,
      };
    case "received":
      if (role === "household") {
        return {
          headline: "The facility has seen your referral",
          status: "They have not accepted yet. Stay ready.",
          actionLabel: null,
          arrivalMinutes: null,
        };
      }
      if (role === "chp") {
        return {
          headline: "Facility received referral — not yet accepted",
          status: `${facility.name} is deciding now.`,
          actionLabel: null,
          arrivalMinutes: null,
        };
      }
      return {
        headline: "Referral received — decide now",
        status: "Accept, redirect, or ask for one missing fact.",
        actionLabel: "Accept",
        arrivalMinutes: null,
      };
    case "accepted":
      if (role === "household") {
        return {
          headline: "Facility accepted — you can leave now",
          status: `Go to ${facility.name}.`,
          actionLabel: "We've left",
          arrivalMinutes: minutes,
        };
      }
      if (role === "chp") {
        return {
          headline: "Referral accepted — patient travel not yet confirmed",
          status: `${facility.name} is waiting for them to leave.`,
          actionLabel: "They have left",
          arrivalMinutes: minutes,
        };
      }
      return {
        headline: urgent
          ? "Incoming urgent referral"
          : "Incoming referral",
        status: "Prepare to receive them.",
        actionLabel: null,
        arrivalMinutes: minutes,
      };
    case "traveling":
      if (role === "household") {
        return {
          headline: "You're on the way. They know you're coming.",
          status: `Tell them you are the Tunza referral at ${facility.name}.`,
          actionLabel: "We've arrived",
          arrivalMinutes: minutes,
        };
      }
      if (role === "chp") {
        return {
          headline: "Patient traveling — arrival not yet confirmed",
          status: `${facility.name} is expecting them.`,
          actionLabel: null,
          arrivalMinutes: minutes,
        };
      }
      return {
        headline: "Patient en route — prepare to receive",
        status: "Keep the receiving place ready.",
        actionLabel: "They're here",
        arrivalMinutes: minutes,
      };
    case "arrived":
      if (role === "household") {
        return {
          headline: "You've arrived. Tell them you're the Tunza referral.",
          status: "Stay until they have seen you.",
          actionLabel: null,
          arrivalMinutes: null,
        };
      }
      if (role === "chp") {
        return {
          headline: "Patient arrived — outcome not yet returned",
          status: "The visit has not been closed.",
          actionLabel: null,
          arrivalMinutes: null,
        };
      }
      return {
        headline: "Patient here — start care",
        status: "The person has arrived.",
        actionLabel: "Complete visit",
        arrivalMinutes: null,
      };
    case "completed":
      if (role === "household") {
        return {
          headline: "Care is finished. Waiting to hear what happened.",
          status: "The outcome has not come back yet.",
          actionLabel: null,
          arrivalMinutes: null,
        };
      }
      if (role === "chp") {
        return {
          headline: "Visit completed — waiting for outcome",
          status: "Follow-up depends on what the facility returns.",
          actionLabel: null,
          arrivalMinutes: null,
        };
      }
      return {
        headline: "Visit complete — return the outcome",
        status: "The community needs to know what happened.",
        actionLabel: "Return what happened",
        arrivalMinutes: null,
      };
    case "outcome_returned":
      if (role === "household") {
        return {
          headline: "Here's what happened, and what to do next",
          status: referral.outcome ?? "The facility returned an outcome.",
          actionLabel: null,
          arrivalMinutes: null,
        };
      }
      if (role === "chp") {
        return {
          headline: "Outcome returned — follow-up may be needed",
          status: referral.outcome ?? "Review whether this household needs a visit.",
          actionLabel: null,
          arrivalMinutes: null,
        };
      }
      return {
        headline: "Outcome sent to the community",
        status: referral.outcome ?? "Returned.",
        actionLabel: null,
        arrivalMinutes: null,
      };
  }
}

export function followUpItems(
  role: Role,
  referral: Referral | null,
  decisionKind: DecisionKind | null,
): { id: string; label: string; detail?: string }[] {
  if (role !== "chp") {
    return [];
  }
  if (decisionKind === "monitor_at_home" && !referral) {
    return [
      {
        id: "watch-home",
        label: "Demo household — watch for danger signs",
        detail: "They were advised to stay home. Check they still can drink and wake.",
      },
    ];
  }
  if (referral?.stage === "accepted") {
    return [
      {
        id: "confirm-travel",
        label: "Travel not yet confirmed",
        detail: "Facility accepted. Confirm whether the household has left.",
      },
    ];
  }
  if (referral?.stage === "outcome_returned") {
    return [
      {
        id: "post-outcome",
        label: "Demo household — follow up after care",
        detail: referral.outcome ?? "Confirm they are improving at home.",
      },
    ];
  }
  return [];
}
