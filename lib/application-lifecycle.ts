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

type ApplicationLifecycleRecord = {
  stage: string;
  timeline: ApplicationTimelineEvent[];
};

const stageOrder = ["Saved", "Applied", "OA", "Interview", "Offer"];

export function applicationReachedStage(
  application: ApplicationLifecycleRecord,
  stage: string,
) {
  if (application.timeline.some((event) => event.stage === stage)) return true;
  if (application.stage === "Rejected") return false;
  return stageOrder.indexOf(application.stage) >= stageOrder.indexOf(stage);
}

export function calculateLifecycleMetrics(
  applications: ApplicationLifecycleRecord[],
) {
  let assessmentsCompleted = 0;
  let interviewsCompleted = 0;

  for (const application of applications) {
    const detailedEvents = application.timeline.filter((event) => event.event);
    if (detailedEvents.length) {
      assessmentsCompleted += detailedEvents.filter(
        (event) => event.event === "Online assessment completed",
      ).length;
      interviewsCompleted += detailedEvents.filter(
        (event) => event.event === "Interview completed",
      ).length;
    } else {
      // Preserve useful totals for records created before detailed milestones existed.
      if (applicationReachedStage(application, "OA")) assessmentsCompleted += 1;
      if (applicationReachedStage(application, "Interview")) interviewsCompleted += 1;
    }
  }

  return {
    applicationsSubmitted: applications.filter((application) =>
      applicationReachedStage(application, "Applied"),
    ).length,
    assessmentsCompleted,
    interviewsCompleted,
    offersReceived: applications.filter((application) =>
      applicationReachedStage(application, "Offer"),
    ).length,
  };
}
