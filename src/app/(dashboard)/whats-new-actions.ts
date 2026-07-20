"use server";

import { cookies } from "next/headers";
import {
  parseWhatsNewState,
  serializeWhatsNewState,
  type WhatsNewState,
} from "@/lib/whats-new";

const DISMISSAL_COOKIE_NAME = "mulearn-whats-new";

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: true,
  sameSite: "lax" as const,
  path: "/",
  maxAge: 60 * 60 * 24 * 365,
};

export async function getWhatsNewState(): Promise<WhatsNewState | null> {
  const cookieStore = await cookies();
  return parseWhatsNewState(
    cookieStore.get(DISMISSAL_COOKIE_NAME)?.value ?? null,
  );
}

export async function markWhatsNewSeen(hash: string) {
  const cookieStore = await cookies();

  const existing = parseWhatsNewState(
    cookieStore.get(DISMISSAL_COOKIE_NAME)?.value ?? null,
  );

  if (existing && existing.status === "seen" && existing.hash === hash) {
    return;
  }

  cookieStore.set(
    DISMISSAL_COOKIE_NAME,
    serializeWhatsNewState({
      hash,
      status: "seen",
      updatedAt: new Date().toISOString(),
    }),
    COOKIE_OPTIONS,
  );
}

export async function dismissWhatsNew(hash: string) {
  const cookieStore = await cookies();

  cookieStore.set(
    DISMISSAL_COOKIE_NAME,
    serializeWhatsNewState({
      hash,
      status: "dismissed",
      updatedAt: new Date().toISOString(),
    }),
    COOKIE_OPTIONS,
  );
}

export async function clearWhatsNewCookie() {
  const cookieStore = await cookies();
  cookieStore.delete({
    name: DISMISSAL_COOKIE_NAME,
    httpOnly: true,
    secure: COOKIE_OPTIONS.secure,
    sameSite: COOKIE_OPTIONS.sameSite,
    path: COOKIE_OPTIONS.path,
  });
}
