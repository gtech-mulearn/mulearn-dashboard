/**
 * Fail on new inline query keys, against a shrink-only list of per-file counts.
 *
 *   bun scripts/check-query-keys.ts            check
 *   bun scripts/check-query-keys.ts --update   lower counts to the real ones, and drop files at zero
 *
 * Counts every `queryKey: [...]` whose array starts with a string literal (an inline key) in
 * src/**\/*.{ts,tsx}, using the TypeScript parser, so each array counts once (invalidations too)
 * and comments and strings never match. Keys built by a feature's factory (hooks/query-keys.ts)
 * don't count. Exits 1 when a file with inline keys isn't listed, when a count is higher than
 * listed, when a listed count is higher than the real one (so the list shrinks as keys are
 * replaced), or when the list is unsorted. --update never raises a count or adds a file; it
 * seeds the list only when the list doesn't exist yet.
 * Rules: docs/architecture/github-issues/README.md#rules-for-the-check-scripts.
 */
import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { dirname, isAbsolute, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";

export const LIST = "scripts/allowlists/query-keys.txt";

const HEADER = [
  "# Files with inline query keys (queryKey arrays starting with a string) on dev today, and how many.",
  "# This list only shrinks: use the feature's key factory (hooks/query-keys.ts) instead of adding keys.",
  "# A new inline key fails CI, and so does a count that went down without updating this list.",
  "# Format: <file> | <count>, sorted. After replacing keys, update it with: bun scripts/check-query-keys.ts --update",
];

function unwrap(node: ts.Expression): ts.Expression {
  let n = node;
  while (
    ts.isAsExpression(n) ||
    ts.isSatisfiesExpression(n) ||
    ts.isParenthesizedExpression(n)
  )
    n = n.expression;
  return n;
}

function isStringStart(node: ts.Expression | undefined): boolean {
  return (
    !!node &&
    (ts.isStringLiteral(node) ||
      ts.isNoSubstitutionTemplateLiteral(node) ||
      ts.isTemplateExpression(node))
  );
}

export function countInlineKeys(fileName: string, source: string): number {
  const file = ts.createSourceFile(
    fileName,
    source,
    ts.ScriptTarget.Latest,
    false,
    ts.ScriptKind.TSX,
  );
  let count = 0;
  const visit = (node: ts.Node) => {
    if (
      ts.isPropertyAssignment(node) &&
      node.name.getText(file) === "queryKey"
    ) {
      const value = unwrap(node.initializer);
      if (
        ts.isArrayLiteralExpression(value) &&
        isStringStart(value.elements[0])
      )
        count++;
    }
    ts.forEachChild(node, visit);
  };
  visit(file);
  return count;
}

function sourceFiles(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) {
      if (name !== "node_modules") sourceFiles(full, out);
    } else if (/\.tsx?$/.test(name)) out.push(full);
  }
  return out;
}

export function inlineKeyCounts(root: string): Map<string, number> {
  const counts = new Map<string, number>();
  for (const full of sourceFiles(join(root, "src")).sort()) {
    const rel = full.slice(root.length + 1).replace(/\\/g, "/");
    const n = countInlineKeys(rel, readFileSync(full, "utf8"));
    if (n > 0) counts.set(rel, n);
  }
  return counts;
}

function readList(text: string): {
  entries: Map<string, number>;
  order: string[];
  malformed: string[];
} {
  const entries = new Map<string, number>();
  const order: string[] = [];
  const malformed: string[] = [];
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    const m = /^(.+?) \| (\d+)$/.exec(line);
    if (!m) {
      malformed.push(line);
      continue;
    }
    entries.set(m[1], Number(m[2]));
    order.push(m[1]);
  }
  return { entries, order, malformed };
}

const format = (counts: Map<string, number>) =>
  [...counts]
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
    .map(([f, n]) => `${f} | ${n}`);

export function run(
  args: string[],
  io: { root: string; list?: string; error: (line: string) => void },
): number {
  const update = args.includes("--update");
  const counts = inlineKeyCounts(io.root);
  const listName = io.list ?? LIST;
  const listPath = isAbsolute(listName) ? listName : resolve(io.root, listName);

  if (!existsSync(listPath)) {
    if (!update) {
      io.error(
        `Query-key list not found: ${listPath}. Create it with --update.`,
      );
      return 1;
    }
    mkdirSync(dirname(listPath), { recursive: true });
    writeFileSync(listPath, `${[...HEADER, ...format(counts)].join("\n")}\n`);
    io.error(
      `Seeded ${listPath} with ${[...counts.values()].reduce((a, b) => a + b, 0)} inline keys in ${counts.size} files.`,
    );
    return 0;
  }

  const text = readFileSync(listPath, "utf8");
  const { entries, order, malformed } = readList(text);
  const problems: string[] = malformed.map(
    (l) => `Malformed line in ${listName}: ${l}`,
  );
  for (const [file, n] of counts) {
    const listed = entries.get(file);
    if (listed === undefined)
      problems.push(
        `New inline query keys: ${file} has ${n}, and isn't listed. Use the feature's key factory.`,
      );
    else if (n > listed)
      problems.push(
        `More inline query keys: ${file} has ${n}, the list allows ${listed}.`,
      );
  }
  for (const [file, listed] of entries) {
    const n = counts.get(file) ?? 0;
    if (n < listed)
      problems.push(
        `Fewer inline query keys: ${file} has ${n}, the list says ${listed}. Update the list.`,
      );
  }

  if (update) {
    const keep = new Map<string, number>();
    for (const [file, listed] of entries) {
      const n = Math.min(listed, counts.get(file) ?? 0);
      if (n > 0) keep.set(file, n);
    }
    const comments = text
      .split(/\r?\n/)
      .filter((l) => l.trim().startsWith("#"));
    writeFileSync(listPath, `${[...comments, ...format(keep)].join("\n")}\n`);
    const rising = problems.filter(
      (p) => p.startsWith("New") || p.startsWith("More"),
    );
    for (const p of rising) io.error(`${p} (not added)`);
    return rising.length ? 1 : 0;
  }

  const sorted = order.every((f, i) => i === 0 || order[i - 1] <= f);
  if (!sorted)
    problems.push(`${listName} is not sorted (plain code-unit order).`);
  for (const p of problems) io.error(p);
  if (!problems.length) {
    const total = [...counts.values()].reduce((a, b) => a + b, 0);
    io.error(
      `Query keys OK: ${total} inline keys in ${counts.size} files, none new.`,
    );
  }
  return problems.length ? 1 : 0;
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
