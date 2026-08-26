export type Locale = "en" | "sw";

/** v1 UI is English. Kiswahili is stubbed for household copy and falls back. */
export const locale: Locale = "en";

const en = {
  whoQuestion: "Who needs help?",
  whoSelf: "Me",
  whoAdult: "An adult at home",
  whoChild: "A child",
  whoUnknown: "I'm not sure",
  whatQuestion: "What is happening?",
  whatHint: "Say it the way you would tell a neighbour.",
  whatPlaceholder: "Fever, coughing, not drinking…",
  whatContinue: "Continue",
  speak: "Speak",
  type: "Type",
  photo: "Photo",
  speakUnavailable: "Speaking isn't available on this device. Type instead.",
  photoAttached: "Photo attached",
  photoRemove: "Remove photo",
  dontKnow: "I don't know",
  awakeQuestion: "Are they awake and responding?",
  awakeAlert: "Yes, alert",
  awakeSleepy: "Sleepy or confused",
  awakeNotWaking: "Not waking up",
  breathingQuestion: "How is their breathing?",
  breathingFine: "Breathing looks fine",
  breathingDifficult: "Fast or hard to breathe",
  breathingSevere: "Struggling to breathe",
  drinkingQuestion: "Can they drink?",
  drinkingQuestionChild: "Can they drink or breastfeed?",
  drinkingYes: "Yes",
  drinkingLittle: "Only a little",
  drinkingNo: "No",
  durationQuestion: "How long has this been going on?",
  durationToday: "Started today",
  durationTwoDays: "1–2 days",
  durationLonger: "Longer than that",
  mainProblemQuestion: "What is the main problem right now?",
  mainBreathing: "Breathing",
  mainFever: "Fever",
  mainInjury: "Injury or bleeding",
  mainStomach: "Stomach or not eating",
  mainOther: "Something else",
  goNow: "Go now",
  getCareToday: "Get care today",
  monitorAtHome: "Monitor at home",
  needOneMore: "I need one more answer",
  goNowStatus: "This looks urgent. Do not wait.",
  getCareStatus: "They should be seen today, not next week.",
  monitorStatus: "Stay home for now, and watch these signs.",
  needOneMoreStatus: "One question would make this safer.",
  prepareFacility: "Get a facility ready",
  answerTheQuestion: "Answer the question",
  whyThis: "Why this?",
  moreDetail: "More detail",
  startEncounter: "Start encounter",
  noEncounter: "No active encounter",
  noEncounterDetail: "Start one to capture what is happening, then decide.",
  noIncoming: "No incoming referral",
  noIncomingDetail: "When a household or CHP sends one, it appears here.",
  otherActions: "Other actions",
  redirect: "Redirect",
  askMore: "Ask more",
  back: "Previous",
  outcomeQuestion: "What happened?",
  outcomeTreated: "Seen and treated",
  outcomeHigher: "Needed a higher facility",
  outcomeNoShow: "Did not arrive",
  viewingAs: "Viewing as",
  disclaimer:
    "Not a substitute for emergency services or professional medical care.",
};

const sw: Partial<typeof en> = {
  whoQuestion: "Nani anahitaji msaada?",
  whoSelf: "Mimi",
  whoAdult: "Mtu mzima nyumbani",
  whoChild: "Mtoto",
  whoUnknown: "Sina uhakika",
  whatQuestion: "Nini kinaendelea?",
  dontKnow: "Sijui",
  goNow: "Nenda sasa",
  getCareToday: "Pata matibabu leo",
  monitorAtHome: "Angalia nyumbani",
  needOneMore: "Nahitaji jibu moja zaidi",
};

export type CopyKey = keyof typeof en;

export function t(key: CopyKey, loc: Locale = locale): string {
  if (loc === "sw" && sw[key]) {
    return sw[key] as string;
  }
  return en[key];
}

export const copy = en;
