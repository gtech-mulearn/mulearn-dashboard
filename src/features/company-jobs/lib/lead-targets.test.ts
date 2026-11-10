import { describe, expect, it } from "vitest";
import { leadTargets } from "./lead-targets";

describe("leadTargets", () => {
  const igs = [
    { id: "ig1", name: "Web Development", code: "WEB" },
    { id: "ig2", name: "AI", code: "AI" },
  ];

  it("lists the campus and the IGs the user can answer for", () => {
    expect(
      leadTargets(["Campus Lead", "WEB IGLead"], {
        campus: { orgId: "org1", name: "GEC Thrissur" },
        igs,
      }),
    ).toEqual([
      { type: "CAMPUS", orgId: "org1", label: "GEC Thrissur" },
      { type: "IG", orgId: "ig1", label: "Web Development" },
    ]);
  });

  it("ignores campus IG leads and campuses the user doesn't lead", () => {
    expect(
      leadTargets(["WEB CampusIGLead", "Student"], {
        campus: { orgId: "org1", name: "GEC" },
        igs,
      }),
    ).toEqual([]);
  });
});
