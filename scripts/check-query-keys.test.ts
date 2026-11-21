import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  countInlineKeys,
  inlineKeyCounts,
  LIST,
  run,
} from "./check-query-keys";

describe("countInlineKeys", () => {
  it("counts arrays that start with a string literal, once each, including invalidations", () => {
    const source = `
      useQuery({ queryKey: ["events", id], queryFn });
      useQuery({ queryKey: [\`events-\${id}\`] as const, queryFn });
      queryClient.invalidateQueries({ queryKey: ['events'] });
    `;
    expect(countInlineKeys("a.ts", source)).toBe(3);
  });

  it("ignores factory keys, comments and strings", () => {
    const source = `
      useQuery({ queryKey: eventKeys.detail(id), queryFn });
      useQuery({ queryKey: [...eventKeys.all, "x"], queryFn });
      // useQuery({ queryKey: ["commented"] });
      const s = 'queryKey: ["in a string"]';
    `;
    expect(countInlineKeys("a.ts", source)).toBe(0);
  });
});

describe("run", () => {
  function setup(files: Record<string, string>, list: string | null) {
    const root = mkdtempSync(join(tmpdir(), "query-keys-"));
    for (const [path, text] of Object.entries(files)) {
      mkdirSync(dirname(join(root, path)), { recursive: true });
      writeFileSync(join(root, path), text);
    }
    if (list !== null) writeFileSync(join(root, "list.txt"), list);
    const lines: string[] = [];
    const exec = (...args: string[]) =>
      run(args, { root, list: "list.txt", error: (l) => lines.push(l) });
    return { root, lines, exec };
  }
  const two =
    'useQuery({ queryKey: ["a"] });\nuseQuery({ queryKey: ["b"] });\n';
  const listed = "# known\nsrc/x.ts | 2\n";

  it("reports per-file counts with forward slashes", () => {
    const { root } = setup(
      {
        "src/x.ts": two,
        "src/features/f/k.ts": "useQuery({ queryKey: k.all });\n",
      },
      null,
    );
    expect(inlineKeyCounts(root)).toEqual(new Map([["src/x.ts", 2]]));
  });

  it("passes when the counts match", () => {
    expect(setup({ "src/x.ts": two }, listed).exec()).toBe(0);
  });

  it("fails and names a file with a new inline key", () => {
    const { lines, exec } = setup(
      { "src/x.ts": two, "src/y.tsx": 'useQuery({ queryKey: ["c"] });\n' },
      listed,
    );
    expect(exec()).toBe(1);
    expect(lines.join("\n")).toContain("src/y.tsx");
  });

  it("fails when a listed file's count goes up", () => {
    const { lines, exec } = setup(
      { "src/x.ts": `${two}useQuery({ queryKey: ["d"] });\n` },
      listed,
    );
    expect(exec()).toBe(1);
    expect(lines.join("\n")).toContain("src/x.ts");
  });

  it("fails when a count goes down without a list update", () => {
    const { lines, exec } = setup(
      { "src/x.ts": 'useQuery({ queryKey: ["a"] });\n' },
      listed,
    );
    expect(exec()).toBe(1);
    expect(lines.join("\n")).toMatch(/src\/x\.ts.*1.*2|src\/x\.ts.*2.*1/);
  });

  it("fails on an unsorted list, and on a missing list", () => {
    const files = {
      "src/x.ts": two,
      "src/a.ts": 'useQuery({ queryKey: ["a"] });\n',
    };
    const { lines, exec } = setup(files, "src/x.ts | 2\nsrc/a.ts | 1\n");
    expect(exec()).toBe(1);
    expect(lines.join("\n")).toMatch(/not sorted/);
    expect(setup(files, null).exec()).toBe(1);
  });

  it("--update lowers counts and drops files at zero, but never raises or adds", () => {
    const { root, exec } = setup(
      {
        "src/x.ts": 'useQuery({ queryKey: ["a"] });\n',
        "src/new.ts": 'useQuery({ queryKey: ["n"] });\n',
      },
      "# known\nsrc/gone.ts | 3\nsrc/x.ts | 2\n",
    );
    expect(exec("--update")).toBe(1);
    expect(readFileSync(join(root, "list.txt"), "utf8")).toBe(
      "# known\nsrc/x.ts | 1\n",
    );
  });

  it("--update seeds a missing list", () => {
    const { root, exec } = setup({ "src/x.ts": two }, null);
    expect(exec("--update")).toBe(0);
    expect(readFileSync(join(root, "list.txt"), "utf8")).toMatch(
      /^# [\s\S]*\nsrc\/x\.ts \| 2\n$/,
    );
  });

  it("uses the repository list by default", () => {
    expect(LIST).toBe("scripts/allowlists/query-keys.txt");
  });
});
