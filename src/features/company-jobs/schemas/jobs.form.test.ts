/**
 * Job Creation Wizard — Form Schema & Payload Contract Tests
 *
 * 📍 src/features/company-jobs/schemas/jobs.form.test.ts
 *
 * Every expectation here is derived from the backend source of truth:
 *   - Model:      mulearnbackend/db/job.py            (CompanyJob)
 *   - Serializer: mulearnbackend/api/dashboard/company/job_serializers.py
 *
 * Backend column reference (CompanyJob):
 *   title                CharField(max_length=75)                  REQUIRED
 *   job_type             CharField(max_length=20)                  REQUIRED
 *   experience           CharField(max_length=20, null, blank)
 *   job_description      TextField(null, blank)
 *   location             CharField(max_length=75, null, blank)
 *   salary_range         CharField(max_length=36, null, blank)
 *   duration_value       PositiveSmallIntegerField(null, blank)
 *   duration_unit        CharField(max_length=20, null, blank)
 *   hourly_rate          DecimalField(max_digits=10, decimal_places=2, null, blank)
 *   deliverables         JSONField(null, blank)
 *   stipend              CharField(max_length=75, null, blank)
 *   certificate_provided CharField(max_length=3, null, blank)   # Enum: Yes, No
 *
 * Serializer cross-field rule: duration_value and duration_unit must be
 * supplied together, or not at all.
 */

import { describe, expect, it } from "vitest";
import { buildCreateJobPayload, buildUpdateJobPayload } from "../lib";
// certificate_provided is CharField(max_length=3, null=True, blank=True) —
// optional, so "not offered" is expressed by omitting it, never by "No".
import { JobFormSchema } from "./jobs.schema";

// A salaried job that satisfies every backend constraint.
const validSalaried = {
  title: "Backend Engineer",
  job_type: "Full-Time",
  location: "Kochi",
  salary_range: "12-18 LPA",
  experience: "2-4 years",
  job_description: "Build and maintain our core services and APIs.",
  certificate_provided: false,
  deliverables: [] as string[],
};

const validGig = {
  title: "Landing page revamp",
  job_type: "Gig",
  location: "Remote",
  experience: "Fresher",
  job_description: "Redesign and ship the marketing landing page.",
  hourly_rate: "500",
  duration_value: 3,
  duration_unit: "weeks",
  deliverables: ["Figma file", "Deployed page"],
  certificate_provided: true,
};

const parse = (input: unknown) => JobFormSchema.safeParse(input);

const errorPaths = (input: unknown): string[] => {
  const result = parse(input);
  if (result.success) return [];
  return result.error.issues.map((i) => i.path.join("."));
};

// ─── Backend max_length parity ──────────────────────────────

describe("JobFormSchema — lengths match backend column widths", () => {
  it("rejects a title longer than 75 chars (CharField(75))", () => {
    expect(errorPaths({ ...validSalaried, title: "a".repeat(76) })).toContain(
      "title",
    );
  });

  it("accepts a title of exactly 75 chars", () => {
    expect(
      errorPaths({ ...validSalaried, title: "a".repeat(75) }),
    ).not.toContain("title");
  });

  it("rejects a location longer than 75 chars (CharField(75))", () => {
    expect(
      errorPaths({ ...validSalaried, location: "a".repeat(76) }),
    ).toContain("location");
  });

  it("rejects a salary_range longer than 36 chars (CharField(36))", () => {
    expect(
      errorPaths({ ...validSalaried, salary_range: "a".repeat(37) }),
    ).toContain("salary_range");
  });

  it("rejects an experience longer than 20 chars (CharField(20))", () => {
    expect(
      errorPaths({ ...validSalaried, experience: "a".repeat(21) }),
    ).toContain("experience");
  });

  it("rejects a stipend longer than 75 chars (CharField(75))", () => {
    expect(
      errorPaths({
        ...validSalaried,
        job_type: "Internship",
        salary_range: undefined,
        stipend: "a".repeat(76),
      }),
    ).toContain("stipend");
  });
});

