import { fireEvent, render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { verify, remove } = vi.hoisted(() => ({
  verify: vi.fn(),
  remove: vi.fn(),
}));

// The mutations are mocked so the test covers the row's buttons and
// confirmations, not react-query or the network.
vi.mock("../hooks/use-role-verification", () => ({
  useVerifyRole: () => ({ mutate: verify, isPending: false }),
  useDeleteRoleVerification: () => ({ mutate: remove, isPending: false }),
}));

import type { RoleVerificationItem } from "../schemas";
import { RoleVerificationActions } from "./role-verification-actions";

const item = {
  id: "0f8fad5b-d9cb-469f-a165-70867728950e",
  user_id: "7c9e6679-7425-40de-944b-e07fc1f90ae7",
  full_name: "Asha Enabler",
  muid: "asha@mulearn",
  email: "asha@example.com",
  verified: false,
  role_id: "9b2d2c4e-5f1a-4c3b-8d7e-6a5b4c3d2e1f",
  role_title: "Enabler",
} as RoleVerificationItem;

describe("Enabler tab — row actions", () => {
  beforeEach(() => {
    verify.mockReset();
    remove.mockReset();
  });

  it("offers View, Approve and Reject like the Mentor tab", () => {
    render(<RoleVerificationActions item={item} />);
    for (const name of ["View", "Approve", "Reject"]) {
      expect(screen.getByRole("button", { name })).toBeInTheDocument();
    }
  });

  it("asks for confirmation before approving", () => {
    render(<RoleVerificationActions item={item} />);
    fireEvent.click(screen.getByRole("button", { name: "Approve" }));
    expect(verify).not.toHaveBeenCalled();
    fireEvent.click(
      within(screen.getByTestId("confirm-dialog")).getByRole("button", {
        name: "Approve",
      }),
    );
    expect(verify).toHaveBeenCalledWith(item.id, expect.anything());
  });

  it("asks for confirmation before rejecting", () => {
    render(<RoleVerificationActions item={item} />);
    fireEvent.click(screen.getByRole("button", { name: "Reject" }));
    expect(remove).not.toHaveBeenCalled();
    fireEvent.click(
      within(screen.getByTestId("confirm-dialog")).getByRole("button", {
        name: "Reject & Delete",
      }),
    );
    expect(remove).toHaveBeenCalledWith(item.id, expect.anything());
  });
});
