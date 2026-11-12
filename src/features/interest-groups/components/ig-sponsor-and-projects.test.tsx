import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { InterestGroupDetailBaseSchema } from "../schemas/interest-groups.schema";
import { IgImpactProjects, IgSponsorChip } from "./ig-sponsor-and-projects";

describe("IG detail — sponsorship and impact projects (release 1.91)", () => {
  it("parses the sponsor and project fields", () => {
    const parsed = InterestGroupDetailBaseSchema.parse({
      id: "ig1",
      name: "Web Development",
      is_sponsored: true,
      sponsor_company_name: "Acme",
      sponsor_company_logo: null,
      impact_projects: [
        {
          id: "p1",
          title: "Campus portal",
          description: "Built by the IG",
          image: null,
          links: [{ label: "Repo", url: "https://github.com/x" }],
        },
      ],
    });
    expect(parsed.is_sponsored).toBe(true);
    expect(parsed.impact_projects?.[0].title).toBe("Campus portal");
  });

  it("shows who sponsors the IG", () => {
    render(<IgSponsorChip isSponsored name="Acme" logo={null} />);
    expect(screen.getByText("Sponsored by Acme")).toBeInTheDocument();
  });

  it("hides the chip when the IG is not sponsored", () => {
    const { container } = render(
      <IgSponsorChip isSponsored={false} name={null} logo={null} />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("lists impact projects with their links", () => {
    render(
      <IgImpactProjects
        projects={[
          {
            id: "p1",
            title: "Campus portal",
            description: "Built by the IG",
            image: null,
            links: [{ label: "Repo", url: "https://github.com/x" }],
          },
        ]}
      />,
    );
    expect(
      screen.getByRole("heading", { name: "Impact projects" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Campus portal")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /repo/i })).toHaveAttribute(
      "href",
      "https://github.com/x",
    );
  });
});

describe("IgImpactProjects — link safety", () => {
  it("never renders a non-web project link", () => {
    render(
      <IgImpactProjects
        projects={[
          {
            id: "p1",
            title: "Campus portal",
            links: [
              { label: "Evil", url: "javascript:alert(1)" },
              { label: "Docs", url: "https://docs.example.com" },
            ],
          },
        ]}
      />,
    );
    expect(screen.queryByRole("link", { name: /evil/i })).toBeNull();
    expect(screen.getByRole("link", { name: /docs/i })).toBeInTheDocument();
  });
});
