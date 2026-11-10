import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("../../hooks", () => ({
  useEligibilityLevels: () => ({ data: [], isLoading: false, isError: false }),
  useEligibilitySkills: () => ({
    data: [
      { id: "skill-1", name: "Python" },
      { id: "skill-2", name: "Figma" },
    ],
    isLoading: false,
    isError: false,
  }),
}));

import { RuleValueField } from "./rule-add-dialog";

describe("RuleValueField — skill rule", () => {
  it("stores the chosen skill's id, never its name", () => {
    const onChange = vi.fn();
    render(<RuleValueField ruleType="skill" value="" onChange={onChange} />);
    fireEvent.click(screen.getByPlaceholderText(/search skills/i));
    fireEvent.click(screen.getByRole("button", { name: "Python" }));
    expect(onChange).toHaveBeenCalledWith("skill-1");
    expect(onChange).not.toHaveBeenCalledWith("Python");
  });
});
