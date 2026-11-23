import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ get: vi.fn() }));

vi.mock("@/api/client", () => ({ apiClient: { get: mocks.get } }));

import { getActivityLog } from "./notification.api";

describe("getActivityLog", () => {
  beforeEach(() => vi.clearAllMocks());

  it("leaves empty filters out of the URL", async () => {
    mocks.get.mockResolvedValue({ data: [], pagination: {} });
    await getActivityLog({
      pageIndex: 1,
      perPage: 20,
      action: "",
      actor: "",
      from: "",
      to: "",
    });
    expect(mocks.get).toHaveBeenCalledWith(
      "/api/v1/notification/activity-log/?pageIndex=1&perPage=20",
    );
  });

  it("sends the filters that are set", async () => {
    mocks.get.mockResolvedValue({ data: [], pagination: {} });
    await getActivityLog({
      pageIndex: 2,
      perPage: 20,
      action: "PUSH_TEST_SEND",
      from: "2026-11-01",
    });
    const url = String(mocks.get.mock.calls[0][0]);
    expect(url).toContain("action=PUSH_TEST_SEND");
    expect(url).toContain("from=2026-11-01");
    expect(url).not.toContain("actor=");
    expect(url).not.toContain("to=");
  });
});
