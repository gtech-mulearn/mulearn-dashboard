import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./select";

function OpenSelect({ children }: { children?: React.ReactNode }) {
  return (
    <Select open>
      <SelectTrigger aria-label="Job">
        <SelectValue placeholder="Select a job..." />
      </SelectTrigger>
      <SelectContent>{children}</SelectContent>
    </Select>
  );
}

describe("SelectContent empty state", () => {
  it("says there are no results instead of opening a blank panel", () => {
    const jobs: string[] = [];
    render(
      <OpenSelect>
        {jobs.map((j) => (
          <SelectItem key={j} value={j}>
            {j}
          </SelectItem>
        ))}
      </OpenSelect>,
    );
    expect(screen.getByText("No results found.")).toBeInTheDocument();
  });

  it("treats an empty fragment as no results", () => {
    const jobs: string[] = [];
    render(
      <OpenSelect>
        {/* biome-ignore lint/complexity/noUselessFragments: the fragment is the case under test */}
        <>
          {jobs.map((j) => (
            <SelectItem key={j} value={j}>
              {j}
            </SelectItem>
          ))}
        </>
      </OpenSelect>,
    );
    expect(screen.getByText("No results found.")).toBeInTheDocument();
  });

  it("shows the options and no empty message when there are items", () => {
    render(
      <OpenSelect>
        <SelectItem value="fe">Frontend intern</SelectItem>
      </OpenSelect>,
    );
    expect(screen.getByText("Frontend intern")).toBeInTheDocument();
    expect(screen.queryByText("No results found.")).not.toBeInTheDocument();
  });
});
