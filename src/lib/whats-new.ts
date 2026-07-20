import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";

export interface ChangelogEntry {
  title: string;
  body: string;
  hash: string;
}

export type WhatsNewStateStatus = "seen" | "dismissed";

export interface WhatsNewState {
  hash: string;
  status: WhatsNewStateStatus;
  updatedAt: string;
}

const changelogPath = path.join(process.cwd(), "CHANGELOG.md");
const WHATS_NEW_AUTO_DISMISS_MS = 21 * 24 * 60 * 60 * 1000;

function normalizeText(value: string) {
  return value
    .replace(/\r\n/g, "\n")
    .replace(/^[\s\uFEFF]+|[\s\uFEFF]+$/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function cleanChangelogBody(value: string) {
  const lines = normalizeText(value).split("\n");

  const cleanedLines = lines.flatMap((line) => {
    const trimmed = line.trim();

    if (!trimmed) {
      return [];
    }

    if (
      /^[-*]\s*(?:\[[^\]]+\]\([^)]+\)\s*){1,2}/i.test(trimmed) &&
      /github\.com\/(?:pull|commit)\//i.test(trimmed)
    ) {
      return [];
    }

    if (/^[-*]\s*(?:Thanks|thanks)\b/i.test(trimmed)) {
      return [];
    }

    if (/^###\s+/i.test(trimmed)) {
      return [];
    }

    if (/^\*\*\s+/i.test(trimmed)) {
      return [];
    }

    const metadataPrefixPattern =
      /^-\s*\[#\d+\]\(.*?\)\s*\[`[a-f0-9]{7,40}`\]\(.*?\)\s*Thanks\s*\[@[^\]]+\]\(.*?\)!\s*-\s*/i;

    if (metadataPrefixPattern.test(trimmed)) {
      return [trimmed.replace(metadataPrefixPattern, "")];
    }

    return [trimmed];
  });

  return normalizeText(cleanedLines.join("\n"));
}

export async function getLatestChangelogEntry(
  content?: string | null,
): Promise<ChangelogEntry | null> {
  let rawContent: string;

  try {
    rawContent = content ?? (await readFile(changelogPath, "utf8"));
  } catch {
    return null;
  }

  const normalizedContent = normalizeText(rawContent);

  if (!normalizedContent) {
    return null;
  }

  const match = normalizedContent.match(
    /##\s+(\d+\.\d+\.\d+[^\n]*)\n([\s\S]*?)(?=\n##\s+\d+\.\d+\.\d+|$)/,
  );

  if (!match) {
    return null;
  }

  const title = normalizeText(match[1]);
  const body = cleanChangelogBody(match[2]);

  if (!title || !body) {
    return null;
  }

  const hash = createHash("sha256").update(`${title}\n${body}`).digest("hex");

  return { title, body, hash };
}

export function parseWhatsNewState(value: string | null): WhatsNewState | null {
  if (!value) {
    return null;
  }

  try {
    const parsed = JSON.parse(value) as Partial<WhatsNewState>;

    if (!parsed?.hash || !parsed?.status || !parsed?.updatedAt) {
      return null;
    }

    if (parsed.status !== "seen" && parsed.status !== "dismissed") {
      return null;
    }

    return {
      hash: parsed.hash,
      status: parsed.status,
      updatedAt: parsed.updatedAt,
    };
  } catch {
    return null;
  }
}

export function serializeWhatsNewState(state: WhatsNewState) {
  return JSON.stringify(state);
}

function isWhatsNewSeenExpired(state: WhatsNewState) {
  const updatedAt = Date.parse(state.updatedAt);

  if (Number.isNaN(updatedAt)) {
    return true;
  }

  return Date.now() - updatedAt >= WHATS_NEW_AUTO_DISMISS_MS;
}

export function shouldShowWhatsNew(
  entry: ChangelogEntry | null,
  state: WhatsNewState | null,
) {
  if (!entry) {
    return false;
  }

  if (!state) {
    return true;
  }

  if (state.hash !== entry.hash) {
    return true;
  }

  if (state.status === "dismissed") {
    return false;
  }

  if (state.status === "seen") {
    return !isWhatsNewSeenExpired(state);
  }

  return false;
}
