import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { describe, expect, it } from "vitest";
import { findings, LIST, run } from "./check-feature-imports";

function tree(files: Record<string, string>): string {
  const root = mkdtempSync(join(tmpdir(), "feature-imports-"));
  for (const [path, text] of Object.entries(files)) {
    mkdirSync(dirname(join(root, path)), { recursive: true });
    writeFileSync(join(root, path), text);
  }
  return root;
}

const BASE = {
  "src/features/a/index.ts": 'export { y } from "./internal";\n',
  "src/features/a/internal.ts": "export const y = 1;\n",
  "src/features/a/self.ts":
    'import { y } from "./internal";\nimport { y as z } from "@/features/a/internal";\nexport const s = y + z;\n',
  "src/features/b/index.ts": "export {};\n",
  "src/features/b/uses.ts":
    'import { y } from "@/features/a";\nexport const u = y;\n',
};

describe("findings", () => {
  it("allows imports through a feature's index.ts and inside a feature", () => {
    expect(findings(tree(BASE))).toEqual([]);
  });

  it("reports alias and relative imports of another feature's internals, static and dynamic", () => {
    const root = tree({
      ...BASE,
      "src/features/b/deep.ts":
        'import type { T } from "@/features/a/internal";\n',
      "src/app/page.tsx": 'const m = () => import("../features/a/internal");\n',
      "src/features/b/mocked.test.ts":
        'vi.mock("@/features/a/internal");\n// import { y } from "@/features/a/internal";\n',
    });
    expect(findings(root)).toEqual([
      "a | src/app/page.tsx | ../features/a/internal",
      "a | src/features/b/deep.ts | @/features/a/internal",
    ]);
  });

  it("reports a shared layer importing any feature, even through its index.ts", () => {
    const root = tree({
      ...BASE,
      "src/lib/util.ts": 'export { y } from "@/features/a";\n',
    });
    expect(findings(root)).toEqual(["a | src/lib/util.ts | @/features/a"]);
  });

  it("reports a feature folder without an index.ts", () => {
    const root = tree({
      ...BASE,
      "src/features/c/thing.ts": "export const t = 1;\n",
    });
    expect(findings(root)).toEqual(["c | missing-index"]);
  });
});

describe("run", () => {
  function setup(extra: Record<string, string>, list: string | null) {
    const root = tree({ ...BASE, ...extra });
    if (list !== null) writeFileSync(join(root, "list.txt"), list);
    const lines: string[] = [];
    const exec = (...args: string[]) =>
      run(args, { root, list: "list.txt", error: (l) => lines.push(l) });
    return { root, lines, exec };
  }
  const deep = {
    "src/features/b/deep.ts": 'import { y } from "@/features/a/internal";\n',
  };
  const listed =
    "# known\na | src/features/b/deep.ts | @/features/a/internal\n";

  it("passes when every finding is listed", () => {
    expect(setup(deep, listed).exec()).toBe(0);
  });

  it("fails and names a new deep import with its file", () => {
    const { lines, exec } = setup(deep, "# known\n");
    expect(exec()).toBe(1);
    expect(lines.join("\n")).toContain("src/features/b/deep.ts");
  });

  it("fails on a listed import that no longer exists", () => {
    const { lines, exec } = setup({}, listed);
    expect(exec()).toBe(1);
    expect(lines.join("\n")).toContain(
      "a | src/features/b/deep.ts | @/features/a/internal",
    );
  });

  it("fails on an unsorted list, and on a missing list", () => {
    const unsorted =
      "c | missing-index\na | src/features/b/deep.ts | @/features/a/internal\n";
    const { lines, exec } = setup(
      { ...deep, "src/features/c/t.ts": "export {};\n" },
      unsorted,
    );
    expect(exec()).toBe(1);
    expect(lines.join("\n")).toMatch(/not sorted/);
    expect(setup(deep, null).exec()).toBe(1);
  });

  it("--update removes stale lines, never adds new findings, and keeps the comments", () => {
    const { root, exec } = setup(
      {
        "src/features/b/new.ts": 'import { y } from "@/features/a/internal";\n',
      },
      listed,
    );
    expect(exec("--update")).toBe(1);
    expect(readFileSync(join(root, "list.txt"), "utf8")).toBe("# known\n");
  });

  it("--update seeds a missing list", () => {
    const { root, exec } = setup(deep, null);
    expect(exec("--update")).toBe(0);
    expect(readFileSync(join(root, "list.txt"), "utf8")).toMatch(
      /^# [\s\S]*\na \| src\/features\/b\/deep\.ts \| @\/features\/a\/internal\n$/,
    );
  });

  it("uses the repository list by default", () => {
    expect(LIST).toBe("scripts/allowlists/feature-imports.txt");
  });
});
