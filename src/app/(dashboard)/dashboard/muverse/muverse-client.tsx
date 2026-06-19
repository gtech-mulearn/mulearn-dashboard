"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

const SCANLINE_SVG = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100%25' height='100%25'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.03'/%3E%3C/svg%3E")`;

export function MuversePageClient() {
  return (
    <div
      className="relative min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center overflow-hidden bg-background text-foreground px-6 py-12"
      style={{ backgroundImage: SCANLINE_SVG }}
    >
      <div className="relative z-10 max-w-md w-full text-center space-y-8">
        {/* Title */}
        <h1
          className="font-display font-black leading-none tracking-tight animate-fade-in"
          style={{
            fontSize: "clamp(3rem, 10vw, 5.5rem)",
            letterSpacing: "-0.04em",
          }}
        >
          <span className="text-foreground">Mu</span>
          <span
            style={{
              color: "var(--brand-purple)",
              textDecoration: "underline",
              textDecorationColor: "var(--brand-blue)",
              textUnderlineOffset: "4px",
              textDecorationThickness: "2px",
            }}
          >
            Verse
          </span>
        </h1>

        {/* Message */}
        <p
          className="font-sans text-muted-foreground leading-relaxed animate-fade-in-delayed"
          style={{
            fontSize: "clamp(1rem, 2vw, 1.125rem)",
          }}
        >
          A whole new dimension of the μLearn experience is being crafted.
          MuVerse is coming soon.
        </p>

        {/* Back to Home Button */}
        <div className="pt-4 animate-fade-in-delayed-more">
          <Button
            asChild
            variant="default"
            size="lg"
            className="px-8 py-6 rounded-full font-semibold transition-transform hover:scale-105 duration-200"
          >
            <Link href="/dashboard">Back to Home</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
