import { describe, expect, it } from "vitest";
import {
  mergeRecordedMilestone,
  shouldAdvanceCurrentStage,
} from "./application-lifecycle";

const applied = {
  stage: "Applied",
  at: "2026-09-01T10:00:00.000Z",
  note: "Application added",
};
const oaCompleted = {
  stage: "OA",
  event: "Online assessment completed",
  current_stage: "OA",
  at: "2026-09-03T10:00:00.000Z",
  note: "HackerRank submitted",
};

describe("application lifecycle", () => {
  it("replaces the database trigger's generic transition with the detailed milestone", () => {
    const generic = {
      stage: "OA",
      at: "2026-09-03T10:01:00.000Z",
      note: "Stage changed",
    };
    expect(mergeRecordedMilestone([applied, generic], true, oaCompleted)).toEqual([
      applied,
      oaCompleted,
    ]);
  });

  it("keeps multiple milestones within the same current stage", () => {
    expect(mergeRecordedMilestone([applied], false, oaCompleted)).toEqual([
      applied,
      oaCompleted,
    ]);
  });

  it("does not roll a final outcome backward when an older milestone is backfilled", () => {
    const rejected = {
      stage: "Rejected",
      at: "2026-09-10T10:00:00.000Z",
      note: "Application rejected",
    };
    expect(
      shouldAdvanceCurrentStage(
        [applied, rejected],
        "2026-09-05T10:00:00.000Z",
      ),
    ).toBe(false);
    expect(
      shouldAdvanceCurrentStage(
        [applied, rejected],
        "2026-09-11T10:00:00.000Z",
      ),
    ).toBe(true);
  });
});
