/**
 * Meet-Link Validation — Unit Tests
 *
 * 📍 src/features/learning-circle/utils/meet-link-validation.test.ts
 *
 * Covers every exported function including valid links, invalid/mismatched
 * links, and all edge-case domain variants for each platform.
 *
 * Strategy: pure function tests — no faked timers needed.
 */

import { describe, expect, it } from "vitest";
import {
  getMeetLinkErrorMessage,
  isMeetLinkValidForPlatform,
  PLATFORM_DOMAIN_RULES,
} from "./meet-link-validation";

// ─── isMeetLinkValidForPlatform ──────────────────────────────────────────────

describe("isMeetLinkValidForPlatform()", () => {
  // ── null/undefined platform (offline mode) ───────────────────────────────

  describe("null / undefined platform", () => {
    it("returns true for null platform (offline mode)", () => {
      expect(isMeetLinkValidForPlatform(null, "Room 101, Building A")).toBe(
        true,
      );
    });

    it("returns true for undefined platform", () => {
      expect(
        isMeetLinkValidForPlatform(undefined, "https://zoom.us/j/abc"),
      ).toBe(true);
    });

    it("returns true even with an empty link when platform is null", () => {
      expect(isMeetLinkValidForPlatform(null, "")).toBe(true);
    });
  });

  // ── empty / falsy link ───────────────────────────────────────────────────

  describe("empty / falsy link with a selected platform", () => {
    it("returns false for an empty string link", () => {
      expect(isMeetLinkValidForPlatform("Zoom", "")).toBe(false);
    });

    it("returns false for a whitespace-only link", () => {
      expect(isMeetLinkValidForPlatform("Zoom", "   ")).toBe(false);
    });

    it("returns false for null link", () => {
      expect(isMeetLinkValidForPlatform("Zoom", null)).toBe(false);
    });

    it("returns false for undefined link", () => {
      expect(isMeetLinkValidForPlatform("Zoom", undefined)).toBe(false);
    });
  });

  // ── non-URL strings ──────────────────────────────────────────────────────

  describe("non-URL strings", () => {
    it("returns false for a plain word", () => {
      expect(isMeetLinkValidForPlatform("Zoom", "notaurl")).toBe(false);
    });

    it("returns false for a bare path without scheme", () => {
      expect(isMeetLinkValidForPlatform("Google Meet", "/j/abc123")).toBe(
        false,
      );
    });

    it("returns false for an SQL-injection-like string", () => {
      expect(
        isMeetLinkValidForPlatform("Zoom", "'; DROP TABLE meetings;--"),
      ).toBe(false);
    });
  });

  // ── Zoom ─────────────────────────────────────────────────────────────────

  describe("Zoom", () => {
    it("accepts a standard zoom.us link", () => {
      expect(
        isMeetLinkValidForPlatform("Zoom", "https://zoom.us/j/123456789"),
      ).toBe(true);
    });

    it("accepts a vanity subdomain link (company.zoom.us)", () => {
      expect(
        isMeetLinkValidForPlatform(
          "Zoom",
          "https://mycompany.zoom.us/j/987654321",
        ),
      ).toBe(true);
    });

    it("accepts a deeply nested subdomain (us02web.zoom.us)", () => {
      expect(
        isMeetLinkValidForPlatform(
          "Zoom",
          "https://us02web.zoom.us/j/00000000?pwd=abc",
        ),
      ).toBe(true);
    });

    it("accepts http:// Zoom links", () => {
      expect(isMeetLinkValidForPlatform("Zoom", "http://zoom.us/j/123")).toBe(
        true,
      );
    });

    it("accepts Zoom links with query params and trailing slash", () => {
      expect(
        isMeetLinkValidForPlatform(
          "Zoom",
          "https://zoom.us/j/123/?pwd=xyz&uname=test",
        ),
      ).toBe(true);
    });

    it("accepts mixed-case Zoom domain (ZOOM.US)", () => {
      expect(isMeetLinkValidForPlatform("Zoom", "https://ZOOM.US/j/123")).toBe(
        true,
      );
    });

    it("rejects a Google Meet link when Zoom is selected", () => {
      expect(
        isMeetLinkValidForPlatform(
          "Zoom",
          "https://meet.google.com/abc-defg-hij",
        ),
      ).toBe(false);
    });

    it("rejects a link that merely contains 'zoom' in the path", () => {
      expect(
        isMeetLinkValidForPlatform(
          "Zoom",
          "https://example.com/zoom-meeting/123",
        ),
      ).toBe(false);
    });

    it("rejects a fake zoom domain (zoom.us.evil.com)", () => {
      expect(
        isMeetLinkValidForPlatform("Zoom", "https://zoom.us.evil.com/j/123"),
      ).toBe(false);
    });
  });

  // ── Google Meet ──────────────────────────────────────────────────────────

  describe("Google Meet", () => {
    it("accepts a standard meet.google.com link", () => {
      expect(
        isMeetLinkValidForPlatform(
          "Google Meet",
          "https://meet.google.com/abc-defg-hij",
        ),
      ).toBe(true);
    });

    it("accepts meet.google.com with query params", () => {
      expect(
        isMeetLinkValidForPlatform(
          "Google Meet",
          "https://meet.google.com/xyz?authuser=0",
        ),
      ).toBe(true);
    });

    it("accepts mixed-case MEET.GOOGLE.COM", () => {
      expect(
        isMeetLinkValidForPlatform(
          "Google Meet",
          "https://MEET.GOOGLE.COM/abc-xyz",
        ),
      ).toBe(true);
    });

    it("rejects google.com (missing the meet. subdomain)", () => {
      expect(
        isMeetLinkValidForPlatform(
          "Google Meet",
          "https://google.com/meet/abc",
        ),
      ).toBe(false);
    });

    it("rejects a Zoom link when Google Meet is selected", () => {
      expect(
        isMeetLinkValidForPlatform(
          "Google Meet",
          "https://zoom.us/j/123456789",
        ),
      ).toBe(false);
    });

    it("rejects a fake meet.google domain (meet.google.com.evil.com)", () => {
      expect(
        isMeetLinkValidForPlatform(
          "Google Meet",
          "https://meet.google.com.evil.com/abc",
        ),
      ).toBe(false);
    });
  });

  // ── Microsoft Teams ──────────────────────────────────────────────────────

  describe("Microsoft Teams", () => {
    it("accepts a teams.microsoft.com link (work/school account)", () => {
      expect(
        isMeetLinkValidForPlatform(
          "Microsoft Teams",
          "https://teams.microsoft.com/l/meetup-join/abc",
        ),
      ).toBe(true);
    });

    it("accepts a teams.live.com link (personal account)", () => {
      expect(
        isMeetLinkValidForPlatform(
          "Microsoft Teams",
          "https://teams.live.com/meet/123456",
        ),
      ).toBe(true);
    });

    it("accepts mixed-case TEAMS.MICROSOFT.COM", () => {
      expect(
        isMeetLinkValidForPlatform(
          "Microsoft Teams",
          "https://TEAMS.MICROSOFT.COM/l/meetup-join/xyz",
        ),
      ).toBe(true);
    });

    it("rejects microsoft.com without the teams. prefix", () => {
      expect(
        isMeetLinkValidForPlatform(
          "Microsoft Teams",
          "https://microsoft.com/teams/meeting",
        ),
      ).toBe(false);
    });

    it("rejects a Discord link when Teams is selected", () => {
      expect(
        isMeetLinkValidForPlatform(
          "Microsoft Teams",
          "https://discord.gg/abc123",
        ),
      ).toBe(false);
    });
  });

  // ── Discord ──────────────────────────────────────────────────────────────

  describe("Discord", () => {
    it("accepts a discord.com link", () => {
      expect(
        isMeetLinkValidForPlatform(
          "Discord",
          "https://discord.com/channels/123/456",
        ),
      ).toBe(true);
    });

    it("accepts a discord.gg shortlink", () => {
      expect(
        isMeetLinkValidForPlatform("Discord", "https://discord.gg/abc123"),
      ).toBe(true);
    });

    it("accepts http discord.gg", () => {
      expect(
        isMeetLinkValidForPlatform("Discord", "http://discord.gg/server"),
      ).toBe(true);
    });

    it("accepts mixed-case DISCORD.COM", () => {
      expect(
        isMeetLinkValidForPlatform(
          "Discord",
          "https://DISCORD.COM/channels/1/2",
        ),
      ).toBe(true);
    });

    it("rejects a Zoom link when Discord is selected", () => {
      expect(
        isMeetLinkValidForPlatform("Discord", "https://zoom.us/j/123"),
      ).toBe(false);
    });

    it("rejects a fake discord domain (discord.gg.evil.com)", () => {
      expect(
        isMeetLinkValidForPlatform(
          "Discord",
          "https://discord.gg.evil.com/abc",
        ),
      ).toBe(false);
    });
  });

  // ── Other ────────────────────────────────────────────────────────────────

  describe("Other", () => {
    it("accepts any well-formed URL", () => {
      expect(
        isMeetLinkValidForPlatform(
          "Other",
          "https://example.com/meeting/12345",
        ),
      ).toBe(true);
    });

    it("accepts an http URL for 'Other'", () => {
      expect(
        isMeetLinkValidForPlatform(
          "Other",
          "http://mycompany.internal/meeting",
        ),
      ).toBe(true);
    });

    it("accepts a URL with a port number", () => {
      expect(
        isMeetLinkValidForPlatform("Other", "https://example.com:8080/meet"),
      ).toBe(true);
    });

    it("rejects a plain non-URL string for 'Other'", () => {
      expect(isMeetLinkValidForPlatform("Other", "not a url at all")).toBe(
        false,
      );
    });

    it("rejects an empty string for 'Other'", () => {
      expect(isMeetLinkValidForPlatform("Other", "")).toBe(false);
    });
  });
});

