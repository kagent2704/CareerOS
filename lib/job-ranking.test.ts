import { describe, expect, it } from "vitest";
import { isRelevantJob, normalizedTerms, rankJob } from "./job-ranking";
const job = { role: "Backend Engineer", location: "Bengaluru, India", skills: "TypeScript, PostgreSQL, APIs", description: "Build distributed services in a hybrid team." };
describe("job ranking", () => {
  it("gives stronger evidence more weight", () => { expect(rankJob(job, ["Backend Engineer"], ["Bengaluru"], ["TypeScript", "PostgreSQL"])).toBeGreaterThan(rankJob(job, ["Designer"], ["London"], ["Figma"])); });
  it("caps scores below false certainty", () => { expect(rankJob(job, ["Backend Engineer", "Engineer", "Backend"], ["India", "Bengaluru"], ["TypeScript", "PostgreSQL", "APIs", "services", "distributed", "hybrid", "team"])).toBe(98); });
  it("accepts a matching remote role but rejects an unrelated remote role", () => { expect(isRelevantJob({ ...job, location: "Remote" }, ["Backend Engineer"], ["India"])).toBe(true); expect(isRelevantJob({ ...job, role: "Graphic Designer", description: "Remote brand design" }, ["Backend Engineer"], ["India"])).toBe(false); });
  it("normalizes search terms", () => { expect(normalizedTerms("Node.js / C++ and Go")).toEqual(["node.js", "c++", "and"]); });
});
