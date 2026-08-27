import { describe, expect, it } from "vitest";
import { decodeGeohashCenter, encodeGeohash } from "../lib/geohash";
import { haversineKm, mapPlaceType, rankPlaces } from "../lib/places";

describe("haversineKm", () => {
  it("is zero for identical points", () => {
    expect(haversineKm(-6.8, 39.28, -6.8, 39.28)).toBe(0);
  });

  it("matches a known city-pair distance", () => {
    // Dar es Salaam to Dodoma: ~388 km great-circle.
    const km = haversineKm(-6.7924, 39.2083, -6.1731, 35.7419);
    expect(km).toBeCloseTo(388, -1);
  });

  it("is symmetric", () => {
    const ab = haversineKm(-6.79, 39.2, -3.36, 36.68);
    const ba = haversineKm(-3.36, 36.68, -6.79, 39.2);
    expect(ab).toBeCloseTo(ba, 6);
  });
});

describe("mapPlaceType", () => {
  it("maps hospital-family types to hospital", () => {
    expect(mapPlaceType(["hospital"])).toBe("hospital");
    expect(mapPlaceType(["general_hospital"])).toBe("hospital");
    expect(mapPlaceType(["medical_center", "point_of_interest"])).toBe("hospital");
  });

  it("maps pharmacy-family types to pharmacy", () => {
    expect(mapPlaceType(["pharmacy"])).toBe("pharmacy");
    expect(mapPlaceType(["drugstore", "store"])).toBe("pharmacy");
  });

  it("maps clinic-family types to clinic", () => {
    expect(mapPlaceType(["doctor"])).toBe("clinic");
    expect(mapPlaceType(["medical_clinic"])).toBe("clinic");
  });

  it("falls back to clinic for unknown or empty types", () => {
    expect(mapPlaceType([])).toBe("clinic");
    expect(mapPlaceType(["restaurant", "store"])).toBe("clinic");
  });

  it("prefers hospital over pharmacy when both are present", () => {
    expect(mapPlaceType(["pharmacy", "hospital"])).toBe("hospital");
  });
});

describe("geohash", () => {
  it("encodes a known vector", () => {
    // Classic geohash test point (Jutland lighthouse).
    expect(encodeGeohash(57.64911, 10.40744, 5)).toBe("u4pru");
  });

  it("round-trips within a precision-5 cell", () => {
    const points: [number, number][] = [
      [-1.2921, 36.8219], // Nairobi
      [-6.7924, 39.2083],
      [0, 0],
      [57.64911, 10.40744],
    ];
    for (const [lat, lng] of points) {
      const center = decodeGeohashCenter(encodeGeohash(lat, lng, 5));
      expect(Math.abs(center.lat - lat)).toBeLessThan(0.05);
      expect(Math.abs(center.lng - lng)).toBeLessThan(0.05);
    }
  });
});

describe("rankPlaces", () => {
  it("ranks by distance from the device's precise position", () => {
    const ranked = rankPlaces(
      [
        { name: "Far", types: ["hospital"], lat: -1.5, lng: 37.1, address: "" },
        { name: "Near", types: ["pharmacy"], lat: -1.3, lng: 36.83, address: "" },
      ],
      -1.2921,
      36.8219,
    );
    expect(ranked.map((p) => p.name)).toEqual(["Near", "Far"]);
    expect(ranked[0].category).toBe("pharmacy");
    expect(ranked[0].km).toBeLessThan(ranked[1].km);
  });
});
