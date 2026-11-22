/**
 * Fail when a route group's first-load JavaScript goes over its budget (issue 0029).
 *
 *   bun run build && bun scripts/check-bundle-budgets.ts            check
 *   bun scripts/check-bundle-budgets.ts --update                    lower budgets to measured + 5%; seed if missing
 *
 * Reads the Next 16.2 Turbopack build output in .next/:
 * - build-manifest.json: rootMainFiles, the chunks every page loads (polyfillFiles are left out:
 *   only legacy browsers load them);
 * - server/app/<route>/page_client-reference-manifest.js: entryJSFiles, the client chunks of every
 *   segment on that route (its layouts, page, loading, error and not-found files).
 * A route's first load is the gzipped size of the union of those files. A route group is the
 * top-level group under src/app, such as (dashboard), or (root) for pages outside any group, and
 * its size is its largest route. The budget per group is in scripts/allowlists/bundle-budgets.json.
 * Exits 1 when a route goes over its group's budget, printing the route and both sizes, or when
 * the build output or the budgets are missing or unreadable. --update never raises a budget:
 * raising one is a hand edit that a reviewer agrees to.
 * Rules: docs/architecture/github-issues/README.md#rules-for-the-check-scripts.
 */
import {
  existsSync,
  readdirSync,
  readFileSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { dirname, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { gzipSync } from "node:zlib";

export const BUDGETS = "scripts/allowlists/bundle-budgets.json";
const HEADROOM = 1.05;
const COMMENT =
  "Gzipped first-load JS budget per route group, in bytes (scripts/check-bundle-budgets.ts). " +
  "Seeded from the first measurement plus 5%. --update only lowers a budget; raising one needs a reviewer.";

export type Measurement = { group: string; route: string; bytes: number };

function walk(directory: string, found: string[] = []): string[] {
  for (const name of readdirSync(directory)) {
    const path = join(directory, name);
    if (statSync(path).isDirectory()) walk(path, found);
    else if (name === "page_client-reference-manifest.js") found.push(path);
  }
  return found;
}

/** The entryJSFiles of one page_client-reference-manifest.js. */
export function entryFiles(manifestSource: string): string[] {
  // The file is `globalThis.__RSC_MANIFEST = … || {};` then `globalThis.__RSC_MANIFEST["<route>"] = {…};`.
  // The route key is a quoted string that may itself contain brackets, as in "/events/[id]/page".
  const assignment = /__RSC_MANIFEST\["(?:[^"\\]|\\.)*"\]\s*=\s*/.exec(
    manifestSource,
  );
  const end = manifestSource.lastIndexOf("}");
  if (!assignment || end < assignment.index)
    throw new Error("no __RSC_MANIFEST entry in the manifest");
  const json = manifestSource.slice(
    assignment.index + assignment[0].length,
    end + 1,
  );
  const data = JSON.parse(json) as { entryJSFiles?: Record<string, string[]> };
  if (!data.entryJSFiles) throw new Error("the manifest has no entryJSFiles");
  return Object.values(data.entryJSFiles).flat();
}

/** "/(dashboard)/dashboard/events" -> "(dashboard)"; anything outside a group -> "(root)". */
export function groupOf(route: string): string {
  const first = route.split("/")[1] ?? "";
  return /^\(.+\)$/.test(first) ? first : "(root)";
}

export function measure(nextDir: string): Measurement[] {
  const manifest = JSON.parse(
    readFileSync(join(nextDir, "build-manifest.json"), "utf8"),
  ) as {
    rootMainFiles?: string[];
  };
  const shared = manifest.rootMainFiles ?? [];
  const appDir = join(nextDir, "server", "app");
  const sizes = new Map<string, number>();
  const size = (file: string) => {
    if (!sizes.has(file))
      sizes.set(file, gzipSync(readFileSync(join(nextDir, file))).length);
    return sizes.get(file) as number;
  };
  return walk(appDir)
    .map((path) => {
      const route =
        `/${relative(appDir, dirname(path)).split(sep).join("/")}`.replace(
          /\/$/,
          "",
        ) || "/";
      const files = new Set([
        ...shared,
        ...entryFiles(readFileSync(path, "utf8")),
      ]);
      const bytes = [...files].reduce((total, file) => total + size(file), 0);
      return { group: groupOf(route), route, bytes };
    })
    .sort((a, b) => (a.route < b.route ? -1 : a.route > b.route ? 1 : 0));
}

