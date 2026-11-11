import { describe, expect, it } from "vitest";
import { PublicMentorProfileSchema } from "../public/schemas";
import { formatMentorRating } from "./rating";

describe("formatMentorRating", () => {
  it("shows the average to one decimal with the rating count", () => {
    expect(formatMentorRating(4.456, 12)).toBe("4.5 (12)");
  });

  it("hides the rating until someone has rated", () => {
    expect(formatMentorRating(null, 0)).toBeNull();
    expect(formatMentorRating(undefined, undefined)).toBeNull();
    expect(formatMentorRating(4, 0)).toBeNull();
  });
});

describe("PublicMentorProfileSchema", () => {
  it("keeps avg_rating and rating_count", () => {
    const parsed = PublicMentorProfileSchema.safeParse({
      id: "m1",
      avg_rating: 4.2,
      rating_count: 7,
    });
    expect(parsed.success && parsed.data).toMatchObject({
      avg_rating: 4.2,
      rating_count: 7,
    });
  });
});
