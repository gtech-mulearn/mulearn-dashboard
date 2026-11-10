import { fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { describe, expect, it } from "vitest";
import { Combobox } from "./combobox";

// A parent that searches on the server: an empty search returns the first
// page only, which does not include every option.
const FIRST_PAGE = [{ id: "1", title: "Alpha College" }];
const ZETA = { id: "9", title: "Zeta College" };

function ServerSearchField({ selectedLabel }: { selectedLabel?: string }) {
  const [search, setSearch] = useState("");
  const [value, setValue] = useState("");
  const options = search.toLowerCase().startsWith("ze") ? [ZETA] : FIRST_PAGE;
  return (
    <Combobox
      options={options}
      value={value}
      onValueChange={setValue}
      onSearchChange={setSearch}
      selectedLabel={selectedLabel}
      placeholder="College"
    />
  );
}

function pickZeta() {
  const input = screen.getByPlaceholderText("College");
  fireEvent.change(input, { target: { value: "zeta" } });
  fireEvent.click(screen.getByText("Zeta College"));
  return input as HTMLInputElement;
}

describe("Combobox with server-side search", () => {
  it("keeps showing the chosen name after the search resets", () => {
    render(<ServerSearchField />);
    const input = pickZeta();
    expect(input.value).toBe("Zeta College");
  });

  it("prefers the caller's selectedLabel when one is given", () => {
    render(<ServerSearchField selectedLabel="Zeta College (Kochi)" />);
    const input = pickZeta();
    expect(input.value).toBe("Zeta College (Kochi)");
  });
});
