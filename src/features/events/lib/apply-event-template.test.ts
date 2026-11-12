import { describe, expect, it } from "vitest";
import { applyEventTemplate } from "./apply-event-template";

const minutesBetween = (a: string, b: string) =>
  (new Date(b).getTime() - new Date(a).getTime()) / 60000;

describe("applyEventTemplate", () => {
  const now = new Date("2026-11-10T10:00:00Z");

  it("fills title, description and an end set by the template's duration", () => {
    const values = applyEventTemplate(
      { title: "Demo", description: "d", default_duration_minutes: 90 },
      now,
    );
    expect(values.title).toBe("Demo");
    expect(values.description).toBe("d");
    expect(values.start_datetime).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/);
    expect(
      minutesBetween(
        values.start_datetime as string,
        values.end_datetime as string,
      ),
    ).toBe(90);
  });

  it("starts in the future and keeps the event type when given", () => {
    const values = applyEventTemplate(
      { title: "Talk", event_type: "workshop", default_duration_minutes: null },
      now,
    );
    expect(new Date(values.start_datetime as string).getTime()).toBeGreaterThan(
      now.getTime(),
    );
    expect(values.event_type).toBe("workshop");
    // No duration → one hour, the wizard's default.
    expect(
      minutesBetween(
        values.start_datetime as string,
        values.end_datetime as string,
      ),
    ).toBe(60);
  });
});
