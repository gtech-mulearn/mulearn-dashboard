import { fireEvent, render, screen } from "@testing-library/react";
import { Eye } from "lucide-react";
import { describe, expect, it, vi } from "vitest";
import { RowActionButton } from "./row-action-button";

describe("RowActionButton", () => {
  it("is an icon button named by its label", () => {
    render(<RowActionButton icon={Eye} label="View" onClick={() => {}} />);
    expect(screen.getByRole("button", { name: "View" })).toBeInTheDocument();
  });

  it("runs its action on click", () => {
    const onClick = vi.fn();
    render(<RowActionButton icon={Eye} label="View" onClick={onClick} />);
    fireEvent.click(screen.getByRole("button", { name: "View" }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("does nothing while disabled", () => {
    const onClick = vi.fn();
    render(
      <RowActionButton icon={Eye} label="View" onClick={onClick} disabled />,
    );
    fireEvent.click(screen.getByRole("button", { name: "View" }));
    expect(onClick).not.toHaveBeenCalled();
  });
});
