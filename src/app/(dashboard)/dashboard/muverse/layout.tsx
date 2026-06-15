import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "MuVerse | μLearn",
  description:
    "A whole new dimension of the μLearn experience is being crafted. MuVerse is coming soon.",
};

export default function MuverseLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
