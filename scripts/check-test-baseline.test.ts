import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  BASELINE,
  compare,
  failingTests,
  readBaseline,
  run,
  type VitestReport,
} from "./check-test-baseline";

const ROOT = "C:\\repo"; // process.cwd() on Windows; Vitest reports paths with forward slashes

function report(...files: VitestReport["testResults"]): VitestReport {
  return { testResults: files };
}

const passingFile = {
  name: "C:/repo/src/a.test.ts",
  status: "passed",
  assertionResults: [
    {
      title: "works",
      ancestorTitles: ["a"],
      fullName: "a works",
      status: "passed",
    },
  ],
};
const failingFile = {
  name: "C:/repo/src/b.test.ts",
  status: "failed",
  assertionResults: [
    {
      title: "breaks",
      ancestorTitles: ["b"],
      fullName: "b breaks",
      status: "failed",
    },
    {
      title: "works",
      ancestorTitles: ["b"],
      fullName: "b works",
      status: "passed",
    },
  ],
};
const brokenFile = {
  name: "C:\\repo\\src\\c.test.tsx",
  status: "failed",
  message: "Cannot find module",
  assertionResults: [],
};

describe("failingTests", () => {
  it("lists failing tests and files that failed to load, relative, with forward slashes, sorted", () => {
    const failing = failingTests(
      report(brokenFile, failingFile, passingFile),
      ROOT,
    );
    expect(failing).toEqual([
      "src/b.test.ts > b breaks",
      "src/c.test.tsx > (file failed to load)",
    ]);
  });

  it("lists each failing test once", () => {
    expect(failingTests(report(failingFile, failingFile), ROOT)).toEqual([
      "src/b.test.ts > b breaks",
    ]);
  });
});

describe("readBaseline", () => {
  it("skips comments and blank lines, and reports whether the list is sorted", () => {
    expect(readBaseline("# header\n\nsrc/a > x\nsrc/b > y\n")).toEqual({
      entries: ["src/a > x", "src/b > y"],
      sorted: true,
    });
    expect(readBaseline("src/b > y\r\nsrc/a > x\r\n").sorted).toBe(false);
  });
});

describe("compare", () => {
  it("finds new failures and listed tests that no longer fail", () => {
    expect(
      compare(
        ["src/b > new", "src/a > known"],
        ["src/a > known", "src/c > fixed"],
      ),
    ).toEqual({
      newFailures: ["src/b > new"],
      noLongerFailing: ["src/c > fixed"],
    });
  });

  it("is clean when the failures match the list", () => {
    expect(compare(["src/a > known"], ["src/a > known"])).toEqual({
      newFailures: [],
      noLongerFailing: [],
    });
  });
});

describe("run", () => {
  function setup(baseline: string | null, json: unknown) {
    const root = mkdtempSync(join(tmpdir(), "baseline-"));
    if (baseline !== null) {
      writeFileSync(join(root, "baseline.txt"), baseline);
    }
    if (json !== undefined) {
      writeFileSync(
        join(root, "report.json"),
        typeof json === "string" ? json : JSON.stringify(json),
      );
    }
    const lines: string[] = [];
    const exec = (...extra: string[]) =>
      run(["report.json", ...extra], {
        root,
        baseline: "baseline.txt",
        error: (l) => lines.push(l),
      });
    return { root, lines, exec };
  }
  const withRoot = (root: string) =>
    report({ ...failingFile, name: join(root, "src", "b.test.ts") });

  it("passes when every failure is listed", () => {
    const { root, exec } = setup(
      "# list\nsrc/b.test.ts > b breaks\n",
      undefined,
    );
    writeFileSync(join(root, "report.json"), JSON.stringify(withRoot(root)));
    expect(exec()).toBe(0);
  });

  it("fails and names a failing test that isn't listed", () => {
    const { root, lines, exec } = setup("# list\n", undefined);
    writeFileSync(join(root, "report.json"), JSON.stringify(withRoot(root)));
    expect(exec()).toBe(1);
    expect(lines.join("\n")).toContain("src/b.test.ts > b breaks");
  });

  it("fails and names a listed test that no longer fails", () => {
    const { root, lines, exec } = setup(
      "# list\nsrc/b.test.ts > b breaks\nsrc/z.test.ts > fixed\n",
      undefined,
    );
    writeFileSync(join(root, "report.json"), JSON.stringify(withRoot(root)));
    expect(exec()).toBe(1);
    expect(lines.join("\n")).toContain("src/z.test.ts > fixed");
  });

  it("fails on an unsorted list", () => {
    const { root, lines, exec } = setup(
      "src/z.test.ts > a\nsrc/b.test.ts > b breaks\n",
      undefined,
    );
    writeFileSync(join(root, "report.json"), JSON.stringify(withRoot(root)));
    expect(exec()).toBe(1);
    expect(lines.join("\n")).toMatch(/not sorted/);
  });

  it("fails when the report is missing or can't be parsed", () => {
    expect(setup("# list\n", undefined).exec()).toBe(1);
    expect(setup("# list\n", "{not json").exec()).toBe(1);
    expect(setup("# list\n", { no: "testResults" }).exec()).toBe(1);
  });

  it("--update removes entries that no longer fail, and never adds new failures", () => {
    const { root, exec } = setup(
      "# keep me\nsrc/b.test.ts > b breaks\nsrc/z.test.ts > fixed\n",
      undefined,
    );
    writeFileSync(
      join(root, "report.json"),
      JSON.stringify(
        report(
          { ...failingFile, name: join(root, "src", "b.test.ts") },
          { ...brokenFile, name: join(root, "src", "c.test.tsx") },
        ),
      ),
    );
    expect(exec("--update")).toBe(1);
    expect(readFileSync(join(root, "baseline.txt"), "utf8")).toBe(
      "# keep me\nsrc/b.test.ts > b breaks\n",
    );
  });

  it("--update seeds a missing list with every failure", () => {
    const { root, exec } = setup(null, undefined);
    writeFileSync(join(root, "report.json"), JSON.stringify(withRoot(root)));
    expect(exec("--update")).toBe(0);
    expect(readFileSync(join(root, "baseline.txt"), "utf8")).toMatch(
      /^# [\s\S]*\nsrc\/b\.test\.ts > b breaks\n$/,
    );
  });

  it("uses the repository list by default", () => {
    expect(BASELINE).toBe("scripts/allowlists/test-baseline.txt");
  });
});
