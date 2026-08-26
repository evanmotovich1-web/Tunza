"use client";

import { useEffect, useRef, useState } from "react";
import { AssessmentQuestion, type EntryMode } from "@/components/AssessmentQuestion";
import { Warning } from "@/components/Warning";
import { t } from "@/lib/copy";
import { warningCopy } from "@/lib/failures";
import { questionContent, dontKnowValue } from "@/lib/questions";
import { speechSupported, startSpeech } from "@/lib/speech";
import { activeFailures, useCare } from "@/lib/store";

export function AssessmentFlow() {
  const { state, dispatch } = useCare();
  const encounter = state.encounter;
  const question = encounter?.currentQuestion;
  const locale = state.locale;
  const [mode, setMode] = useState<EntryMode>("type");
  const [listening, setListening] = useState(false);
  const [speakMessage, setSpeakMessage] = useState<string | undefined>();
  const speechRef = useRef<{ stop: () => void } | null>(null);

  useEffect(() => {
    return () => {
      speechRef.current?.stop();
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

  function onDontKnow() {
    dispatch.answer(currentQuestion, dontKnowValue(currentQuestion));
  }

  function onSpeak() {
    if (!speechSupported()) {
      setSpeakMessage(t("speakUnavailable", locale));
      setMode("type");
      return;
    }
    if (listening) {
      speechRef.current?.stop();
      setListening(false);
      return;
    }
    setSpeakMessage(undefined);
    setListening(true);
    const handle = startSpeech(
      (text) => {
        const next = currentEncounter.answers.presentation
          ? `${currentEncounter.answers.presentation} ${text}`
          : text;
        dispatch.setPresentation(next);
      },
      () => setListening(false),
      locale,
    );
    speechRef.current = handle;
    if (!handle) {
      setListening(false);
      setSpeakMessage(t("speakUnavailable", locale));
    }
  }

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
                listening,
                speakAvailable: speechSupported(),
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
