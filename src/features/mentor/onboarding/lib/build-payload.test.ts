import { describe, expect, it } from "vitest";
import type { OnboardingFormValues } from "../schemas";
import {
  type BuildPayloadContext,
  buildMentorApplicationPayload,
} from "./build-payload";

const base: OnboardingFormValues = {
  mentor_tier: "IG_MENTOR",
  about: "a".repeat(60),
  expertise: ["x", "y", "z"],
  reason: "r".repeat(40),
  preferred_ig_ids: ["ig1"],
};

const ctx: BuildPayloadContext = {
  isEdit: false,
  isReapply: false,
  isPendingEdit: false,
  companies: [],
};

describe("buildMentorApplicationPayload", () => {
  it("omits hours when the mentor did not pick a range (never sends 0)", () => {
    expect("hours" in buildMentorApplicationPayload(base, ctx)).toBe(false);
  });

  it("sends the chosen hours range as-is", () => {
    expect(
      buildMentorApplicationPayload({ ...base, hours: "5-10" }, ctx).hours,
    ).toBe("5-10");
  });

  it("joins expertise chips into the comma string the backend stores", () => {
    expect(buildMentorApplicationPayload(base, ctx).expertise).toBe("x, y, z");
  });

  it("maps linkedin_url to linkedin", () => {
    const payload = buildMentorApplicationPayload(
      { ...base, linkedin_url: "https://www.linkedin.com/in/someone" },
      ctx,
    );
    expect(payload.linkedin).toBe("https://www.linkedin.com/in/someone");
    expect(payload).not.toHaveProperty("linkedin_url");
  });

  it("never sends the display-only company name", () => {
    expect(
      buildMentorApplicationPayload({ ...base, company: "Acme" }, ctx),
    ).not.toHaveProperty("company");
  });

  it("drops an empty org", () => {
    expect(buildMentorApplicationPayload(base, ctx)).not.toHaveProperty("org");
  });

  it("strips org and tier when editing a pending application", () => {
    const payload = buildMentorApplicationPayload(
      { ...base, org: "11111111-1111-4111-8111-111111111111" },
      { ...ctx, isPendingEdit: true },
    );
    expect(payload).not.toHaveProperty("mentor_tier");
    expect(payload).not.toHaveProperty("org");
  });

  it("includes the application id only for a pure edit", () => {
    expect(
      buildMentorApplicationPayload(base, {
        ...ctx,
        isEdit: true,
        existingId: "a1",
      }).id,
    ).toBe("a1");
    expect(
      buildMentorApplicationPayload(base, {
        ...ctx,
        isEdit: true,
        isReapply: true,
        existingId: "a1",
      }),
    ).not.toHaveProperty("id");
  });

  it("resolves a reapply org given as a company name to its id", () => {
    const payload = buildMentorApplicationPayload(
      { ...base, mentor_tier: "COMPANY_MENTOR", org: "acme corp" },
      {
        ...ctx,
        isReapply: true,
        companies: [{ id: "org-1", title: "Acme Corp" }],
      },
    );
    expect(payload.org).toBe("org-1");
  });
});

describe("buildMentorApplicationPayload — Campus Mentor", () => {
  it("sends the campus tier with the chosen college", () => {
    expect(
      buildMentorApplicationPayload(
        { ...base, mentor_tier: "CAMPUS_MENTOR", org: "col1" },
        ctx,
      ),
    ).toMatchObject({ mentor_tier: "CAMPUS_MENTOR", org: "col1" });
  });

  it("resolves a reapply college saved by name to its id", () => {
    expect(
      buildMentorApplicationPayload(
        { ...base, mentor_tier: "CAMPUS_MENTOR", org: "GEC Thrissur" },
        {
          ...ctx,
          isReapply: true,
          colleges: [{ id: "col1", title: "GEC Thrissur" }],
        },
      ).org,
    ).toBe("col1");
  });
});