export function largestPerGroup(
  measurements: Measurement[],
): Map<string, Measurement> {
  const largest = new Map<string, Measurement>();
  for (const item of measurements) {
    const current = largest.get(item.group);
    if (!current || item.bytes > current.bytes) largest.set(item.group, item);
  }
  return largest;
}

export function overBudget(
  measurements: Measurement[],
  budgets: Record<string, number>,
): string[] {
  return measurements
    .filter(
      (item) =>
        item.bytes > (budgets[item.group] ?? Number.POSITIVE_INFINITY) ||
        !(item.group in budgets),
    )
    .map((item) =>
      item.group in budgets
        ? `${item.route}: ${kb(item.bytes)} is over the ${item.group} budget of ${kb(budgets[item.group])}`
        : `${item.route}: its group ${item.group} has no budget in ${BUDGETS}`,
    );
}

/** Lower each budget to the measured size + 5%, never raise one, and add missing groups. */
export function updatedBudgets(
  measurements: Measurement[],
  budgets: Record<string, number>,
): Record<string, number> {
  const next: Record<string, number> = {};
  for (const [group, item] of [...largestPerGroup(measurements)].sort(
    ([a], [b]) => (a < b ? -1 : 1),
  )) {
    const proposed = Math.ceil(item.bytes * HEADROOM);
    next[group] =
      group in budgets ? Math.min(budgets[group], proposed) : proposed;
  }
  return next;
}

function kb(bytes: number): string {
  return `${(bytes / 1024).toFixed(1)} kB`;
}

function main(argv: string[]): number {
  const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
  const nextDir = join(root, ".next");
  if (
    !existsSync(join(nextDir, "build-manifest.json")) ||
    !existsSync(join(nextDir, "server", "app"))
  ) {
    console.error("No build output in .next/. Run bun run build first.");
    return 1;
  }
  let measurements: Measurement[];
  try {
    measurements = measure(nextDir);
  } catch (error) {
    console.error(`Can't read the build output: ${(error as Error).message}`);
    return 1;
  }
  if (measurements.length === 0) {
    console.error("The build output lists no routes.");
    return 1;
  }
  const path = join(root, BUDGETS);
  let budgets: Record<string, number> = {};
  if (existsSync(path)) {
    try {
      budgets = (
        JSON.parse(readFileSync(path, "utf8")) as {
          budgets: Record<string, number>;
        }
      ).budgets;
    } catch (error) {
      console.error(`Can't read ${BUDGETS}: ${(error as Error).message}`);
      return 1;
    }
  } else if (!argv.includes("--update")) {
    console.error(`${BUDGETS} is missing. Seed it with --update.`);
    return 1;
  }

  for (const [group, item] of [...largestPerGroup(measurements)].sort(
    ([a], [b]) => (a < b ? -1 : 1),
  )) {
    const budget = budgets[group];
    console.error(
      `${group}: largest route ${item.route} loads ${kb(item.bytes)}; budget ${budget ? kb(budget) : "none"}`,
    );
  }

  if (argv.includes("--update")) {
    const next = updatedBudgets(measurements, budgets);
    writeFileSync(
      path,
      `${JSON.stringify({ comment: COMMENT, budgets: next }, null, 2)}\n`,
    );
    console.error(`Wrote ${BUDGETS}.`);
    return 0;
  }
  const problems = overBudget(measurements, budgets);
  if (problems.length > 0) {
    console.error(`Over budget (${problems.length}):`);
    for (const problem of problems) console.error(`  ${problem}`);
    console.error(
      "Reduce what the route loads first, or raise the budget in the same pull request and say why.",
    );
    return 1;
  }
  console.error(
    `Bundle budgets OK: ${measurements.length} routes in ${largestPerGroup(measurements).size} groups.`,
  );
  return 0;
}

if (
  process.argv[1] &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  process.exit(main(process.argv.slice(2)));
}
