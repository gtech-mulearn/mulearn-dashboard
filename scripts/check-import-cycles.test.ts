import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  cyclesFromMadge,
  LIST,
  normalizeCycle,
  run,
} from "./check-import-cycles";

const CYCLE_A = ["features/x/index.ts", "features/x/components/a.tsx"];
const CYCLE_B = ["lib/b.ts", "lib/c.ts", "lib/a.ts"];

describe("normalizeCycle", () => {
  it("starts at the alphabetically first file, keeps the direction, and joins with ' > '", () => {
    expect(normalizeCycle(CYCLE_B)).toBe("lib/a.ts > lib/b.ts > lib/c.ts");
  });

  it("gives the same line for the same cycle found from another file", () => {
    expect(normalizeCycle(["lib/c.ts", "lib/a.ts", "lib/b.ts"])).toBe(
      normalizeCycle(CYCLE_B),
    );
  });

  it("uses forward slashes", () => {
    expect(normalizeCycle(["lib\\b.ts", "lib\\a.ts"])).toBe(
      "lib/a.ts > lib/b.ts",
    );
  });
});

describe("cyclesFromMadge", () => {
  it("returns every cycle once, normalised and sorted", () => {
    const output = JSON.stringify([
      CYCLE_B,
      CYCLE_A,
      ["lib/c.ts", "lib/a.ts", "lib/b.ts"],
    ]);
    expect(cyclesFromMadge(output)).toEqual([
      "features/x/components/a.tsx > features/x/index.ts",
      "lib/a.ts > lib/b.ts > lib/c.ts",
    ]);
  });

  it("throws on output that isn't madge's JSON", () => {
    expect(() => cyclesFromMadge("Processed 1 file")).toThrow();
    expect(() => cyclesFromMadge(JSON.stringify({ a: 1 }))).toThrow();
  });
});

describe("run", () => {
  function setup(list: string | null, madgeOutput: string) {
    const root = mkdtempSync(join(tmpdir(), "cycles-"));
    if (list !== null) writeFileSync(join(root, "cycles.txt"), list);
    const lines: string[] = [];
    const exec = (...args: string[]) =>
      run(args, {
        root,
        list: "cycles.txt",
        madge: () => madgeOutput,
        error: (l) => lines.push(l),
      });
    return { root, lines, exec };
  }
  const listed =
    "# known cycles\nfeatures/x/components/a.tsx > features/x/index.ts\n";

  it("passes when every cycle is listed", () => {
    expect(setup(listed, JSON.stringify([CYCLE_A])).exec()).toBe(0);
  });

  it("fails and names a new cycle with its files", () => {
    const { lines, exec } = setup(listed, JSON.stringify([CYCLE_A, CYCLE_B]));
    expect(exec()).toBe(1);
    expect(lines.join("\n")).toContain("lib/a.ts > lib/b.ts > lib/c.ts");
  });

  it("fails and names a listed cycle that no longer exists", () => {
    const { lines, exec } = setup(listed, JSON.stringify([]));
    expect(exec()).toBe(1);
    expect(lines.join("\n")).toContain(
      "features/x/components/a.tsx > features/x/index.ts",
    );
  });

  it("fails on an unsorted list", () => {
    const unsorted =
      "lib/a.ts > lib/b.ts > lib/c.ts\nfeatures/x/components/a.tsx > features/x/index.ts\n";
    const { lines, exec } = setup(unsorted, JSON.stringify([CYCLE_A, CYCLE_B]));
    expect(exec()).toBe(1);
    expect(lines.join("\n")).toMatch(/not sorted/);
  });

  it("fails when madge's output can't be read, or the list is missing", () => {
    expect(setup(listed, "madge crashed").exec()).toBe(1);
    expect(setup(null, JSON.stringify([CYCLE_A])).exec()).toBe(1);
  });

  it("--update removes cycles that are gone, never adds new ones, and keeps the comments", () => {
    const { root, exec } = setup(
      `${listed}lib/a.ts > lib/b.ts > lib/c.ts\n`,
      JSON.stringify([CYCLE_B, ["z/1.ts", "z/2.ts"]]),
    );
    expect(exec("--update")).toBe(1);
    expect(readFileSync(join(root, "cycles.txt"), "utf8")).toBe(
      "# known cycles\nlib/a.ts > lib/b.ts > lib/c.ts\n",
    );
  });

  it("--update seeds a missing list", () => {
    const { root, exec } = setup(null, JSON.stringify([CYCLE_B, CYCLE_A]));
    expect(exec("--update")).toBe(0);
    expect(readFileSync(join(root, "cycles.txt"), "utf8")).toMatch(
      /^# [\s\S]*\nfeatures\/x\/components\/a\.tsx > features\/x\/index\.ts\nlib\/a\.ts > lib\/b\.ts > lib\/c\.ts\n$/,
    );
  });

  it("uses the repository list by default", () => {
    expect(LIST).toBe("scripts/allowlists/import-cycles.txt");
  });
});
