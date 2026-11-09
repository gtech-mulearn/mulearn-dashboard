import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { FuturemugLogo, FuturemugMark } from "./futuremug-logo";

describe("Futuremug logo", () => {
  it("names itself and themes its letters", () => {
    render(<FuturemugLogo />);
    const logo = screen.getByRole("img", { name: "Futuremug" });
    expect(logo).toHaveClass("text-[#11203E]", "dark:text-white");
    expect(logo.querySelectorAll('path[fill="currentColor"]')).toHaveLength(9);
    expect(logo.querySelectorAll("path")).toHaveLength(26);
  });

  it("has a decorative mug-only mark", () => {
    const { container } = render(<FuturemugMark />);
    const mark = container.querySelector("svg");
    expect(mark).toHaveAttribute("aria-hidden", "true");
    expect(mark?.querySelectorAll('path[fill="currentColor"]')).toHaveLength(0);
    expect(mark?.querySelectorAll("path")).toHaveLength(17);
  });
});
