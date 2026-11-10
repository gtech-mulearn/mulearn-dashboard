import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

// apiClient/publicApiClient take (url, body, schema) for post/put/patch and
// (url, body?, schema?) for delete. Passing a response schema second sends it
// as the request body and skips response validation.
const SRC = path.resolve(__dirname, "..");
const CALL =
  /(?:publicApiClient|apiClient)\.(delete|post|put|patch)\s*(?:<[^>]*>)?\s*\(/g;

function topLevelArgs(text: string, start: number): string[] {
  const out: string[] = [];
  let depth = 0;
  let current = "";
  for (let i = start; i < text.length; i++) {
    const c = text[i];
    if ("([{".includes(c)) depth++;
    else if (")]}".includes(c)) {
      if (depth === 0) {
        out.push(current);
        break;
      }
      depth--;
    } else if (c === "," && depth === 0) {
      out.push(current);
      current = "";
      continue;
    }
    current += c;
  }
  return out.map((a) => a.trim()).filter(Boolean);
}

function sourceFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return sourceFiles(full);
    return /\.tsx?$/.test(entry.name) && !/\.test\.tsx?$/.test(entry.name)
      ? [full]
      : [];
  });
}

describe("API gateway argument order", () => {
  it("never passes a response schema in the request-body slot", () => {
    const offenders: string[] = [];
    for (const file of sourceFiles(SRC)) {
      const text = readFileSync(file, "utf8");
      for (const match of text.matchAll(CALL)) {
        const args = topLevelArgs(text, (match.index ?? 0) + match[0].length);
        if (/^[A-Z][A-Za-z0-9]*Schema$/.test(args[1] ?? "")) {
          const line = text.slice(0, match.index).split("\n").length;
          offenders.push(`${path.relative(SRC, file)}:${line}`);
        }
      }
    }
    expect(offenders).toEqual([]);
  });
});
