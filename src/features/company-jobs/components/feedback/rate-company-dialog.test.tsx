import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "@/api/errors";

const mocks = vi.hoisted(() => ({
  submitCompanyFeedback: vi.fn(),
  toastError: vi.fn(),
  toastSuccess: vi.fn(),
}));

vi.mock("../../api", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../../api")>()),
  submitCompanyFeedback: mocks.submitCompanyFeedback,
}));
vi.mock("sonner", () => ({
  toast: { error: mocks.toastError, success: mocks.toastSuccess },
}));

import { RateCompanyDialog } from "./rate-company-dialog";

const DUPLICATE = "You have already submitted feedback for this interaction.";

function wrapper({ children }: { children: ReactNode }) {
  const client = new QueryClient({
    defaultOptions: { mutations: { retry: false } },
  });
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

function openDialog() {
  render(
    <RateCompanyDialog
      interaction="JOB"
      entityId="job1"
      companyName="Acme"
      trigger={<button type="button">Rate company</button>}
    />,
    { wrapper },
  );
  fireEvent.click(screen.getByRole("button", { name: "Rate company" }));
  return screen.findByRole("dialog");
}

describe("RateCompanyDialog", () => {
  beforeEach(() => vi.clearAllMocks());

  it("submits the chosen star rating for the interaction", async () => {
    mocks.submitCompanyFeedback.mockResolvedValue(undefined);
    const dialog = await openDialog();

    const submit = within(dialog).getByRole("button", {
      name: /submit rating/i,
    });
    expect(submit).toBeDisabled();
    fireEvent.click(within(dialog).getByRole("radio", { name: "4 stars" }));
    fireEvent.click(submit);

    await waitFor(() =>
      expect(mocks.submitCompanyFeedback).toHaveBeenCalledWith({
        interaction_type: "JOB",
        entity_id: "job1",
        rating: 4,
      }),
    );
  });

  it("includes a trimmed comment when given", async () => {
    mocks.submitCompanyFeedback.mockResolvedValue(undefined);
    const dialog = await openDialog();
    fireEvent.click(within(dialog).getByRole("radio", { name: "5 stars" }));
    fireEvent.change(within(dialog).getByLabelText(/comment/i), {
      target: { value: "  Clear and quick  " },
    });
    fireEvent.click(
      within(dialog).getByRole("button", { name: /submit rating/i }),
    );
    await waitFor(() =>
      expect(mocks.submitCompanyFeedback).toHaveBeenCalledWith({
        interaction_type: "JOB",
        entity_id: "job1",
        rating: 5,
        comment: "Clear and quick",
      }),
    );
  });

  it("shows the backend's duplicate-feedback message verbatim", async () => {
    mocks.submitCompanyFeedback.mockRejectedValue(
      new ApiError(400, DUPLICATE, {
        hasError: true,
        statusCode: 400,
        message: { general: [DUPLICATE] },
        response: {},
      }),
    );
    const dialog = await openDialog();
    fireEvent.click(within(dialog).getByRole("radio", { name: "3 stars" }));
    fireEvent.click(
      within(dialog).getByRole("button", { name: /submit rating/i }),
    );

    await waitFor(() =>
      expect(mocks.toastError).toHaveBeenCalledWith(DUPLICATE),
    );
    expect(mocks.toastError).toHaveBeenCalledTimes(1);
  });
});
