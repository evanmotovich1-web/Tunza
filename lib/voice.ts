import type { Locale } from "./copy";
import { speechSupported, startSpeech } from "./speech";

/**
 * One voice path for the "what is happening" answer, ported from the earlier
 * Tunza app's recorder. Picks the best route available and degrades by design:
 * server Whisper (when online and /api/transcribe is configured) → on-device
 * speech recognition → "type instead". The UI stays a single tap-to-speak.
 */

export type VoiceState = "listening" | "transcribing" | "stopped" | "unavailable";

export type VoiceHandle = { stop: () => void };

const MAX_RECORDING_MS = 60_000;
const UPLOAD_TIMEOUT_MS = 30_000;

let configuredCache: Promise<boolean> | null = null;

export function transcribeConfigured(): Promise<boolean> {
  if (!configuredCache) {
    configuredCache = fetch("/api/transcribe")
      .then((res) =>
        res.ok
          ? res.json().then((data: { configured?: boolean }) => !!data.configured)
          : false,
      )
      .catch(() => false);
  }
  return configuredCache;
}

function recorderSupported(): boolean {
  return (
    typeof navigator !== "undefined" &&
    typeof navigator.mediaDevices?.getUserMedia === "function" &&
    typeof MediaRecorder !== "undefined"
  );
}

export function voiceAvailable(): boolean {
  return recorderSupported() || speechSupported();
}

export function startVoice(opts: {
  locale: Locale;
  online: boolean;
  onText: (text: string) => void;
  onState: (state: VoiceState) => void;
}): VoiceHandle {
  let cancelled = false;
  let stopCurrent: (() => void) | null = null;

  const handle: VoiceHandle = {
    stop: () => {
      cancelled = true;
      stopCurrent?.();
    },
  };

  const beginBrowserRecognition = () => {
    let gotText = false;
    const speech = startSpeech(
      (text) => {
        gotText = true;
        opts.onText(text);
      },
      // Recognition that ends without capturing anything (and was not stopped
      // by the user) failed — surface the designed "type instead" state.
      () => opts.onState(cancelled || gotText ? "stopped" : "unavailable"),
      opts.locale,
    );
    if (!speech) {
      opts.onState("unavailable");
      return;
    }
    stopCurrent = speech.stop;
    opts.onState("listening");
    if (cancelled) speech.stop();
  };

  const start = async () => {
    const useServer =
      opts.online && recorderSupported() && (await transcribeConfigured());
    if (cancelled) {
      opts.onState("stopped");
      return;
    }
    if (!useServer) {
      beginBrowserRecognition();
      return;
    }

    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch {
      opts.onState("unavailable");
      return;
    }
    if (cancelled) {
      stream.getTracks().forEach((track) => track.stop());
      opts.onState("stopped");
      return;
    }

    const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
      ? "audio/webm;codecs=opus"
      : "";
    const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
    const chunks: Blob[] = [];
    const maxTimer = window.setTimeout(() => recorder.stop(), MAX_RECORDING_MS);

    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) chunks.push(event.data);
    };
    recorder.onstop = async () => {
      window.clearTimeout(maxTimer);
      stream.getTracks().forEach((track) => track.stop());
      const blob = new Blob(chunks, { type: mimeType || "audio/webm" });
      if (cancelled && blob.size === 0) {
        opts.onState("stopped");
        return;
      }
      if (blob.size === 0) {
        opts.onState("stopped");
        return;
      }
      opts.onState("transcribing");
      const form = new FormData();
      form.append(
        "audio",
        new File([blob], "audio.webm", { type: blob.type || "audio/webm" }),
      );
      form.append("language", opts.locale);
      const ctrl = new AbortController();
      const timer = window.setTimeout(() => ctrl.abort(), UPLOAD_TIMEOUT_MS);
      try {
        const res = await fetch("/api/transcribe", {
          method: "POST",
          body: form,
          signal: ctrl.signal,
        });
        if (!res.ok) throw new Error(`transcribe failed (${res.status})`);
        const { text } = (await res.json()) as { text: string };
        const trimmed = text.trim();
        if (trimmed) opts.onText(trimmed);
        opts.onState("stopped");
      } catch {
        opts.onState("unavailable");
      } finally {
        window.clearTimeout(timer);
      }
    };

    stopCurrent = () => {
      if (recorder.state === "recording") recorder.stop();
    };
    recorder.start();
    opts.onState("listening");
  };

  void start();
  return handle;
}
