import { describe, expect, it } from "vitest";
import {
  CampusContentItemSchema,
  CampusContentWriteSchema,
  ZoneSchema,
} from "../schemas/weekly-twitches.schema";
import { normalizeZone, ZONE_OPTIONS, zoneLabel } from "./zones";

const validWrite = {
  topic: "Building in public",
  campus: "CET",
  date: "2026-11-20",
  time: "18:00",
  description: "An evening session",
  link: "https://youtube.com/live/abc",
};

describe("media content zones (upper-cased in release 1.91)", () => {
  it("offers the three backend values with readable labels", () => {
    expect(ZONE_OPTIONS).toEqual([
      { value: "NORTH", label: "North" },
      { value: "CENTRAL", label: "Central" },
      { value: "SOUTH", label: "South" },
    ]);
  });

  it("upper-cases a cached pre-1.91 value", () => {
    expect(ZoneSchema.parse("north")).toBe("NORTH");
  });

  it("accepts the current backend value", () => {
    expect(ZoneSchema.parse("SOUTH")).toBe("SOUTH");
  });

  it("rejects an unknown zone", () => {
    expect(ZoneSchema.safeParse("east").success).toBe(false);
  });

  it("only lets the form submit the backend's casing", () => {
    expect(
      CampusContentWriteSchema.parse({ ...validWrite, zone: "NORTH" }).zone,
    ).toBe("NORTH");
    expect(
      CampusContentWriteSchema.safeParse({ ...validWrite, zone: "north" })
        .success,
    ).toBe(false);
  });

  it("reads an item whose zone is upper-case", () => {
    const parsed = CampusContentItemSchema.safeParse({
      id: "6f1c3f64-2f8a-4f3e-9c55-2b1d0a8b4c11",
      topic: "t",
      campus: "c",
      date: "2026-11-20",
      zone: "CENTRAL",
      status: "upcoming",
      created_at: "x",
      updated_at: "x",
    });
    expect(parsed.success && parsed.data.zone).toBe("CENTRAL");
  });

  it("labels zones for display", () => {
    expect(zoneLabel("CENTRAL")).toBe("Central");
    expect(zoneLabel("south")).toBe("South");
    expect(zoneLabel(null)).toBeNull();
    expect(zoneLabel("east")).toBeNull();
  });

  it("normalizes for form prefill", () => {
    expect(normalizeZone("central")).toBe("CENTRAL");
    expect(normalizeZone(undefined)).toBeUndefined();
  });
});
