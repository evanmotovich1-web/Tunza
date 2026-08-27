const MAX_AUDIO_BYTES = 5_000_000;

// Voice transcription, ported from the earlier Tunza app: audio goes to
// OpenAI Whisper with the assessment language. The key never leaves the
// server; when it is not configured the route says so plainly (503) and the
// client degrades to on-device speech recognition, then to typing.

/** Capability probe so the client can pick a voice path without recording first. */
export async function GET() {
  return Response.json({ configured: Boolean(process.env.OPENAI_API_KEY) });
}

export async function POST(req: Request) {
  const form = await req.formData();
  const audio = form.get("audio");
  const language = form.get("language") === "sw" ? "sw" : "en";

  if (!(audio instanceof Blob) || audio.size === 0) {
    return Response.json({ error: "No audio provided." }, { status: 400 });
  }

  if (audio.size > MAX_AUDIO_BYTES) {
    return Response.json(
      { error: "Audio file is too large (max 5 MB)." },
      { status: 413 },
    );
  }

  if (!process.env.OPENAI_API_KEY) {
    return Response.json(
      { error: "Transcription service is not configured." },
      { status: 503 },
    );
  }

  const body = new FormData();
  body.append(
    "file",
    new File([audio], "audio.webm", { type: audio.type || "audio/webm" }),
  );
  body.append("model", "whisper-1");
  body.append("language", language);

  let upstream: Response;
  try {
    upstream = await fetch("https://api.openai.com/v1/audio/transcriptions", {
      method: "POST",
      headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
      body,
    });
  } catch {
    return Response.json(
      { error: "Could not reach transcription service." },
      { status: 502 },
    );
  }

  if (!upstream.ok) {
    return Response.json({ error: "Transcription failed." }, { status: 502 });
  }

  const { text } = (await upstream.json()) as { text: string };
  return Response.json({ text });
}
