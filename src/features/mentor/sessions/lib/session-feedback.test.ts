import { describe, expect, it } from "vitest";
import { buildSessionFeedbackBody } from "./session-feedback";

describe("buildSessionFeedbackBody", () => {
  it("sends only the rating when there is no comment", () => {
    expect(buildSessionFeedbackBody({ rating: 5, feedback: "  " })).toEqual({
      rating: 5,
    });
  });

  it("sends only the trimmed comment when there is no rating", () => {
    expect(buildSessionFeedbackBody({ feedback: " Great " })).toEqual({
      feedback: "Great",
    });
  });

  it("sends both when both are given", () => {
    expect(buildSessionFeedbackBody({ rating: 3, feedback: "Ok" })).toEqual({
      rating: 3,
      feedback: "Ok",
    });
  });
});
