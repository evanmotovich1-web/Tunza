import type { CopyKey } from "./copy";

export type Role = "household" | "chp" | "facility";

/**
 * The canonical referral lifecycle from the README. Internal names never
 * appear on screen; the copy layer translates them per role and language.
 */
export type ReferralStage =
  | "created"
  | "sent"
  | "received"
  | "accepted"
  | "patient_moving"
  | "arrived"
  | "seen"
  | "completed"
  | "outcome_returned";

export type NamedFailure =
  | "offline"
  | "no_facility_response"
  | "redirected"
  | "stale_information"
  | "incomplete_assessment"
  | "weak_connection";

export type DecisionKind =
  | "go_now"
  | "get_care_today"
  | "monitor_at_home"
  | "need_one_more_answer";

export type OutcomeCode =
  | "treated"
  | "referred_onward"
  | "did_not_arrive"
  | "unknown";

export type AskMoreCode = "can_walk";

export type PersonKind = "self" | "household_adult" | "child" | "unknown";

export type QuestionId =
  | "who"
  | "what"
  | "awake"
  | "breathing"
  | "drinking"
  | "duration"
  | "main_problem";

export type AwakeAnswer = "alert" | "sleepy" | "not_waking" | "unknown";
export type BreathingAnswer = "fine" | "difficult" | "severe" | "unknown";
export type DrinkingAnswer = "yes" | "little" | "no" | "unknown";
export type DurationAnswer = "today" | "two_days" | "longer" | "unknown";
export type MainProblemAnswer =
  | "breathing"
  | "fever"
  | "injury"
  | "stomach"
  | "other"
  | "unknown";

export type AssessmentAnswers = {
  who: PersonKind | null;
  presentation: string;
  photoAttached: boolean;
  awake: AwakeAnswer | null;
  breathing: BreathingAnswer | null;
  drinking: DrinkingAnswer | null;
  duration: DurationAnswer | null;
  mainProblem: MainProblemAnswer | null;
};

/** Decisions carry copy keys, not sentences — language is applied at render. */
export type Decision = {
  kind: DecisionKind;
  reasonKeys: CopyKey[];
  dangerSignKeys: CopyKey[];
  watchSignKeys: CopyKey[];
};

export type ReferralHistoryEntry = {
  stage: ReferralStage;
  at: string;
  by: Role;
  note?: string;
};

export type Referral = {
  id: string;
  encounterId: string;
  stage: ReferralStage;
  facilityId: string;
  expectedArrivalMinutes: number;
  queued: boolean;
  failure: NamedFailure | null;
  askMore: AskMoreCode | null;
  outcome: OutcomeCode | null;
  history: ReferralHistoryEntry[];
  createdAt: string;
  updatedAt: string;
};

export type Facility = {
  id: string;
  name: string;
  travelMinutes: number;
  canHandleUrgent: boolean;
  services: string[];
};

export type Encounter = {
  id: string;
  answers: AssessmentAnswers;
  asked: QuestionId[];
  currentQuestion: QuestionId | null;
  decision: Decision | null;
  startedBy: Role;
  createdAt: string;
  updatedAt: string;
};

export type CareState = {
  role: Role;
  locale: "en" | "sw";
  injectedFailures: NamedFailure[];
  encounter: Encounter | null;
  referral: Referral | null;
  online: boolean;
};
