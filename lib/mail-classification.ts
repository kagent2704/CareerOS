export type MailCategory =
  | "application"
  | "interview"
  | "assessment"
  | "offer"
  | "rejection"
  | "job_alert"
  | "other";
const rules: Array<[MailCategory, RegExp]> = [
  ["offer", /offer letter|pleased to offer|employment offer/],
  ["interview", /interview|schedule a call|meeting with.*hiring/],
  ["assessment", /assessment|coding test|online test|hackerrank|codility/],
  ["rejection", /unfortunately|not moving forward|other candidates/],
  [
    "application",
    /application received|thank you for applying|application status/,
  ],
  ["job_alert", /job alert|jobs for you|new jobs|linkedin jobs/],
];
export function classifyMail(subject: string, sender = "") {
  const hit = rules.find(([, pattern]) =>
    pattern.test(`${subject} ${sender}`.toLowerCase()),
  );
  return {
    category: (hit?.[0] || "other") as MailCategory,
    confidence: hit ? 88 : 35,
  };
}
