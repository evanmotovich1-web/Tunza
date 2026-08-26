import { describe, expect, it } from "vitest";
import { applyReferralAction, createReferral, describeReferral } from "../lib/referral";
import type { Referral } from "../lib/types";

function acceptedUrgent(): Referral {
  const prepared = createReferral({
    encounterId: "enc-demo",
    urgent: true,
    by: "household",
  });
  const sent = applyReferralAction(prepared, "send", "household", {
    offline: false,
    noFacilityResponse: false,
    weakConnection: false,
  });
  return applyReferralAction(sent, "accept", "facility", {
    offline: false,
    noFacilityResponse: false,
    weakConnection: false,
  });
}

describe("referral object", () => {
  it("starts prepared and can move through the care path", () => {
    const prepared = createReferral({
      encounterId: "enc-demo",
      urgent: true,
      by: "household",
    });
    expect(prepared.stage).toBe("prepared");
    expect(prepared.expectedArrivalMinutes).toBe(42);

    const sent = applyReferralAction(prepared, "send", "household", {
      offline: false,
      noFacilityResponse: false,
      weakConnection: false,
    });
    expect(sent.stage).toBe("sent");

    const accepted = applyReferralAction(sent, "accept", "facility", {
      offline: false,
      noFacilityResponse: false,
      weakConnection: false,
    });
    expect(accepted.stage).toBe("accepted");
    expect(accepted.history.map((entry) => entry.stage)).toEqual([
      "prepared",
      "sent",
      "received",
      "accepted",
    ]);
  });

  it("queues send when offline instead of dropping the path", () => {
    const prepared = createReferral({
      encounterId: "enc-demo",
      urgent: true,
      by: "household",
    });
    const queued = applyReferralAction(prepared, "send", "household", {
      offline: true,
      noFacilityResponse: false,
      weakConnection: false,
    });
    expect(queued.stage).toBe("prepared");
    expect(queued.queued).toBe(true);
    expect(queued.failure).toBe("offline");
  });

  it("names no facility response on send", () => {
    const prepared = createReferral({
      encounterId: "enc-demo",
      urgent: true,
      by: "household",
    });
    const sent = applyReferralAction(prepared, "send", "household", {
      offline: false,
      noFacilityResponse: true,
      weakConnection: false,
    });
    expect(sent.stage).toBe("sent");
    expect(sent.failure).toBe("no_facility_response");
  });
});

describe("same event, different words", () => {
  it("translates accepted for each role using the locked phrases", () => {
    const referral = acceptedUrgent();

    expect(describeReferral("household", referral, "go_now").headline).toBe(
      "Facility accepted — you can leave now",
    );
    expect(describeReferral("chp", referral, "go_now").headline).toBe(
      "Referral accepted — patient travel not yet confirmed",
    );

    const facility = describeReferral("facility", referral, "go_now");
    expect(facility.headline).toBe("Incoming urgent referral");
    expect(facility.arrivalMinutes).toBe(42);
  });
});
