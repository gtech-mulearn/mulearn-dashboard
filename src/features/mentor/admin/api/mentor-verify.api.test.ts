import { beforeEach, describe, expect, it, vi } from "vitest";

const { get } = vi.hoisted(() => ({ get: vi.fn() }));
vi.mock("@/api/client", () => ({ apiClient: { get } }));

import { MentorDetailResponseSchema } from "../schemas";
import {
  fetchMentorChangeRequests,
  fetchMentorDetail,
  fetchMentorRoster,
} from "./mentor-verify.api";

const empty = {
  response: { data: [], pagination: { totalPages: 1, count: 0 } },
};
const lastUrl = () => new URL(get.mock.calls.at(-1)?.[0], "http://x");

describe("mentor admin fetchers", () => {
  beforeEach(() => {
    get.mockReset();
    get.mockResolvedValue(empty);
  });

  it("sends sortBy for change requests", async () => {
    await fetchMentorChangeRequests({ sortBy: "-created_at" });
    expect(lastUrl().searchParams.get("sortBy")).toBe("-created_at");
  });

  it("sends sortBy for the roster", async () => {
    await fetchMentorRoster({ sortBy: "user_full_name" });
    expect(lastUrl().searchParams.get("sortBy")).toBe("user_full_name");
  });

  it("parses detail with the single-object schema and returns the object", async () => {
    get.mockResolvedValueOnce({ statusCode: 200, response: { id: "a1" } });
    const result = await fetchMentorDetail("a1");
    expect(get).toHaveBeenCalledWith(
      expect.stringContaining("/detail/a1/"),
      MentorDetailResponseSchema,
    );
    expect(result).toEqual({ id: "a1" });
  });
});
