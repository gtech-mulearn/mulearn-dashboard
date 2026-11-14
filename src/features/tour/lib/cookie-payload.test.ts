import { describe, expect, it } from "vitest";
import type { TourCookiePayload } from "../types";
import {
  parseTourCookiePayload,
  serializeTourCookiePayload,
} from "./cookie-payload";

describe("tour cookie payload", () => {
  it("treats an absent cookie as never-seen", () => {
    expect(parseTourCookiePayload(undefined)).toEqual({});
  });

  it("treats corrupt/tampered JSON as never-seen, not a crash", () => {
    expect(parseTourCookiePayload("{not json")).toEqual({});
  });

  it("round-trips a payload through serialize -> parse", () => {
    const payload: TourCookiePayload = {
      dashboard: { version: 1, outcome: "completed" },
      campus: { version: 2, outcome: "skipped" },
    };
    const roundTripped = parseTourCookiePayload(
      serializeTourCookiePayload(payload),
    );
    expect(roundTripped).toEqual(payload);
  });
});
