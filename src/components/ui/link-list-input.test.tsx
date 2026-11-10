import { fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { describe, expect, it } from "vitest";
import { LinkListInput } from "./link-list-input";

function Harness({ initial = [], max }: { initial?: string[]; max?: number }) {
  const [links, setLinks] = useState<string[]>(initial);
  return (
    <>
      <LinkListInput
        id="links"
        aria-label="Image link"
        value={links}
        onChange={setLinks}
        max={max}
      />
      <output data-testid="value">{JSON.stringify(links)}</output>
    </>
  );
}

const value = () => JSON.parse(screen.getByTestId("value").textContent ?? "[]");
const input = () => screen.getByLabelText("Image link");

describe("LinkListInput", () => {
  it("adds a link on Enter and normalizes it to https", () => {
    render(<Harness />);
    fireEvent.change(input(), { target: { value: "imgur.com/a.png" } });
    fireEvent.keyDown(input(), { key: "Enter" });
    expect(value()).toEqual(["https://imgur.com/a.png"]);
    expect(input()).toHaveValue("");
  });

  it("adds a link with the Add button", () => {
    render(<Harness />);
    fireEvent.change(input(), { target: { value: "https://a.com/1.png" } });
    fireEvent.click(screen.getByRole("button", { name: "Add link" }));
    expect(value()).toEqual(["https://a.com/1.png"]);
  });

  it("rejects text that is not a link and explains why", () => {
    render(<Harness />);
    fireEvent.change(input(), { target: { value: "not a link" } });
    fireEvent.keyDown(input(), { key: "Enter" });
    expect(value()).toEqual([]);
    expect(screen.getByRole("alert")).toHaveTextContent("Enter a valid link");
  });

  it("does not add the same link twice", () => {
    render(<Harness initial={["https://a.com/1.png"]} />);
    fireEvent.change(input(), { target: { value: "a.com/1.png" } });
    fireEvent.keyDown(input(), { key: "Enter" });
    expect(value()).toEqual(["https://a.com/1.png"]);
    expect(screen.getByRole("alert")).toHaveTextContent("already added");
  });

  it("removes a link", () => {
    render(
      <Harness initial={["https://a.com/1.png", "https://b.com/2.png"]} />,
    );
    fireEvent.click(
      screen.getByRole("button", { name: "Remove https://a.com/1.png" }),
    );
    expect(value()).toEqual(["https://b.com/2.png"]);
  });

  it("stops accepting links at the limit", () => {
    render(<Harness initial={["https://a.com/1.png"]} max={1} />);
    expect(input()).toBeDisabled();
    expect(screen.getByText("You can add up to 1 link.")).toBeInTheDocument();
  });
});
