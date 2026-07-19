import { describe, expect, it } from "vitest";
import { getLevelMessage, MAX_LEVEL, parseLevelNumber } from "./level.utils";

describe("parseLevelNumber", () => {
  it("parses the API's lvlN format", () => {
    expect(parseLevelNumber("lvl7")).toBe(7);
    expect(parseLevelNumber("lvl1")).toBe(1);
  });

  it("reads multi-digit levels instead of truncating to the first digit", () => {
    expect(parseLevelNumber("lvl10")).toBe(10);
  });

  it("defaults to level 1 when the field is missing or unparseable", () => {
    expect(parseLevelNumber(null)).toBe(1);
    expect(parseLevelNumber(undefined)).toBe(1);
    expect(parseLevelNumber("")).toBe(1);
    expect(parseLevelNumber("beginner")).toBe(1);
  });
});

describe("getLevelMessage", () => {
  it("returns a distinct message for every level in the ladder", () => {
    const messages = Array.from({ length: MAX_LEVEL }, (_, i) =>
      getLevelMessage(`lvl${i + 1}`),
    );

    expect(messages.every(Boolean)).toBe(true);
    expect(new Set(messages).size).toBe(MAX_LEVEL);
  });

  it("flags the top of the ladder", () => {
    expect(getLevelMessage(`lvl${MAX_LEVEL}`)).toBe("Max level reached");
  });

  it("falls back to the level 1 message when the field is missing", () => {
    expect(getLevelMessage(null)).toBe(getLevelMessage("lvl1"));
  });

  it("returns undefined for a level beyond the ladder, so no caption renders", () => {
    expect(getLevelMessage("lvl99")).toBeUndefined();
  });
});
