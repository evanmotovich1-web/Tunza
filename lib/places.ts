import { t, type Locale } from "./copy";

/**
 * Real nearby facilities, ported from the earlier Tunza app's facility finder.
 * These are places without capability truth — name, category, distance — so
 * they inform the Nearby view only. The referral machine keeps using the
 * capability-aware demo facilities until real capability data exists.
 */

export type PlaceCategory = "hospital" | "clinic" | "pharmacy";

export type NearbyPlace = {
  name: string;
  types: string[];
  lat: number;
  lng: number;
  address: string;
};

export type RankedPlace = NearbyPlace & {
  category: PlaceCategory;
  km: number;
};

// API max radius. A strict 5 km radius returns zero in most rural areas, so we
// fetch the nearest-10-regardless and rank by distance client-side.
export const FACILITY_SEARCH_RADIUS_M = 50000;

// Concrete Google Places (New) Table A types we request, grouped by display
// category. `clinic` is intentionally absent — it is not a valid Google type.
const TYPE_GROUPS: Record<PlaceCategory, string[]> = {
  hospital: ["hospital", "general_hospital", "medical_center"],
  pharmacy: ["pharmacy", "drugstore"],
  clinic: [
    "doctor",
    "medical_clinic",
    "dental_clinic",
    "medical_lab",
    "physiotherapist",
  ],
};

export const INCLUDED_TYPES: string[] = Object.values(TYPE_GROUPS).flat();

// Pure: collapse a place's Google types[] to one display category. First match
// wins in the order hospital > pharmacy > clinic; unknown/empty → clinic.
export function mapPlaceType(types: string[]): PlaceCategory {
  const set = new Set(types);
  if (TYPE_GROUPS.hospital.some((type) => set.has(type))) return "hospital";
  if (TYPE_GROUPS.pharmacy.some((type) => set.has(type))) return "pharmacy";
  return "clinic";
}

export function categoryLabel(category: PlaceCategory, locale: Locale): string {
  switch (category) {
    case "hospital":
      return t("facilityHospital", locale);
    case "clinic":
      return t("facilityClinic", locale);
    case "pharmacy":
      return t("facilityPharmacy", locale);
  }
}

// Pure: great-circle distance in km between two lat/lng points (haversine).
export function haversineKm(
  aLat: number,
  aLng: number,
  bLat: number,
  bLng: number,
): number {
  const R = 6371; // Earth radius, km
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(bLat - aLat);
  const dLng = toRad(bLng - aLng);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(aLat)) * Math.cos(toRad(bLat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
}

// Client fetcher: hits our stateless proxy with the coarse cell-center coords
// only. `locale` localizes Google's place names where available.
export async function fetchNearbyPlaces(
  lat: number,
  lng: number,
  locale: Locale,
): Promise<NearbyPlace[]> {
  const params = new URLSearchParams({
    lat: String(lat),
    lng: String(lng),
    lang: locale,
  });
  const res = await fetch(`/api/facilities?${params.toString()}`);
  if (!res.ok) throw new Error(`facilities request failed (${res.status})`);
  const data = (await res.json()) as { facilities?: NearbyPlace[] };
  return data.facilities ?? [];
}

export function rankPlaces(
  places: NearbyPlace[],
  deviceLat: number,
  deviceLng: number,
): RankedPlace[] {
  return places
    .map((place) => ({
      ...place,
      category: mapPlaceType(place.types),
      // Distance from PRECISE coords (never sent to the server) for accuracy.
      km: haversineKm(deviceLat, deviceLng, place.lat, place.lng),
    }))
    .sort((a, b) => a.km - b.km);
}
