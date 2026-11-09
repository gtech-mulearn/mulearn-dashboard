import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ApiError } from "@/api/errors";

const { registerMutate, verifyTokens } = vi.hoisted(() => ({
  registerMutate: vi.fn(),
  verifyTokens: ["tok-1", "tok-2"],
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn(), info: vi.fn() },
}));

vi.mock("@/lib/auth", () => ({
  authStore: { clearTempToken: vi.fn().mockResolvedValue(undefined) },
}));

vi.mock("@/features/onboarding", () => ({
  useCollegeSearch: () => ({ data: [], isFetching: false }),
  useDepartmentSearch: () => ({ data: [], isFetching: false }),
  useCompanies: () => ({ data: [], isLoading: false }),
  useRoles: () => ({ getRoleId: () => "role-student" }),
  useCreateOrganization: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useSelectOrganization: () => ({
    mutateAsync: vi.fn().mockResolvedValue({}),
    isPending: false,
  }),
}));

// Stand-ins for each step. The details form is an uncontrolled input, so it
// loses what was typed only if the step is unmounted.
vi.mock("@/features/auth", () => ({
  RegisterForm: ({
    onSubmit,
  }: {
    onSubmit: (values: {
      fullName: string;
      email: string;
      password: string;
    }) => void;
  }) => (
    <button
      type="button"
      onClick={() =>
        onSubmit({
          fullName: "Asha Nair",
          email: "asha@example.com",
          password: "pw-123456",
        })
      }
    >
      Continue
    </button>
  ),
  RegisterRoleSelection: ({
    onSubmit,
  }: {
    onSubmit: (role: string) => void;
  }) => (
    <button type="button" onClick={() => onSubmit("student")}>
      Student
    </button>
  ),
  RegisterRoleDetails: ({
    onSubmit,
  }: {
    onSubmit: (values: { college: string }) => void;
  }) => (
    <div>
      <input aria-label="College" />
      <button type="button" onClick={() => onSubmit({ college: "c-1" })}>
        Create account
      </button>
    </div>
  ),
  useRegister: () => ({ mutateAsync: registerMutate, isPending: false }),
  useCompanyRegister: () => ({ mutateAsync: vi.fn(), isPending: false }),
}));

vi.mock("@/features/email-verification", () => ({
  SignupEmailVerifyStep: ({
    onVerified,
  }: {
    onVerified: (token: string) => void;
  }) => (
    <button
      type="button"
      onClick={() => onVerified(verifyTokens.shift() ?? "tok-x")}
    >
      Enter code
    </button>
  ),
}));

import { RegisterClient } from "./register-client";

const expired = () =>
  new ApiError(400, "Please verify your email again.", {
    message: {
      general: ["Please verify your email again."],
      error_code: "email_verification_required",
    },
    response: {},
  });

describe("RegisterClient", () => {
  it("re-verifies an expired email without losing the details form", async () => {
    render(<RegisterClient />);
    fireEvent.click(screen.getByRole("button", { name: "Continue" }));
    fireEvent.click(screen.getByRole("button", { name: "Enter code" }));
    fireEvent.click(screen.getByRole("button", { name: "Student" }));
    fireEvent.change(screen.getByLabelText("College"), {
      target: { value: "Model Engineering College" },
    });

    registerMutate.mockRejectedValueOnce(expired());
    fireEvent.click(screen.getByRole("button", { name: "Create account" }));

    // A fresh code is requested over the form, and what was typed survives.
    expect(
      await screen.findByRole("button", { name: "Enter code" }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("College")).toHaveValue(
      "Model Engineering College",
    );

    // Once confirmed, the next submit carries the new token.
    fireEvent.click(screen.getByRole("button", { name: "Enter code" }));
    registerMutate.mockResolvedValueOnce({ tokens: {}, userInfo: {} });
    fireEvent.click(screen.getByRole("button", { name: "Create account" }));
    await waitFor(() => expect(registerMutate).toHaveBeenCalledTimes(2));
    expect(registerMutate.mock.calls[1][0]).toMatchObject({
      email_verification_token: "tok-2",
    });
    expect(registerMutate.mock.calls[0][0]).toMatchObject({
      email_verification_token: "tok-1",
    });
  });
});
