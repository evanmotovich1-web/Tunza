export type SpeechHandle = {
  start: () => void;
  stop: () => void;
};

type RecognitionLike = {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  onresult: ((event: { results: { [index: number]: { [index: number]: { transcript: string } } } }) => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
  start: () => void;
  stop: () => void;
};

type SpeechWindow = Window & {
  SpeechRecognition?: new () => RecognitionLike;
  webkitSpeechRecognition?: new () => RecognitionLike;
};

export function speechSupported(): boolean {
  if (typeof window === "undefined") {
    return false;
  }
  const speechWindow = window as SpeechWindow;
  return Boolean(speechWindow.SpeechRecognition || speechWindow.webkitSpeechRecognition);
}

export function startSpeech(onText: (text: string) => void, onStop: () => void): SpeechHandle | null {
  if (typeof window === "undefined") {
    return null;
  }
  const speechWindow = window as SpeechWindow;
  const Ctor = speechWindow.SpeechRecognition || speechWindow.webkitSpeechRecognition;
  if (!Ctor) {
    return null;
  }
  const recognition = new Ctor() as RecognitionLike;
  recognition.lang = "en-KE";
  recognition.interimResults = false;
  recognition.continuous = false;
  recognition.onresult = (event) => {
    const transcript = event.results[0]?.[0]?.transcript;
    if (transcript) {
      onText(transcript);
    }
  };
  recognition.onend = () => onStop();
  recognition.onerror = () => onStop();
  try {
    recognition.start();
  } catch {
    onStop();
    return null;
  }
  return {
    start: () => recognition.start(),
    stop: () => recognition.stop(),
  };
}
