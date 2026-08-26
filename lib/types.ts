export type Role = "household" | "chp" | "facility";

export type ReferralStage =
  | "prepared"
  | "sent"
  | "received"
  | "accepted"
  | "traveling"
  | "arrived"
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

export type Decision = {
  kind: DecisionKind;
  reasons: string[];
  dangerSigns: string[];
  watchSigns: string[];
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
  askMore: string | null;
  outcome: string | null;
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
  injectedFailures: NamedFailure[];
  encounter: Encounter | null;
  referral: Referral | null;
  online: boolean;
};
