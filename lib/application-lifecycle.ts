export type ApplicationTimelineEvent = {
  stage: string;
  at: string;
  note: string;
  event?: string;
  current_stage?: string;
};

export const applicationMilestones = [
  { value: "saved", label: "Application saved", stage: "Saved" },
  { value: "applied", label: "Application submitted", stage: "Applied" },
  { value: "oa_invited", label: "Online assessment invited", stage: "OA" },
  { value: "oa_completed", label: "Online assessment completed", stage: "OA" },
  { value: "interview_scheduled", label: "Interview scheduled", stage: "Interview" },
  { value: "interview_completed", label: "Interview completed", stage: "Interview" },
  { value: "offer", label: "Offer received", stage: "Offer" },
  { value: "rejected", label: "Application rejected", stage: "Rejected" },
] as const;

export function mergeRecordedMilestone(
  databaseTimeline: ApplicationTimelineEvent[],
  stageChanged: boolean,
  milestone: ApplicationTimelineEvent,
) {
  if (!stageChanged) return [...databaseTimeline, milestone];
  if (!databaseTimeline.length) return [milestone];
  return [...databaseTimeline.slice(0, -1), milestone];
}

export function shouldAdvanceCurrentStage(
  timeline: ApplicationTimelineEvent[],
  milestoneAt: string,
) {
  const milestoneTime = Date.parse(milestoneAt);
  if (!Number.isFinite(milestoneTime)) return false;
  const latestRecordedTime = timeline.reduce((latest, item) => {
    const itemTime = Date.parse(item.at);
    return Number.isFinite(itemTime) ? Math.max(latest, itemTime) : latest;
  }, 0);
  return milestoneTime >= latestRecordedTime;
}