// ─── getMeetLinkErrorMessage ─────────────────────────────────────────────────

describe("getMeetLinkErrorMessage()", () => {
  it("mentions the platform name in the error message", () => {
    expect(getMeetLinkErrorMessage("Zoom")).toContain("Zoom");
    expect(getMeetLinkErrorMessage("Google Meet")).toContain("Google Meet");
    expect(getMeetLinkErrorMessage("Microsoft Teams")).toContain(
      "Microsoft Teams",
    );
    expect(getMeetLinkErrorMessage("Discord")).toContain("Discord");
    expect(getMeetLinkErrorMessage("Other")).toContain("Other");
  });

  it("mentions zoom.us in the Zoom error", () => {
    expect(getMeetLinkErrorMessage("Zoom")).toContain("zoom.us");
  });

  it("mentions meet.google.com in the Google Meet error", () => {
    expect(getMeetLinkErrorMessage("Google Meet")).toContain("meet.google.com");
  });

  it("mentions both Teams domains in the Teams error", () => {
    const msg = getMeetLinkErrorMessage("Microsoft Teams");
    expect(msg).toContain("teams.microsoft.com");
    expect(msg).toContain("teams.live.com");
  });

  it("mentions discord in the Discord error", () => {
    const msg = getMeetLinkErrorMessage("Discord");
    expect(msg).toContain("discord");
  });

  it("returns a fallback for null platform", () => {
    expect(getMeetLinkErrorMessage(null)).toBe(
      "Please enter a valid meeting link.",
    );
  });

  it("returns a fallback for undefined platform", () => {
    expect(getMeetLinkErrorMessage(undefined)).toBe(
      "Please enter a valid meeting link.",
    );
  });
});

// ─── PLATFORM_DOMAIN_RULES completeness ─────────────────────────────────────

describe("PLATFORM_DOMAIN_RULES", () => {
  const expectedPlatforms: string[] = [
    "Zoom",
    "Google Meet",
    "Microsoft Teams",
    "Discord",
    "Other",
  ];

  it("has a rule for every supported platform", () => {
    for (const p of expectedPlatforms) {
      expect(PLATFORM_DOMAIN_RULES).toHaveProperty(p);
    }
  });

  it("has no extra undocumented platforms", () => {
    expect(Object.keys(PLATFORM_DOMAIN_RULES).sort()).toEqual(
      expectedPlatforms.slice().sort(),
    );
  });
});
