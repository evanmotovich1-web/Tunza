"use client";

import { useEffect, useRef, useState } from "react";
import { AssessmentQuestion, type EntryMode } from "@/components/AssessmentQuestion";
import { Warning } from "@/components/Warning";
import { copy } from "@/lib/copy";
import { FAILURE_COPY } from "@/lib/failures";
import { questionContent, dontKnowValue } from "@/lib/questions";
import { speechSupported, startSpeech } from "@/lib/speech";
import { activeFailures, useCare } from "@/lib/store";

export function AssessmentFlow() {
  const { state, dispatch } = useCare();
  const encounter = state.encounter;
  const question = encounter?.currentQuestion;
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

  const content = questionContent(question, encounter.answers.who);
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
      setSpeakMessage(copy.speakUnavailable);
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
    );
    speechRef.current = handle;
    if (!handle) {
      setListening(false);
      setSpeakMessage(copy.speakUnavailable);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {failures.map((named) => (
        <Warning
          key={named}
          named={named}
          title={FAILURE_COPY[named].title}
          body={FAILURE_COPY[named].body}
        />
      ))}
      {canGoBack ? (
        <button
          type="button"
          onClick={dispatch.goBack}
          className="self-start text-sm font-medium text-ink-soft"
        >
          {copy.back}
        </button>
      ) : null}

      <AssessmentQuestion
        question={content.question}
        hint={content.hint}
        choices={content.choices}
        dontKnowLabel={currentQuestion === "who" ? copy.whoUnknown : copy.dontKnow}
        onDontKnow={onDontKnow}
        onChoose={(id) => dispatch.answer(currentQuestion, id)}
        action={
          currentQuestion === "what"
            ? {
                label: copy.whatContinue,
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
