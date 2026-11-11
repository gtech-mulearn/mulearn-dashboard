import { describe, expect, it } from "vitest";
import type { JobFormValues } from "../schemas/jobs.schema";
import { buildCreateJobPayload, buildUpdateJobPayload } from "./job-payload";

const base: JobFormValues = {
  title: "Frontend intern",
  job_type: "Internship",
  location: "Remote",
  salary_range: "",
  experience: "Fresher",
  job_description: "Build UI for the muLearn dashboard.",
  stipend: "10000",
  hourly_rate: "",
  deliverables: [],
  certificate_provided: false,
  expires_at: "",
};

describe("job payload — application deadline", () => {
  it("sends a set deadline as a UTC ISO timestamp", () => {
    const local = "2026-12-01T18:30";
    expect(
      buildCreateJobPayload({ ...base, expires_at: local }).expires_at,
    ).toBe(new Date(local).toISOString());
  });

  it("leaves it out of a new job when empty", () => {
    expect(buildCreateJobPayload(base).expires_at).toBeUndefined();
  });

  it("clears it on update when emptied", () => {
    expect(buildUpdateJobPayload(base).expires_at).toBeNull();
  });
});