// ─── job_type enum ──────────────────────────────────────────

describe("JobFormSchema — job_type enum", () => {
  it.each([
    "Hybrid",
    "Full-Time",
    "Remote",
    "Part-Time",
  ])("accepts salaried backend job type %s", (job_type) => {
    expect(errorPaths({ ...validSalaried, job_type })).toEqual([]);
  });

  it("rejects a job type outside the backend enum", () => {
    expect(errorPaths({ ...validSalaried, job_type: "Freelance" })).toContain(
      "job_type",
    );
  });

  it("rejects Contract, which the backend enum does not list", () => {
    expect(errorPaths({ ...validSalaried, job_type: "Contract" })).toContain(
      "job_type",
    );
  });
});

// ─── hourly_rate is a DecimalField, not free text ───────────

describe("JobFormSchema — hourly_rate (DecimalField(10, 2))", () => {
  it("rejects currency-formatted text like the old placeholder suggested", () => {
    expect(errorPaths({ ...validGig, hourly_rate: "₹500/hr" })).toContain(
      "hourly_rate",
    );
  });

  it("rejects more than 2 decimal places", () => {
    expect(errorPaths({ ...validGig, hourly_rate: "500.123" })).toContain(
      "hourly_rate",
    );
  });

  it("rejects more than 8 integer digits (max_digits 10 - 2 decimals)", () => {
    expect(errorPaths({ ...validGig, hourly_rate: "123456789" })).toContain(
      "hourly_rate",
    );
  });

  it("accepts a plain decimal", () => {
    expect(errorPaths({ ...validGig, hourly_rate: "499.50" })).toEqual([]);
  });
});

// ─── duration pair rule (serializer.validate) ───────────────

describe("JobFormSchema — duration_value/duration_unit must pair", () => {
  it("rejects a duration value with no unit", () => {
    expect(
      errorPaths({ ...validGig, duration_value: 3, duration_unit: undefined }),
    ).toContain("duration_unit");
  });

  it("rejects a duration unit with no value", () => {
    expect(
      errorPaths({
        ...validGig,
        duration_value: undefined,
        duration_unit: "weeks",
      }),
    ).toContain("duration_value");
  });

  it("rejects a duration unit outside the backend enum", () => {
    expect(errorPaths({ ...validGig, duration_unit: "fortnights" })).toContain(
      "duration_unit",
    );
  });
});

// ─── Conditional requirements by job type ───────────────────

describe("JobFormSchema — compensation required per job type", () => {
  it("requires salary_range for a salaried job", () => {
    expect(errorPaths({ ...validSalaried, salary_range: "" })).toContain(
      "salary_range",
    );
  });

  it("reports the salary_range error even while other fields are still empty", () => {
    // Regression: the old schema used a top-level .refine(), which Zod skips
    // whenever the base object fails — so this error only appeared at submit.
    const paths = errorPaths({
      ...validSalaried,
      salary_range: "",
      experience: "",
      job_description: "",
    });
    expect(paths).toContain("salary_range");
  });

  it("requires hourly_rate for a Gig", () => {
    expect(errorPaths({ ...validGig, hourly_rate: "" })).toContain(
      "hourly_rate",
    );
  });

  it("does not require salary_range for a Gig", () => {
    expect(errorPaths({ ...validGig, salary_range: undefined })).toEqual([]);
  });

  it("requires stipend for an Internship", () => {
    expect(
      errorPaths({
        ...validSalaried,
        job_type: "Internship",
        salary_range: undefined,
        stipend: "",
        duration_value: 6,
        duration_unit: "months",
      }),
    ).toContain("stipend");
  });
});

// ─── Payload contract: form values → backend wire format ────

