/**
 * Onboarding Layout
 *
 * 📍 src/app/(onboarding)/layout.tsx
 *
 * Shared layout for onboarding pages - mobile-first clean design.
 */

import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

interface OnboardingLayoutProps {
  children: ReactNode;
}

export default function OnboardingLayout({ children }: OnboardingLayoutProps) {
  return (
    <div className="min-h-screen w-full flex flex-col bg-linear-to-b from-background via-background to-muted">
      {/* Header */}
      <header className="flex items-center justify-center py-6 px-4 relative">
        <Link href="/">
          <Image
            src="/logo.webp"
            alt="μLearn"
            width={100}
            height={32}
            priority
          />
        </Link>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center px-6 py-4">
        <div className="w-full max-w-lg">{children}</div>
      </main>
    </div>
  );
}
