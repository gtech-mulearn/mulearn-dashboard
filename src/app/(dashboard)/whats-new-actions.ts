"use server";

import { cookies } from "next/headers";
import {
  parseWhatsNewState,
  serializeWhatsNewState,
  type WhatsNewState,
} from "@/lib/whats-new";

const DISMISSAL_COOKIE_NAME = "mulearn-whats-new";

export async function getWhatsNewState(): Promise<WhatsNewState | null> {
  const cookieStore = await cookies();
  return parseWhatsNewState(
    cookieStore.get(DISMISSAL_COOKIE_NAME)?.value ?? null,
  );
}

export async function markWhatsNewSeen(hash: string) {
  const cookieStore = await cookies();

  cookieStore.set(
    DISMISSAL_COOKIE_NAME,
    serializeWhatsNewState({
      hash,
      status: "seen",
      updatedAt: new Date().toISOString(),
    }),
    {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
    },
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
    {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
    },
  );
}