describe("buildCreateJobPayload — backend wire format", () => {
  it('sends the string "Yes" when a certificate is offered', () => {
    // Root cause of the reported 400: DRF CharField rejects booleans outright
    // with "Not a valid string."
    expect(
      buildCreateJobPayload({ ...validGig, certificate_provided: true }),
    ).toMatchObject({ certificate_provided: "Yes" });
  });

  it("omits certificate_provided when none is offered — it is optional", () => {
    // The column is nullable; sending "No" would record a claim the company
    // never made. Leaving it unset is the truthful state.
    expect(
      buildCreateJobPayload({ ...validGig, certificate_provided: false })
        .certificate_provided,
    ).toBeUndefined();

    expect(
      buildCreateJobPayload({ ...validGig, certificate_provided: undefined })
        .certificate_provided,
    ).toBeUndefined();
  });

  it("never emits a boolean for certificate_provided", () => {
    const payload = buildCreateJobPayload(validGig);
    expect(typeof payload.certificate_provided).not.toBe("boolean");
  });

  it("is never required by the schema, for any job type", () => {
    for (const job_type of ["Full-Time", "Internship", "Gig"]) {
      const base =
        job_type === "Gig"
          ? validGig
          : job_type === "Internship"
            ? {
                ...validSalaried,
                job_type,
                salary_range: undefined,
                stipend: "₹15,000",
              }
            : validSalaried;
      const paths = errorPaths({
        ...base,
        job_type,
        certificate_provided: undefined,
      });
      expect(paths).not.toContain("certificate_provided");
    }
  });

  it("omits fields that do not apply to the chosen job type", () => {
    const payload = buildCreateJobPayload(validSalaried);
    expect(payload.hourly_rate).toBeUndefined();
    expect(payload.stipend).toBeUndefined();
    expect(payload.deliverables).toBeUndefined();
    expect(payload.duration_value).toBeUndefined();
    expect(payload.duration_unit).toBeUndefined();
    expect(payload.certificate_provided).toBeUndefined();
  });

  it("omits salary_range for a Gig", () => {
    const payload = buildCreateJobPayload({
      ...validGig,
      salary_range: "should be dropped",
    });
    expect(payload.salary_range).toBeUndefined();
  });

  it("never emits an empty string for hourly_rate (DecimalField rejects it)", () => {
    const payload = buildCreateJobPayload({ ...validSalaried });
    expect(payload.hourly_rate).not.toBe("");
  });

  it("emits duration_value and duration_unit together or not at all", () => {
    const payload = buildCreateJobPayload(validGig);
    expect(payload.duration_value).toBe(3);
    expect(payload.duration_unit).toBe("weeks");

    const salaried = buildCreateJobPayload(validSalaried);
    expect(
      (salaried.duration_value === undefined) ===
        (salaried.duration_unit === undefined),
    ).toBe(true);
  });
});

describe("buildUpdateJobPayload — clearing on job type change", () => {
  it("sends explicit null (not empty string) to clear inapplicable fields", () => {
    // Switching Gig -> Full-Time must clear the gig fields. DecimalField and
    // JSONField reject "", so the cleared value has to be null.
    const payload = buildUpdateJobPayload(validSalaried);
    expect(payload.hourly_rate).toBeNull();
    expect(payload.deliverables).toBeNull();
    expect(payload.stipend).toBeNull();
    expect(payload.certificate_provided).toBeNull();
  });

  it("clears duration_value and duration_unit as a pair", () => {
    const payload = buildUpdateJobPayload(validSalaried);
    expect(payload.duration_value).toBeNull();
    expect(payload.duration_unit).toBeNull();
  });

  it('maps an offered certificate to "Yes" on update too', () => {
    expect(
      buildUpdateJobPayload({ ...validGig, certificate_provided: true }),
    ).toMatchObject({ certificate_provided: "Yes" });
  });

  it("nulls certificate_provided when the switch is turned back off", () => {
    expect(
      buildUpdateJobPayload({ ...validGig, certificate_provided: false })
        .certificate_provided,
    ).toBeNull();
  });
});
