/**
 * Self-contained geohash encode / cell-center decode (base32, no dependency).
 * Precision 5 ≈ 5 km cells — coarse enough to keep location private while
 * still useful for nearby lookups. The facility finder sends the server only
 * the cell CENTER; the device's precise position never leaves the browser.
 */

const BASE32 = "0123456789bcdefghjkmnpqrstuvwxyz";

export function encodeGeohash(
  latitude: number,
  longitude: number,
  precision = 5,
): string {
  let latMin = -90;
  let latMax = 90;
  let lngMin = -180;
  let lngMax = 180;
  let hash = "";
  let bits = 0;
  let value = 0;
  let evenBit = true;

  while (hash.length < precision) {
    if (evenBit) {
      const mid = (lngMin + lngMax) / 2;
      if (longitude >= mid) {
        value = value * 2 + 1;
        lngMin = mid;
      } else {
        value = value * 2;
        lngMax = mid;
      }
    } else {
      const mid = (latMin + latMax) / 2;
      if (latitude >= mid) {
        value = value * 2 + 1;
        latMin = mid;
      } else {
        value = value * 2;
        latMax = mid;
      }
    }
    evenBit = !evenBit;
    bits += 1;
    if (bits === 5) {
      hash += BASE32[value];
      bits = 0;
      value = 0;
    }
  }
  return hash;
}

export function decodeGeohashCenter(geohash: string): { lat: number; lng: number } {
  let latMin = -90;
  let latMax = 90;
  let lngMin = -180;
  let lngMax = 180;
  let evenBit = true;

  for (const char of geohash.toLowerCase()) {
    const index = BASE32.indexOf(char);
    if (index === -1) {
      continue;
    }
    for (let bit = 4; bit >= 0; bit -= 1) {
      const on = (index >> bit) & 1;
      if (evenBit) {
        const mid = (lngMin + lngMax) / 2;
        if (on) lngMin = mid;
        else lngMax = mid;
      } else {
        const mid = (latMin + latMax) / 2;
        if (on) latMin = mid;
        else latMax = mid;
      }
      evenBit = !evenBit;
    }
  }
  return { lat: (latMin + latMax) / 2, lng: (lngMin + lngMax) / 2 };
}
