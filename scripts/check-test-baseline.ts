/**
 * Compare a Vitest JSON report with the failure baseline, a shrink-only list of the tests
 * that already fail on dev.
 *
 *   bun scripts/check-test-baseline.ts vitest-report.json            check
 *   bun scripts/check-test-baseline.ts vitest-report.json --update   remove entries that no longer fail
 *
 * Exits 1 when a failing test isn't listed, when a listed test no longer fails (it passes, or it no
 * longer exists), when the list isn't sorted, or when the report is missing or unreadable.
 * --update never adds a failure to the list; it seeds the list only when the list doesn't exist yet.
 * Rules: docs/architecture/github-issues/README.md#rules-for-the-check-scripts.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, isAbsolute, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export const BASELINE = "scripts/allowlists/test-baseline.txt";

const HEADER = [
  "# Tests that fail on dev today. This list only shrinks: fix a test, never add one.",
  "# A failing test that isn't listed fails CI, and so does a listed test that passes or no longer exists.",
  "# Format: <file> > <full test name>, sorted. After a fix, remove its line with:",
  "#   bunx vitest run --reporter=json --outputFile=vitest-report.json; bun scripts/check-test-baseline.ts vitest-report.json --update",
];

interface AssertionResult {
  title: string;
  fullName?: string;
  ancestorTitles?: string[];
  status: string;
}

interface TestFileResult {
  name: string;
  status: string;
  message?: string;
  assertionResults: AssertionResult[];
}

export interface VitestReport {
  testResults: TestFileResult[];
}

const slashes = (p: string) => p.replace(/\\/g, "/");

function relativeFile(name: string, root: string): string {
  const file = slashes(name);
  const base = `${slashes(root).replace(/\/$/, "")}/`;
  return file.toLowerCase().startsWith(base.toLowerCase())
    ? file.slice(base.length)
    : file;
}

/** Every failing test as "<file> > <full test name>", plus files that failed before running a test. */
export function failingTests(report: VitestReport, root: string): string[] {
  const ids = new Set<string>();
  for (const file of report.testResults) {
    const rel = relativeFile(file.name, root);
    const failed = file.assertionResults.filter((a) => a.status === "failed");
    for (const a of failed) {
      const name =
        a.fullName ?? [...(a.ancestorTitles ?? []), a.title].join(" ");
      ids.add(`${rel} > ${name}`);
    }
    if (file.status === "failed" && file.assertionResults.length === 0) {
      ids.add(`${rel} > (file failed to load)`);
    }
  }
  return [...ids].sort();
}

export function readBaseline(text: string): {
  entries: string[];
  sorted: boolean;
} {
  const entries = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith("#"));
  const sorted = entries.every((e, i) => i === 0 || entries[i - 1] <= e);
  return { entries, sorted };
}

export function compare(
  failing: string[],
  listed: string[],
): { newFailures: string[]; noLongerFailing: string[] } {
  const f = new Set(failing);
  const l = new Set(listed);
  return {
    newFailures: failing.filter((t) => !l.has(t)).sort(),
    noLongerFailing: listed.filter((t) => !f.has(t)).sort(),
  };
}

function readReport(path: string): VitestReport | string {
  if (!existsSync(path))
    return `Report not found: ${path}. Run: bunx vitest run --reporter=json --outputFile=${path}`;
  try {
    const data = JSON.parse(readFileSync(path, "utf8"));
    if (!Array.isArray(data?.testResults))
      return `Not a Vitest JSON report (no testResults): ${path}`;
    return data as VitestReport;
  } catch (e) {
    return `Can't read ${path}: ${e instanceof Error ? e.message : String(e)}`;
  }
}

export function run(
  args: string[],
  io: { root: string; baseline?: string; error: (line: string) => void },
): number {
  const update = args.includes("--update");
  const reportArg = args.find((a) => !a.startsWith("--"));
  if (!reportArg) {
    io.error(
      "Usage: bun scripts/check-test-baseline.ts <vitest-report.json> [--update]",
    );
    return 1;
  }
  const at = (p: string) => (isAbsolute(p) ? p : resolve(io.root, p));
  const report = readReport(at(reportArg));
  if (typeof report === "string") {
    io.error(report);
    return 1;
  }
  const failing = failingTests(report, io.root);
  const baselinePath = at(io.baseline ?? BASELINE);

  if (!existsSync(baselinePath)) {
    if (!update) {
      io.error(`Baseline not found: ${baselinePath}. Create it with --update.`);
      return 1;
    }
    mkdirSync(dirname(baselinePath), { recursive: true });
    writeFileSync(baselinePath, `${[...HEADER, ...failing].join("\n")}\n`);
    io.error(`Seeded ${baselinePath} with ${failing.length} failing tests.`);
    return 0;
  }

  const text = readFileSync(baselinePath, "utf8");
  const { entries, sorted } = readBaseline(text);
  const { newFailures, noLongerFailing } = compare(failing, entries);

  if (update) {
    const keep = new Set(noLongerFailing);
    const lines = text.split(/\r?\n/).filter((l) => !keep.has(l.trim()));
    writeFileSync(baselinePath, `${lines.join("\n").replace(/\n+$/, "")}\n`);
    for (const t of noLongerFailing) io.error(`Removed: ${t}`);
    for (const t of newFailures)
      io.error(`New failure (not added, fix it instead): ${t}`);
    return newFailures.length ? 1 : 0;
  }

  for (const t of newFailures)
    io.error(`New failure, not in the baseline: ${t}`);
  for (const t of noLongerFailing)
    io.error(`Listed but no longer failing, remove it from the baseline: ${t}`);
  if (!sorted)
    io.error(
      `${io.baseline ?? BASELINE} is not sorted (plain code-unit order).`,
    );
  const bad = newFailures.length + noLongerFailing.length + (sorted ? 0 : 1);
  if (bad === 0)
    io.error(
      `Test baseline OK: ${failing.length} known failures, no new ones.`,
    );
  return bad ? 1 : 0;
}

if (
  process.argv[1] &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  process.exit(
    run(process.argv.slice(2), {
      root: process.cwd(),
      error: (l) => console.error(l),
    }),
  );
}
