import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ProjectsTab } from "./projects-tab";

const makeProject = (overrides = {}) => ({
  id: "p1",
  title: "Demo",
  description: "d",
  status: "published" as const,
  logo: null,
  images: [],
  links: [{ id: "l1", label: "GitHub", url: "https://x.com", position: 0 }],
  skills: [{ id: "s1", name: "Python", code: "PY", icon: null }],
  created_by: "Owner",
  created_by_id: "u1",
  updated_by: "Owner",
  created_at: "",
  updated_at: "",
  members: [],
  votes: [],
  comments: [],
  ...overrides,
});

vi.mock("../api", () => ({
  listProjectsForMuid: vi.fn().mockResolvedValue([
    {
      id: "p1",
      title: "Demo",
      description: "d",
      status: "published" as const,
      logo: null,
      images: [],
      links: [{ id: "l1", label: "GitHub", url: "https://x.com", position: 0 }],
      skills: [{ id: "s1", name: "Python", code: "PY", icon: null }],
      created_by: "Owner",
      created_by_id: "u1",
      updated_by: "Owner",
      created_at: "",
      updated_at: "",
      members: [],
      votes: [],
      comments: [],
    },
  ]),
  listMembers: vi.fn().mockResolvedValue([]),
  createProject: vi.fn(),
  updateProject: vi.fn(),
  deleteProject: vi.fn(),
  updateProjectStatus: vi.fn(),
  addMember: vi.fn(),
  removeMember: vi.fn(),
  getProject: vi.fn(),
  voteProject: vi.fn(),
  deleteVote: vi.fn(),
  commentOnProject: vi.fn(),
  deleteComment: vi.fn(),
}));

function wrap(ui: React.ReactNode) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return <QueryClientProvider client={qc}>{ui}</QueryClientProvider>;
}

describe("<ProjectsTab />", () => {
  it("renders project cards with status, skills, and view CTA", async () => {
    render(
      wrap(
        <ProjectsTab
          muid="MU1"
          ownerMuid="MU1"
          currentUserId="u1"
          isOwnProfile
        />,
      ),
    );
    await waitFor(() => expect(screen.getByText("Demo")).toBeInTheDocument());
    expect(screen.getByText("Projects (1)")).toBeInTheDocument();
    expect(screen.getByText("Python")).toBeInTheDocument();
    // Links moved to detail modal — not on card
    expect(screen.queryByText("GitHub")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /new/i })).toBeInTheDocument();
    // New card surface: View CTA is present
    expect(screen.getAllByText(/view/i).length).toBeGreaterThan(0);
  });

  it("hides New button when not own profile", async () => {
    render(
      wrap(
        <ProjectsTab
          muid="MU1"
          ownerMuid="MU1"
          currentUserId={null}
          isOwnProfile={false}
        />,
      ),
    );
    await waitFor(() => expect(screen.getByText("Demo")).toBeInTheDocument());
    expect(
      screen.queryByRole("button", { name: /new/i }),
    ).not.toBeInTheDocument();
  });

  it("shows status badge for draft projects", async () => {
    const { listProjectsForMuid } = await import("../api");
    // biome-ignore lint/suspicious/noExplicitAny: vitest mock cast
    (listProjectsForMuid as any).mockResolvedValueOnce([
      makeProject({ status: "draft" }),
    ]);
    render(
      wrap(
        <ProjectsTab
          muid="MU1"
          ownerMuid="MU1"
          currentUserId="u1"
          isOwnProfile
        />,
      ),
    );
    await waitFor(() => expect(screen.getByText(/draft/i)).toBeInTheDocument());
  });
});
