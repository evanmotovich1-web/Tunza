/**
 * Health-worker access gate, checked server-side. A placeholder for real
 * worker identity (eCHIS/registry sign-up): codes come from env; until real
 * codes are configured, well-known demo codes work so the prototype can be
 * walked. Codes are never shipped to the client.
 */

const DEMO_CODES: Record<string, string> = {
  chp: "CHP-DEMO",
  facility: "FACILITY-DEMO",
};

function expectedCode(role: string): { code: string; demo: boolean } | null {
  if (role !== "chp" && role !== "facility") return null;
  const configured =
    role === "chp"
      ? process.env.CHP_ACCESS_CODE
      : process.env.FACILITY_ACCESS_CODE;
  if (configured && configured.trim()) {
    return { code: configured.trim(), demo: false };
  }
  return { code: DEMO_CODES[role], demo: true };
}

/** Whether the gate is running on demo codes (no real codes configured). */
export async function GET() {
  return Response.json({
    demo:
      !process.env.CHP_ACCESS_CODE?.trim() ||
      !process.env.FACILITY_ACCESS_CODE?.trim(),
  });
}

export async function POST(req: Request) {
  let body: { role?: string; code?: string };
  try {
    body = (await req.json()) as { role?: string; code?: string };
  } catch {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }

  const expected = body.role ? expectedCode(body.role) : null;
  if (!expected || typeof body.code !== "string") {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }

  const granted =
    body.code.trim().toUpperCase() === expected.code.toUpperCase();
  return Response.json({ granted, demo: expected.demo });
}
