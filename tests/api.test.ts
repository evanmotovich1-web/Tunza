import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { GET as facilitiesGet } from "../app/api/facilities/route";
import { GET as transcribeGet, POST as transcribePost } from "../app/api/transcribe/route";

const savedEnv = {
  openai: process.env.OPENAI_API_KEY,
  places: process.env.GOOGLE_PLACES_API_KEY,
};

beforeEach(() => {
  delete process.env.OPENAI_API_KEY;
  delete process.env.GOOGLE_PLACES_API_KEY;
});

afterEach(() => {
  if (savedEnv.openai) process.env.OPENAI_API_KEY = savedEnv.openai;
  if (savedEnv.places) process.env.GOOGLE_PLACES_API_KEY = savedEnv.places;
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
