import { FACILITY_SEARCH_RADIUS_M, INCLUDED_TYPES, type NearbyPlace } from "@/lib/places";

const PLACES_URL = "https://places.googleapis.com/v1/places:searchNearby";

// Mandatory field mask — controls billing cost. Request nothing more.
const FIELD_MASK =
  "places.displayName,places.types,places.location,places.formattedAddress";

function parseCoord(value: string | null, max: number): number | null {
  if (value === null) return null;
  const n = Number(value);
  if (!Number.isFinite(n) || Math.abs(n) > max) return null;
  return n;
}

interface PlacesResult {
  places?: Array<{
    displayName?: { text?: string };
    types?: string[];
    location?: { latitude?: number; longitude?: number };
    formattedAddress?: string;
  }>;
}

// Stateless proxy, ported from the earlier Tunza app: receives ONLY the coarse
// geohash cell center (lat/lng), calls Google Places (New), returns a
// normalized facility list. No DB, no logging of coordinates — the server
// stays location-blind. The API key never leaves the server, and raw Google
// errors are never forwarded.
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const lat = parseCoord(searchParams.get("lat"), 90);
  const lng = parseCoord(searchParams.get("lng"), 180);
  if (lat === null || lng === null) {
    return Response.json({ error: "Invalid coordinates." }, { status: 400 });
  }

  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) {
    return Response.json(
      { error: "Facility lookup is not configured." },
      { status: 503 },
    );
  }

  const languageCode = searchParams.get("lang") === "sw" ? "sw" : "en";

  let upstream: Response;
  try {
    upstream = await fetch(PLACES_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask": FIELD_MASK,
      },
      body: JSON.stringify({
        includedTypes: INCLUDED_TYPES,
        maxResultCount: 10,
        rankPreference: "DISTANCE",
        languageCode,
        locationRestriction: {
          circle: {
            center: { latitude: lat, longitude: lng },
            radius: FACILITY_SEARCH_RADIUS_M,
          },
        },
      }),
    });
  } catch {
    return Response.json({ error: "Facility lookup failed." }, { status: 502 });
  }

  if (!upstream.ok) {
    return Response.json({ error: "Facility lookup failed." }, { status: 502 });
  }

  const data = (await upstream.json()) as PlacesResult;

  const facilities: NearbyPlace[] = (data.places ?? [])
    .map((p) => ({
      name: p.displayName?.text ?? "",
      types: p.types ?? [],
      lat: p.location?.latitude ?? NaN,
      lng: p.location?.longitude ?? NaN,
      address: p.formattedAddress ?? "",
    }))
    .filter((f) => f.name && Number.isFinite(f.lat) && Number.isFinite(f.lng));

  return Response.json({ facilities });
}
