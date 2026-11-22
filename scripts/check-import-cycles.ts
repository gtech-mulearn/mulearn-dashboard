/**
 * Fail on new import cycles, against a shrink-only list of the cycles that exist today.
 *
 *   bun scripts/check-import-cycles.ts            check
 *   bun scripts/check-import-cycles.ts --update   remove listed cycles that no longer exist
 *
 * Runs `bunx madge --circular --json --extensions ts,tsx --ts-config tsconfig.json src`. Each cycle
 * is normalised: rotated to start at its alphabetically first file, joined with " > ", so the same
 * cycle found from another file gives the same line. Exits 1 on a cycle that isn't listed, a listed
 * cycle that no longer exists, an unsorted list, or madge output that can't be read.
 * --update never adds a cycle; it seeds the list only when the list doesn't exist yet.
 * Rules: docs/architecture/github-issues/README.md#rules-for-the-check-scripts.
 */
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, isAbsolute, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export const LIST = "scripts/allowlists/import-cycles.txt";

const HEADER = [
  "# Import cycles that exist on dev today (madge, paths relative to src/). This list only shrinks:",
  "# break a cycle, never add one. A new cycle fails CI, and so does a listed cycle that no longer exists.",
  "# Format: one cycle per line, starting at its alphabetically first file, joined with ' > ', sorted.",
  "# After breaking a cycle, remove its line with: bun scripts/check-import-cycles.ts --update",
];

export function normalizeCycle(files: string[]): string {
  const f = files.map((p) => p.replace(/\\/g, "/"));
  let start = 0;
  for (let i = 1; i < f.length; i++) if (f[i] < f[start]) start = i;
  return [...f.slice(start), ...f.slice(0, start)].join(" > ");
}

export function cyclesFromMadge(output: string): string[] {
  const data: unknown = JSON.parse(output);
  if (
    !Array.isArray(data) ||
    !data.every(
      (c) => Array.isArray(c) && c.every((p) => typeof p === "string"),
    )
  ) {
    throw new Error("madge output is not a list of cycles");
  }
  return [...new Set((data as string[][]).map(normalizeCycle))].sort();
}

function runMadge(root: string): string {
  const r = spawnSync(
    "bunx",
    [
      "madge",
      "--circular",
      "--json",
      "--extensions",
      "ts,tsx",
      "--ts-config",
      "tsconfig.json",
      "src",
    ],
    { cwd: root, encoding: "utf8", shell: process.platform === "win32" },
  );
  // madge exits 1 whenever it finds a cycle, so the exit code alone means nothing here.
  return (
    `${r.stdout ?? ""}`.trim() ||
    `${r.stderr ?? ""}${r.error ? r.error.message : ""}`
  );
}

function readList(text: string): { entries: string[]; sorted: boolean } {
  const entries = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith("#"));
  return {
    entries,
    sorted: entries.every((e, i) => i === 0 || entries[i - 1] <= e),
  };
}

export function run(
  args: string[],
  io: {
    root: string;
    list?: string;
    madge?: () => string;
    error: (line: string) => void;
  },
): number {
  const update = args.includes("--update");
  const output = (io.madge ?? (() => runMadge(io.root)))();
  let cycles: string[];
  try {
    cycles = cyclesFromMadge(output);
  } catch (e) {
    io.error(
      `Can't read madge's output (${e instanceof Error ? e.message : String(e)}):\n${output.slice(0, 500)}`,
    );
    return 1;
  }
  const listName = io.list ?? LIST;
  const listPath = isAbsolute(listName) ? listName : resolve(io.root, listName);

  if (!existsSync(listPath)) {
    if (!update) {
      io.error(`Cycle list not found: ${listPath}. Create it with --update.`);
      return 1;
    }
    mkdirSync(dirname(listPath), { recursive: true });
    writeFileSync(listPath, `${[...HEADER, ...cycles].join("\n")}\n`);
    io.error(`Seeded ${listPath} with ${cycles.length} cycles.`);
    return 0;
  }

  const text = readFileSync(listPath, "utf8");
  const { entries, sorted } = readList(text);
  const found = new Set(cycles);
  const known = new Set(entries);
  const added = cycles.filter((c) => !known.has(c));
  const gone = entries.filter((c) => !found.has(c)).sort();

  if (update) {
    const drop = new Set(gone);
    const lines = text.split(/\r?\n/).filter((l) => !drop.has(l.trim()));
    writeFileSync(listPath, `${lines.join("\n").replace(/\n+$/, "")}\n`);
    for (const c of gone) io.error(`Removed: ${c}`);
    for (const c of added)
      io.error(`New cycle (not added, break it instead): ${c}`);
    return added.length ? 1 : 0;
  }

  for (const c of added) io.error(`New import cycle, not in the list: ${c}`);
  for (const c of gone)
    io.error(`Listed cycle no longer exists, remove it from the list: ${c}`);
  if (!sorted) io.error(`${listName} is not sorted (plain code-unit order).`);
  const bad = added.length + gone.length + (sorted ? 0 : 1);
  if (bad === 0)
    io.error(`Import cycles OK: ${cycles.length} known, no new ones.`);
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
