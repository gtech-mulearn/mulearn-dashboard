import { act, renderHook } from "@testing-library/react";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useSidebar } from "@/components/ui/sidebar";
import { useUserInfo } from "@/features/auth";
import { useCompanyProfile } from "@/features/company-jobs/hooks";
import { useMentorApplicationStatus } from "@/features/mentor/onboarding/hooks/use-onboarding";
import { useFilteredNav } from "@/hooks/use-filtered-nav";
import { usePermissions } from "@/hooks/use-permissions";
import { recordTourOutcome } from "../actions";
import { launchDriver } from "../lib/driver-adapter";
import type { TourCookiePayload } from "../types";
import { usePageTour, useTour } from "./use-tour";

vi.mock("next/navigation", () => ({ usePathname: vi.fn() }));
vi.mock("@/features/auth", () => ({ useUserInfo: vi.fn() }));
vi.mock("@/features/company-jobs/hooks", () => ({
  useCompanyProfile: vi.fn(),
}));
vi.mock("@/features/mentor/onboarding/hooks/use-onboarding", () => ({
  useMentorApplicationStatus: vi.fn(),
}));
vi.mock("@/hooks/use-permissions", () => ({ usePermissions: vi.fn() }));
vi.mock("@/hooks/use-filtered-nav", () => ({ useFilteredNav: vi.fn() }));
vi.mock("@/components/ui/sidebar", () => ({ useSidebar: vi.fn() }));
vi.mock("../actions", () => ({ recordTourOutcome: vi.fn() }));
vi.mock("../lib/driver-adapter", () => ({
  launchDriver: vi.fn(),
  isAnyTourActive: () => false,
}));
// A single dummy step per tour key keeps the matrix independent of real
// step content — the real dashboard/intern/etc. step lists have their own
// coverage in build-steps.test.ts.
vi.mock("../lib/step-registry", () => ({
  TOUR_STEP_REGISTRY: {
    dashboard: [
      { id: "welcome", navId: "home", title: "Welcome", description: "" },
    ],
    intern: [],
    campus: [],
    zonal: [],
    district: [],
  },
}));

vi.mock("../lib/page-tour-registry", () => ({
  PAGE_TOUR_REGISTRY: {
    "/dashboard/page-b": {
      route: "/dashboard/page-b",
      version: 2,
      steps: [{ id: "intro", centered: true, title: "Intro", description: "" }],
    },
  },
  latestPageTourVersion: () => 2,
}));

const STUDENT_USER = { roles: ["Student"] };
const NAV_ITEM = { id: "home" } as never;

function setup({
  pathname = "/dashboard",
  dialogOpen = false,
  hasNavItem = true,
}: {
  pathname?: string;
  dialogOpen?: boolean;
  hasNavItem?: boolean;
} = {}) {
  vi.mocked(usePathname).mockReturnValue(pathname);
  vi.mocked(useUserInfo).mockReturnValue({ data: STUDENT_USER } as never);
  vi.mocked(usePermissions).mockReturnValue({
    can: () => false,
    roles: STUDENT_USER.roles,
    hasRole: () => false,
  } as never);
  vi.mocked(useMentorApplicationStatus).mockReturnValue({
    data: undefined,
  } as never);
  vi.mocked(useCompanyProfile).mockReturnValue({ profile: undefined } as never);
  vi.mocked(useFilteredNav).mockReturnValue({
    mainItems: hasNavItem ? [NAV_ITEM] : [],
    managementItems: [],
    bottomItems: [],
    isLoading: false,
  } as never);
  vi.mocked(useSidebar).mockReturnValue({
    isMobile: false,
    openMobile: false,
    setOpenMobile: vi.fn(),
  } as never);

  document.body.innerHTML = "";
  if (dialogOpen) {
    const dialog = document.createElement("div");
    dialog.setAttribute("role", "dialog");
    dialog.setAttribute("data-state", "open");
    document.body.appendChild(dialog);
  }
}

