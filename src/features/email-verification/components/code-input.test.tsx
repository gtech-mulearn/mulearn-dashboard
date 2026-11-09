import { fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { CodeInput } from "./code-input";

function Harness({ onComplete }: { onComplete: (code: string) => void }) {
  const [value, setValue] = useState("");
  return (
    <CodeInput value={value} onChange={setValue} onComplete={onComplete} />
  );
}

describe("CodeInput", () => {
  it("keeps only digits from a pasted code and completes", () => {
    const onComplete = vi.fn();
    render(<Harness onComplete={onComplete} />);
    const input = screen.getByLabelText("6-digit code");
    fireEvent.change(input, { target: { value: "123 - 456" } });
    expect(input).toHaveValue("123456");
    expect(onComplete).toHaveBeenCalledWith("123456");
  });

  it("ignores letters and stops at six digits", () => {
    const onComplete = vi.fn();
    render(<Harness onComplete={onComplete} />);
    const input = screen.getByLabelText("6-digit code");
    fireEvent.change(input, { target: { value: "12ab" } });
    expect(input).toHaveValue("12");
    expect(onComplete).not.toHaveBeenCalled();
    fireEvent.change(input, { target: { value: "12345678" } });
    expect(input).toHaveValue("123456");
  });

  it("is a one-time-code numeric field for autofill and mobile keyboards", () => {
    render(<Harness onComplete={vi.fn()} />);
    const input = screen.getByLabelText("6-digit code");
    expect(input).toHaveAttribute("autocomplete", "one-time-code");
    expect(input).toHaveAttribute("inputmode", "numeric");
  });
});
