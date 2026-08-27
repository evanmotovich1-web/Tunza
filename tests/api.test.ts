import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { GET as accessGet, POST as accessPost } from "../app/api/access/route";
import { GET as facilitiesGet } from "../app/api/facilities/route";
import { GET as transcribeGet, POST as transcribePost } from "../app/api/transcribe/route";

const savedEnv = {
  openai: process.env.OPENAI_API_KEY,
  places: process.env.GOOGLE_PLACES_API_KEY,
  chp: process.env.CHP_ACCESS_CODE,
  facility: process.env.FACILITY_ACCESS_CODE,
};

beforeEach(() => {
  delete process.env.OPENAI_API_KEY;
  delete process.env.GOOGLE_PLACES_API_KEY;
  delete process.env.CHP_ACCESS_CODE;
  delete process.env.FACILITY_ACCESS_CODE;
});

afterEach(() => {
  if (savedEnv.openai) process.env.OPENAI_API_KEY = savedEnv.openai;
  if (savedEnv.places) process.env.GOOGLE_PLACES_API_KEY = savedEnv.places;
  if (savedEnv.chp) process.env.CHP_ACCESS_CODE = savedEnv.chp;
  if (savedEnv.facility) process.env.FACILITY_ACCESS_CODE = savedEnv.facility;
});

function accessRequest(body: unknown): Request {
  return new Request("http://test/api/access", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("/api/access", () => {
  it("reports demo mode while no real codes are configured", async () => {
    const res = await accessGet();
    expect(await res.json()).toEqual({ demo: true });
  });

  it("grants the demo codes, case-insensitively, in demo mode", async () => {
    const chp = await accessPost(accessRequest({ role: "chp", code: "chp-demo" }));
    expect(await chp.json()).toEqual({ granted: true, demo: true });
    const facility = await accessPost(
      accessRequest({ role: "facility", code: "FACILITY-DEMO" }),
    );
    expect(await facility.json()).toEqual({ granted: true, demo: true });
  });

  it("refuses a wrong code", async () => {
    const res = await accessPost(accessRequest({ role: "chp", code: "nope" }));
    expect(await res.json()).toEqual({ granted: false, demo: true });
  });

  it("rejects an unknown role or missing code", async () => {
    expect((await accessPost(accessRequest({ role: "admin", code: "x" }))).status).toBe(400);
    expect((await accessPost(accessRequest({ role: "chp" }))).status).toBe(400);
  });

  it("uses the configured code and retires the demo code", async () => {
    process.env.CHP_ACCESS_CODE = "REAL-CODE-1";
    const demo = await accessPost(accessRequest({ role: "chp", code: "CHP-DEMO" }));
    expect(await demo.json()).toEqual({ granted: false, demo: false });
    const real = await accessPost(accessRequest({ role: "chp", code: "real-code-1" }));
    expect(await real.json()).toEqual({ granted: true, demo: false });
  });
});

describe("/api/transcribe", () => {
  it("reports unconfigured through the capability probe", async () => {
    const res = await transcribeGet();
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ configured: false });
  });

  it("rejects a request without audio", async () => {
    const form = new FormData();
    form.append("language", "sw");
    const res = await transcribePost(
      new Request("http://test/api/transcribe", { method: "POST", body: form }),
    );
    expect(res.status).toBe(400);
  });

  it("rejects oversized audio before touching the network", async () => {
    const form = new FormData();
    form.append("audio", new Blob([new Uint8Array(5_000_001)], { type: "audio/webm" }));
    const res = await transcribePost(
      new Request("http://test/api/transcribe", { method: "POST", body: form }),
    );
    expect(res.status).toBe(413);
  });

  it("says so plainly when the service is not configured", async () => {
    const form = new FormData();
    form.append("audio", new Blob([new Uint8Array(10)], { type: "audio/webm" }));
    const res = await transcribePost(
      new Request("http://test/api/transcribe", { method: "POST", body: form }),
    );
    expect(res.status).toBe(503);
  });
});

describe("/api/facilities", () => {
  it("rejects invalid coordinates", async () => {
    const res = await facilitiesGet(
      new Request("http://test/api/facilities?lat=999&lng=36.8"),
    );
    expect(res.status).toBe(400);
  });

  it("rejects missing coordinates", async () => {
    const res = await facilitiesGet(new Request("http://test/api/facilities"));
    expect(res.status).toBe(400);
  });

  it("says so plainly when the lookup is not configured", async () => {
    const res = await facilitiesGet(
      new Request("http://test/api/facilities?lat=-1.29&lng=36.82"),
    );
    expect(res.status).toBe(503);
  });
});