/** Mirrors `TourController`: one shared state for both hooks. */
type TourHook = typeof useTour;
function renderWith(hooks: TourHook[], initialState: TourCookiePayload = {}) {
  return renderHook(() => {
    const [state, setState] = useState(initialState);
    for (const hook of hooks) hook({ state, setState });
  });
}
const renderTours = (s?: TourCookiePayload) =>
  renderWith([useTour, usePageTour], s);
const renderHome = (s?: TourCookiePayload) => renderWith([useTour], s);
const renderPage = (s?: TourCookiePayload) => renderWith([usePageTour], s);

describe("useTour launch conditions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("does not launch when not on the resolved tour key's home route", () => {
    setup({ pathname: "/dashboard/profile" });
    renderHome();
    expect(launchDriver).not.toHaveBeenCalled();
  });

  it("does not launch when the cookie version is already current", () => {
    setup();
    renderHome({ dashboard: { version: 1, outcome: "completed" } });
    expect(launchDriver).not.toHaveBeenCalled();
  });

  it("does not launch when a dialog is open", () => {
    setup({ dialogOpen: true });
    renderHome();
    expect(launchDriver).not.toHaveBeenCalled();
  });

  it("does not launch when no resolved step's nav item is visible to this user", () => {
    setup({ hasNavItem: false });
    renderHome();
    expect(launchDriver).not.toHaveBeenCalled();
  });

  it("launches when all conditions hold and the nav item is visible", () => {
    setup();
    renderHome();
    expect(launchDriver).toHaveBeenCalledTimes(1);
  });

  it("does not launch twice on re-render (hasLaunchedRef guard)", () => {
    setup();
    const { rerender } = renderHome();
    expect(launchDriver).toHaveBeenCalledTimes(1);
    rerender();
    rerender();
    expect(launchDriver).toHaveBeenCalledTimes(1);
  });

  it("commits the home outcome and dismisses page tours on skip", async () => {
    setup();
    renderHome();
    await vi.mocked(launchDriver).mock.calls[0][1].onSkip();
    await vi.waitFor(() =>
      expect(recordTourOutcome).toHaveBeenCalledWith("page:*", 2, "skipped"),
    );
    expect(recordTourOutcome).toHaveBeenCalledWith("dashboard", 1, "skipped");
  });

  it("skipping home stops the page tour on the next page", async () => {
    setup();
    const { rerender } = renderTours();
    expect(launchDriver).toHaveBeenCalledTimes(1);
    act(() => vi.mocked(launchDriver).mock.calls[0][1].onSkip());

    vi.mocked(usePathname).mockReturnValue("/dashboard/page-b");
    rerender();
    expect(launchDriver).toHaveBeenCalledTimes(1);
  });
});

describe("usePageTour skip opt-out", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("launches on a registered page when nothing was skipped", () => {
    setup({ pathname: "/dashboard/page-b" });
    renderPage();
    expect(launchDriver).toHaveBeenCalledTimes(1);
  });

  it("writes the single page-tours skip key on skip", () => {
    setup({ pathname: "/dashboard/page-b" });
    renderPage();
    vi.mocked(launchDriver).mock.calls[0][1].onSkip();
    expect(recordTourOutcome).toHaveBeenCalledWith("page:*", 2, "skipped");
  });

  it("writes the same single key on complete", () => {
    setup({ pathname: "/dashboard/page-b" });
    renderPage();
    vi.mocked(launchDriver).mock.calls[0][1].onComplete();
    expect(recordTourOutcome).toHaveBeenCalledWith("page:*", 2, "completed");
  });

  it("does not launch on any page once the skip key is set", () => {
    setup({ pathname: "/dashboard/page-b" });
    renderPage({ "page:*": { version: 2, outcome: "skipped" } });
    expect(launchDriver).not.toHaveBeenCalled();
  });

  it("launches again when the page version is bumped above the dismissed one", () => {
    setup({ pathname: "/dashboard/page-b" });
    renderPage({ "page:*": { version: 1, outcome: "completed" } });
    expect(launchDriver).toHaveBeenCalledTimes(1);
  });
});
