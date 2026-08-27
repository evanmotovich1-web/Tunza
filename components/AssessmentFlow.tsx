"use client";

import { useEffect, useRef, useState } from "react";
import { AssessmentQuestion, type EntryMode } from "@/components/AssessmentQuestion";
import { Warning } from "@/components/Warning";
import { t } from "@/lib/copy";
import { warningCopy } from "@/lib/failures";
import { questionContent, dontKnowValue } from "@/lib/questions";
import { startVoice, voiceAvailable, type VoiceHandle, type VoiceState } from "@/lib/voice";
import { activeFailures, useCare } from "@/lib/store";

export function AssessmentFlow() {
  const { state, dispatch } = useCare();
  const encounter = state.encounter;
  const question = encounter?.currentQuestion;
  const locale = state.locale;
  const [mode, setMode] = useState<EntryMode>("type");
  const [voiceState, setVoiceState] = useState<Exclude<VoiceState, "unavailable" | "stopped"> | "idle">("idle");
  const [speakMessage, setSpeakMessage] = useState<string | undefined>();
  const voiceRef = useRef<VoiceHandle | null>(null);

  useEffect(() => {
    return () => {
      voiceRef.current?.stop();
    };
  }, []);

  if (!encounter || !question) {
    return null;
  }

  const content = questionContent(question, encounter.answers.who, locale);
  const currentQuestion = question;
  const currentEncounter = encounter;
  const canGoBack = currentEncounter.asked.length > 0 || Boolean(currentEncounter.decision);
  const failures = activeFailures(state, null).filter(
    (named) =>
      named === "offline" ||
      named === "weak_connection" ||
      named === "incomplete_assessment",
  );
  const offline = failures.includes("offline");

  function onDontKnow() {
    dispatch.answer(currentQuestion, dontKnowValue(currentQuestion));
  }

  function onSpeak() {
    if (voiceState === "transcribing") {
      return;
    }
    if (voiceState === "listening") {
      voiceRef.current?.stop();
      return;
    }
    if (!voiceAvailable()) {
      setSpeakMessage(t("speakUnavailable", locale));
      setMode("type");
      return;
    }
    setSpeakMessage(undefined);
    voiceRef.current = startVoice({
      locale,
      online: !offline,
      onText: (text) => {
        const current = currentEncounter.answers.presentation;
        dispatch.setPresentation(current ? `${current} ${text}` : text);
      },
      onState: (next) => {
        if (next === "listening" || next === "transcribing") {
          setVoiceState(next);
          return;
        }
        setVoiceState("idle");
        if (next === "unavailable") {
          setSpeakMessage(t("speakUnavailable", locale));
          setMode("type");
        }
      },
    });
  }

  const speakLabel =
    voiceState === "listening"
      ? t("listening", locale)
      : voiceState === "transcribing"
        ? t("transcribing", locale)
        : voiceAvailable()
          ? t("tapToSpeak", locale)
          : t("speakNotAvailable", locale);

  return (
    <div className="flex flex-col gap-4">
      {failures.map((named) => {
        const copy = warningCopy(named, locale);
        return (
          <Warning
            key={named}
            named={named}
            eyebrow={copy.eyebrow}
            title={copy.title}
            body={copy.body}
          />
        );
      })}
      {canGoBack ? (
        <button
          type="button"
          onClick={dispatch.goBack}
          className="self-start text-label font-medium text-ink-soft"
        >
          {t("back", locale)}
        </button>
      ) : null}

      <AssessmentQuestion
        locale={locale}
        question={content.question}
        hint={content.hint}
        choices={content.choices}
        dontKnowLabel={
          currentQuestion === "who" ? t("whoUnknown", locale) : t("dontKnow", locale)
        }
        onDontKnow={onDontKnow}
        onChoose={(id) => dispatch.answer(currentQuestion, id)}
        action={
          currentQuestion === "what"
            ? {
                label: t("whatContinue", locale),
                disabled:
                  currentEncounter.answers.presentation.trim().length === 0 &&
                  !currentEncounter.answers.photoAttached,
                onClick: () =>
                  dispatch.answer("what", currentEncounter.answers.presentation.trim()),
              }
            : undefined
        }
        entry={
          currentQuestion === "what"
            ? {
                mode,
                onMode: setMode,
                text: currentEncounter.answers.presentation,
                onText: dispatch.setPresentation,
                listening: voiceState !== "idle",
                speakAvailable: voiceAvailable(),
                speakLabel,
                onSpeak,
                speakMessage,
                photoAttached: currentEncounter.answers.photoAttached,
                onPhoto: dispatch.setPhoto,
              }
            : undefined
        }
      />
    </div>
  );
}
