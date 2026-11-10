import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { EventAnalyticsPanel } from "./event-analytics-panel";

describe("EventAnalyticsPanel — engagement (release 1.91)", () => {
  it("shows RSVPs, attendance, repeat attendees and satisfaction", () => {
    render(
      <EventAnalyticsPanel
        interestCount={12}
        venueName={null}
        mapsUrl={null}
        mapQuery=""
        analytics={{
          total_rsvps: 40,
          total_attendance: 30,
          attendance_rate: "75.00%",
          repeat_attendees: 8,
          learner_satisfaction: { average_rating: 4.6, rating_count: 9 },
        }}
      />,
    );
    expect(screen.getByText("40")).toBeInTheDocument();
    expect(screen.getByText("30")).toBeInTheDocument();
    expect(screen.getByText("75.00%")).toBeInTheDocument();
    expect(screen.getByText("8")).toBeInTheDocument();
    expect(screen.getByText("4.6 (9)")).toBeInTheDocument();
  });

  it("omits engagement until analytics load", () => {
    render(
      <EventAnalyticsPanel
        interestCount={12}
        venueName={null}
        mapsUrl={null}
        mapQuery=""
      />,
    );
    expect(screen.queryByText(/rsvps/i)).not.toBeInTheDocument();
  });
});
