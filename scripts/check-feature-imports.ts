/**
 * Fail on new imports that break the feature boundaries, against a shrink-only list.
 *
 *   bun scripts/check-feature-imports.ts            check
 *   bun scripts/check-feature-imports.ts --update   remove listed findings that are gone
 *
 * Scans every .ts and .tsx file under src/, tests included, for static imports and exports
 * (type-only too) and dynamic import(). vi.mock() paths are not imports. It reports:
 *   - an import of another feature's internals: "@/features/<x>/<anything>", or a relative path
 *     into src/features/<x>/, from a file outside src/features/<x>/;
 *   - any import of a feature from a shared layer (src/api, src/lib, src/hooks, src/components,
 *     src/stores), even through its index.ts;
 *   - a feature folder without an index.ts.
 * Exits 1 on a finding that isn't listed, a listed finding that no longer exists, or an unsorted
 * list. --update never adds a finding; it seeds the list only when the list doesn't exist yet.
 * Rules: docs/architecture/github-issues/README.md#rules-for-the-check-scripts and
 * docs/architecture/04-module-rules.md#import-rules.
 */
import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { dirname, isAbsolute, join, posix, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";

export const LIST = "scripts/allowlists/feature-imports.txt";

const SHARED_LAYERS = [
  "src/api/",
  "src/lib/",
  "src/hooks/",
  "src/components/",
  "src/stores/",
];

const HEADER = [
  "# Feature-boundary findings on dev today. This list only shrinks: fix an import, never add one.",
  "# A new finding fails CI, and so does a listed one that no longer exists.",
  "# Format: <target feature> | <importing file> | <import as written>, or <feature> | missing-index; sorted.",
  "# After a fix, remove its line with: bun scripts/check-feature-imports.ts --update",
];

function sourceFiles(dir: string, root: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) {
      if (name !== "node_modules") sourceFiles(full, root, out);
    } else if (/\.tsx?$/.test(name)) {
      out.push(
        posix.normalize(full.slice(root.length + 1).replace(/\\/g, "/")),
      );
    }
  }
  return out;
}

function featureOf(path: string): string | null {
  const m = /^src\/features\/([^/]+)\//.exec(path);
  return m ? m[1] : null;
}

function target(importer: string, spec: string): string | null {
  if (spec.startsWith("@/")) return `src/${spec.slice(2)}`;
  if (spec.startsWith("."))
    return posix.normalize(posix.join(posix.dirname(importer), spec));
  return null;
}

export function findings(root: string): string[] {
  const out = new Set<string>();
  const src = join(root, "src");
  for (const file of sourceFiles(src, root)) {
    const importerFeature = featureOf(file);
    const shared = SHARED_LAYERS.some((l) => file.startsWith(l));
    const { importedFiles } = ts.preProcessFile(
      readFileSync(join(root, file), "utf8"),
      true,
      true,
    );
    for (const { fileName: spec } of importedFiles) {
      const t = target(file, spec);
      if (!t?.startsWith("src/features/")) continue;
      const [, , feature, ...rest] = t.split("/");
      if (!feature || feature === importerFeature) continue;
      const publicSurface =
        rest.length === 0 ||
        (rest.length === 1 && /^index(\.tsx?)?$/.test(rest[0]));
      if (!publicSurface || shared) out.add(`${feature} | ${file} | ${spec}`);
    }
  }
  const features = join(src, "features");
  if (existsSync(features)) {
    for (const name of readdirSync(features)) {
      const dir = join(features, name);
      if (!statSync(dir).isDirectory()) continue;
      if (
        !existsSync(join(dir, "index.ts")) &&
        !existsSync(join(dir, "index.tsx"))
      )
        out.add(`${name} | missing-index`);
    }
  }
  return [...out].sort();
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
  io: { root: string; list?: string; error: (line: string) => void },
): number {
  const update = args.includes("--update");
  const found = findings(io.root);
  const listName = io.list ?? LIST;
  const listPath = isAbsolute(listName) ? listName : resolve(io.root, listName);

  if (!existsSync(listPath)) {
    if (!update) {
      io.error(
        `Feature-import list not found: ${listPath}. Create it with --update.`,
      );
      return 1;
    }
    mkdirSync(dirname(listPath), { recursive: true });
    writeFileSync(listPath, `${[...HEADER, ...found].join("\n")}\n`);
    io.error(`Seeded ${listPath} with ${found.length} findings.`);
    return 0;
  }

  const text = readFileSync(listPath, "utf8");
  const { entries, sorted } = readList(text);
  const now = new Set(found);
  const known = new Set(entries);
  const added = found.filter((f) => !known.has(f));
  const gone = entries.filter((f) => !now.has(f)).sort();

  if (update) {
    const drop = new Set(gone);
    const lines = text.split(/\r?\n/).filter((l) => !drop.has(l.trim()));
    writeFileSync(listPath, `${lines.join("\n").replace(/\n+$/, "")}\n`);
    for (const f of gone) io.error(`Removed: ${f}`);
    for (const f of added)
      io.error(`New finding (not added, fix the import instead): ${f}`);
    return added.length ? 1 : 0;
  }

  for (const f of added)
    io.error(`New feature-boundary finding, not in the list: ${f}`);
  for (const f of gone)
    io.error(`Listed finding no longer exists, remove it from the list: ${f}`);
  if (!sorted) io.error(`${listName} is not sorted (plain code-unit order).`);
  const bad = added.length + gone.length + (sorted ? 0 : 1);
  if (bad === 0)
    io.error(
      `Feature imports OK: ${found.length} known findings, no new ones.`,
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
