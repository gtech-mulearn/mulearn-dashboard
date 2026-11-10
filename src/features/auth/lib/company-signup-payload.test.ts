import { describe, expect, it } from "vitest";
import type { CompanyDetailsValues } from "../components/register-role-details";
import {
  buildCompanySignupPayload,
  normalizeUrl,
  splitPerks,
} from "./company-signup-payload";

const validValues: CompanyDetailsValues = {
  companyName: "Acme Labs",
  companyDescription: "We build things.",
  verification_document_url: "https://drive.google.com/file/d/abc",
};

describe("splitPerks", () => {
  it("splits on new lines and commas, trimming each perk", () => {
    expect(splitPerks("Free lunch\nRemote, Gym ")).toEqual([
      "Free lunch",
      "Remote",
      "Gym",
    ]);
  });

  it("returns undefined when there are no perks", () => {
    expect(splitPerks("  ")).toBeUndefined();
    expect(splitPerks(undefined)).toBeUndefined();
  });
});

describe("normalizeUrl", () => {
  it("adds https:// to a bare domain", () => {
    expect(normalizeUrl("drive.google.com/x")).toBe(
      "https://drive.google.com/x",
    );
  });

  it("drops data: and blob: URLs", () => {
    expect(normalizeUrl("blob:https://app/123")).toBeUndefined();
    expect(normalizeUrl("data:image/png;base64,AAA")).toBeUndefined();
  });
});

describe("buildCompanySignupPayload (backend 1.91 shapes)", () => {
  it("sends perks as a list of strings", () => {
    expect(
      buildCompanySignupPayload({ ...validValues, perks: "A,B" }).perks,
    ).toEqual(["A", "B"]);
  });

  it("omits perks when none are given", () => {
    expect(buildCompanySignupPayload(validValues)).not.toHaveProperty("perks");
  });

  it("sends gallery images as objects", () => {
    expect(
      buildCompanySignupPayload({
        ...validValues,
        gallery: ["https://a.com/1.png", "b.com/2.png"],
      }).gallery,
    ).toEqual([
      { image_url: "https://a.com/1.png", sort_order: 0 },
      { image_url: "https://b.com/2.png", sort_order: 1 },
    ]);
  });

  it("never sends free-text testimonials", () => {
    expect(buildCompanySignupPayload(validValues)).not.toHaveProperty(
      "testimonials",
    );
  });

  it("normalizes the verification document link", () => {
    expect(
      buildCompanySignupPayload({
        ...validValues,
        verification_document_url: "drive.google.com/x",
      }).verification_document_url,
    ).toBe("https://drive.google.com/x");
  });

  it("never invents a document URL", () => {
    expect(
      JSON.stringify(buildCompanySignupPayload(validValues)),
    ).not.toContain("mulearn.org/documents");
  });

  it("maps the basic fields to the backend's names", () => {
    const payload = buildCompanySignupPayload({
      ...validValues,
      websiteLink: "acme.dev",
      foundedYear: 2020,
      techStack: ["Go"],
    });
    expect(payload).toMatchObject({
      name: "Acme Labs",
      description: "We build things.",
      website_link: "https://acme.dev",
      founded_year: 2020,
      tech_stack: ["Go"],
    });
  });
});
