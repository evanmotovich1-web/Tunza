/** V1 care-path component. Reused across household, CHP, and facility. */

export type Choice = {
  id: string;
  label: string;
};

export type EntryMode = "type" | "speak" | "photo";

type EntryProps = {
  mode: EntryMode;
  onMode: (mode: EntryMode) => void;
  text: string;
  onText: (text: string) => void;
  listening: boolean;
  speakAvailable: boolean;
  onSpeak: () => void;
  speakMessage?: string;
  photoAttached: boolean;
  onPhoto: (attached: boolean) => void;
};

type Props = {
  question: string;
  hint?: string;
  choices?: Choice[];
  dontKnowLabel: string;
  onDontKnow: () => void;
  onChoose?: (id: string) => void;
  action?: { label: string; disabled?: boolean; onClick: () => void };
  entry?: EntryProps;
};

export function AssessmentQuestion({
  question,
  hint,
  choices = [],
  dontKnowLabel,
  onDontKnow,
  onChoose,
  action,
  entry,
}: Props) {
  return (
    <section className="flex flex-col gap-5">
      <header className="flex flex-col gap-2">
        <h1 className="text-[1.65rem] font-semibold leading-tight tracking-tight text-ink">
          {question}
        </h1>
        {hint ? <p className="text-[0.95rem] leading-snug text-ink-soft">{hint}</p> : null}
      </header>

      {entry ? <EntryControls {...entry} /> : null}

      {choices.length > 0 ? (
        <div className="flex flex-col gap-2" role="group" aria-label={question}>
          {choices.map((choice) => (
            <button
              key={choice.id}
              type="button"
              className="min-h-14 rounded-2xl border border-line bg-raised px-4 py-3 text-left text-[1.05rem] font-medium text-ink shadow-[0_1px_0_rgba(28,25,22,0.04)] transition hover:border-ink/30 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-action"
              onClick={() => onChoose?.(choice.id)}
            >
              {choice.label}
            </button>
          ))}
        </div>
      ) : null}

      {action ? (
        <button
          type="button"
          disabled={action.disabled}
          onClick={action.onClick}
          className="min-h-14 rounded-2xl bg-action px-4 text-[1.05rem] font-semibold text-action-ink disabled:cursor-not-allowed disabled:opacity-40"
        >
          {action.label}
        </button>
      ) : null}

      <button
        type="button"
        onClick={onDontKnow}
        className="min-h-12 rounded-2xl border border-dashed border-ink/25 bg-transparent px-4 py-3 text-left text-[1rem] font-normal text-ink-soft"
      >
        {dontKnowLabel}
      </button>
    </section>
  );
}

function EntryControls({
  mode,
  onMode,
  text,
  onText,
  listening,
  speakAvailable,
  onSpeak,
  speakMessage,
  photoAttached,
  onPhoto,
}: EntryProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-3 gap-1 rounded-xl bg-line/70 p-1" role="tablist" aria-label="How to answer">
        {(["speak", "type", "photo"] as EntryMode[]).map((item) => (
          <button
            key={item}
            type="button"
            role="tab"
            aria-selected={mode === item}
            onClick={() => onMode(item)}
            className={`min-h-10 rounded-lg text-[0.9rem] font-medium capitalize ${
              mode === item ? "bg-raised text-ink shadow-sm" : "text-ink-soft"
            }`}
          >
            {item}
          </button>
        ))}
      </div>

      {mode === "speak" ? (
        <div className="flex flex-col gap-3">
          <button
            type="button"
            onClick={onSpeak}
            className="min-h-14 rounded-2xl border border-line bg-raised px-4 text-left text-[1.05rem] font-semibold text-ink"
          >
            {listening ? "Listening…" : speakAvailable ? "Tap to speak" : "Speak isn’t available"}
          </button>
          {speakMessage ? <p className="text-sm text-ink-soft">{speakMessage}</p> : null}
          {text ? <p className="rounded-xl bg-raised px-3 py-2 text-ink">{text}</p> : null}
        </div>
      ) : null}

      {mode === "type" ? (
        <label className="flex flex-col gap-2">
          <span className="text-sm font-medium text-ink-soft">Type what you see</span>
          <textarea
            value={text}
            onChange={(event) => onText(event.target.value)}
            rows={4}
            className="resize-none rounded-2xl border border-line bg-raised px-4 py-3 text-[1.05rem] leading-snug text-ink outline-none focus:border-action"
            placeholder="Fever, coughing, not drinking…"
          />
        </label>
      ) : null}

      {mode === "photo" ? (
        <div className="flex flex-col gap-3">
          <label className="min-h-14 rounded-2xl border border-line bg-raised px-4 py-3 text-[1.05rem] font-medium text-ink">
            {photoAttached ? "Photo attached (demo)" : "Take or choose a photo"}
            <input
              type="file"
              accept="image/*"
              capture="environment"
              className="sr-only"
              onChange={(event) => {
                const file = event.target.files?.[0];
                onPhoto(Boolean(file));
              }}
            />
          </label>
          {photoAttached ? (
            <button
              type="button"
              className="text-left text-sm font-medium text-ink-soft underline"
              onClick={() => onPhoto(false)}
            >
              Remove photo
            </button>
          ) : (
            <p className="text-sm text-ink-soft">
              Use this when a rash, wound, or breathing effort is easier to show than to describe.
            </p>
          )}
          <label className="flex flex-col gap-2">
            <span className="text-sm font-medium text-ink-soft">Add a short note if you can</span>
            <textarea
              value={text}
              onChange={(event) => onText(event.target.value)}
              rows={2}
              className="resize-none rounded-2xl border border-line bg-raised px-4 py-3 text-[1.05rem] text-ink outline-none focus:border-action"
            />
          </label>
        </div>
      ) : null}
    </div>
  );
}
