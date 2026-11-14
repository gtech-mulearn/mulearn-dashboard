import { renderHook } from "@testing-library/react";
import { usePathname } from "next/navigation";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useSidebar } from "@/components/ui/sidebar";
import { useUserInfo } from "@/features/auth";
import { useCompanyProfile } from "@/features/company-jobs/hooks";
import { useMentorApplicationStatus } from "@/features/mentor/onboarding/hooks/use-onboarding";
import { useFilteredNav } from "@/hooks/use-filtered-nav";
import { usePermissions } from "@/hooks/use-permissions";
import { recordTourOutcome } from "../actions";
import { launchDriver } from "../lib/driver-adapter";
import { useTour } from "./use-tour";

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
vi.mock("../lib/driver-adapter", () => ({ launchDriver: vi.fn() }));
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

describe("useTour launch conditions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("does not launch when not on the resolved tour key's home route", () => {
    setup({ pathname: "/dashboard/profile" });
    renderHook(() => useTour({ initialState: {} }));
    expect(launchDriver).not.toHaveBeenCalled();
  });

  it("does not launch when the cookie version is already current", () => {
    setup();
    renderHook(() =>
      useTour({
        initialState: { dashboard: { version: 1, outcome: "completed" } },
      }),
    );
    expect(launchDriver).not.toHaveBeenCalled();
  });

  it("does not launch when a dialog is open", () => {
    setup({ dialogOpen: true });
    renderHook(() => useTour({ initialState: {} }));
    expect(launchDriver).not.toHaveBeenCalled();
  });

  it("does not launch when no resolved step's nav item is visible to this user", () => {
    setup({ hasNavItem: false });
    renderHook(() => useTour({ initialState: {} }));
    expect(launchDriver).not.toHaveBeenCalled();
  });

  it("launches when all conditions hold and the nav item is visible", () => {
    setup();
    renderHook(() => useTour({ initialState: {} }));
    expect(launchDriver).toHaveBeenCalledTimes(1);
  });

  it("does not launch twice on re-render (hasLaunchedRef guard)", () => {
    setup();
    const { rerender } = renderHook(() => useTour({ initialState: {} }));
    expect(launchDriver).toHaveBeenCalledTimes(1);
    rerender();
    rerender();
    expect(launchDriver).toHaveBeenCalledTimes(1);
  });

  it("commits the outcome via recordTourOutcome on skip/complete", () => {
    setup();
    renderHook(() => useTour({ initialState: {} }));
    const { onComplete } = vi.mocked(launchDriver).mock.calls[0][1];
    onComplete();
    expect(recordTourOutcome).toHaveBeenCalledWith("dashboard", "completed");
  });
});
