import { describe, expect, it } from "vitest";
import { classifyMail } from "./mail-classification";
describe("mail metadata classification", () => {
  it.each([["Your interview with Acme", "interview"], ["HackerRank coding test invitation", "assessment"], ["We are pleased to offer you the role", "offer"], ["Unfortunately we are not moving forward", "rejection"], ["Thank you for applying", "application"], ["LinkedIn Jobs for you", "job_alert"]])("classifies %s", (subject, expected) => { expect(classifyMail(subject).category).toBe(expected); });
  it("does not turn arbitrary personal mail into career activity", () => { expect(classifyMail("Dinner this Friday?")).toEqual({ category: "other", confidence: 35 }); });
});
