import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import {
  entryFiles,
  groupOf,
  largestPerGroup,
  measure,
  overBudget,
  updatedBudgets,
} from "./check-bundle-budgets";

const dirs: string[] = [];

afterEach(() => {
  for (const dir of dirs.splice(0))
    rmSync(dir, { recursive: true, force: true });
});

function manifest(entries: Record<string, string[]>) {
  return `globalThis.__RSC_MANIFEST = globalThis.__RSC_MANIFEST || {};\nglobalThis.__RSC_MANIFEST["/(dashboard)/events/[id]/page"] = ${JSON.stringify(
    {
      clientModules: {},
      entryJSFiles: entries,
    },
  )};\n`;
}

/** A fake .next/ with a shared chunk, a dashboard layout chunk and two pages. */
function fakeBuild() {
  const next = mkdtempSync(join(tmpdir(), "bundle-budgets-"));
  dirs.push(next);
  mkdirSync(join(next, "static", "chunks"), { recursive: true });
  const chunks: Record<string, string> = {
    "shared.js": "s".repeat(2000),
    "layout.js": "l".repeat(500),
    "events.js": "e".repeat(300),
    "login.js": "x".repeat(100),
  };
  for (const [name, text] of Object.entries(chunks))
    writeFileSync(join(next, "static", "chunks", name), text);
  writeFileSync(
    join(next, "build-manifest.json"),
    JSON.stringify({
      rootMainFiles: ["static/chunks/shared.js"],
      polyfillFiles: ["static/chunks/login.js"],
    }),
  );
  const events = join(
    next,
    "server",
    "app",
    "(dashboard)",
    "dashboard",
    "events",
  );
  const login = join(next, "server", "app", "(auth)", "login");
  const home = join(next, "server", "app");
  for (const dir of [events, login, home]) mkdirSync(dir, { recursive: true });
  writeFileSync(
    join(events, "page_client-reference-manifest.js"),
    manifest({
      "[project]/src/app/layout": ["static/chunks/shared.js"],
      "[project]/src/app/(dashboard)/layout": ["static/chunks/layout.js"],
      "[project]/src/app/(dashboard)/dashboard/events/page": [
        "static/chunks/events.js",
        "static/chunks/layout.js",
      ],
    }),
  );
  writeFileSync(
    join(login, "page_client-reference-manifest.js"),
    manifest({
      "[project]/src/app/(auth)/login/page": ["static/chunks/login.js"],
    }),
  );
  writeFileSync(
    join(home, "page_client-reference-manifest.js"),
    manifest({ "[project]/src/app/page": [] }),
  );
  return next;
}

describe("groupOf", () => {
  it("names the top-level route group, or (root)", () => {
    expect(groupOf("/(dashboard)/dashboard/events")).toBe("(dashboard)");
    expect(groupOf("/(auth)/login")).toBe("(auth)");
    expect(groupOf("/")).toBe("(root)");
    expect(groupOf("/_not-found")).toBe("(root)");
  });
});

describe("entryFiles", () => {
  it("reads every segment's entry chunks", () => {
    expect(entryFiles(manifest({ a: ["1.js"], b: ["2.js", "3.js"] }))).toEqual([
      "1.js",
      "2.js",
      "3.js",
    ]);
  });

  it("refuses a manifest without entryJSFiles", () => {
    expect(() =>
      entryFiles(manifest({}).replace('"entryJSFiles":{}', '"other":{}')),
    ).toThrow("entryJSFiles");
    expect(() => entryFiles("x = {};")).toThrow("__RSC_MANIFEST");
  });
});

describe("measure", () => {
  it("counts each file once per route, gzipped, with the shared chunks and without polyfills", () => {
    const routes = measure(fakeBuild());

    expect(routes.map((item) => [item.group, item.route])).toEqual([
      ["(root)", "/"],
      ["(auth)", "/(auth)/login"],
      ["(dashboard)", "/(dashboard)/dashboard/events"],
    ]);
    const [home, login, events] = routes;
    // events loads shared + layout + events (layout listed twice, counted once); login loads shared + login.
    expect(events.bytes).toBeGreaterThan(login.bytes);
    expect(login.bytes).toBeGreaterThan(home.bytes);
  });

  it("gives the same sizes for the same build", () => {
    const build = fakeBuild();
    expect(measure(build)).toEqual(measure(build));
  });
});

describe("budgets", () => {
  const routes = [
    { group: "(dashboard)", route: "/(dashboard)/a", bytes: 1000 },
    { group: "(dashboard)", route: "/(dashboard)/b", bytes: 1500 },
    { group: "(auth)", route: "/(auth)/login", bytes: 400 },
  ];

  it("uses the largest route of each group", () => {
    expect(largestPerGroup(routes).get("(dashboard)")?.route).toBe(
      "/(dashboard)/b",
    );
  });

  it("reports a route over its group's budget with both sizes", () => {
    expect(overBudget(routes, { "(dashboard)": 1200, "(auth)": 500 })).toEqual([
      "/(dashboard)/b: 1.5 kB is over the (dashboard) budget of 1.2 kB",
    ]);
  });

  it("reports a group without a budget", () => {
    expect(overBudget(routes, { "(dashboard)": 2000 })).toEqual([
      "/(auth)/login: its group (auth) has no budget in scripts/allowlists/bundle-budgets.json",
    ]);
  });

  it("seeds budgets with 5% headroom and never raises one", () => {
    expect(updatedBudgets(routes, {})).toEqual({
      "(auth)": 420,
      "(dashboard)": 1575,
    });
    expect(
      updatedBudgets(routes, { "(auth)": 410, "(dashboard)": 9000 }),
    ).toEqual({
      "(auth)": 410,
      "(dashboard)": 1575,
    });
  });
});
