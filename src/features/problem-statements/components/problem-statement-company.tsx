"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import type { EmbeddedCompany } from "../types/problem-statement.types";

/**
 * Brand identity for µLearn-authored statements — same name and logo the
 * events feature uses for µLearn-organised events. Uses the micro sign
 * (U+00B5): it ships in the fonts' latin subset, the Greek mu does not.
 */
const MULEARN_PROVIDER = {
  name: "µLearn",
  logo: "/images/mulearn-logo-small.jpg",
} as const;

/**
 * Display name + logo for a statement's provider.
 * Admin-authored statements arrive as `{ id: null, name: "muLearn", logo: null }`.
 */
export function getProblemStatementProvider(
  company: EmbeddedCompany | null | undefined,
): { name: string; logo: string | null } {
  if (!company?.id || company.name.trim().toLowerCase() === "mulearn") {
    return MULEARN_PROVIDER;
  }
  return { name: company.name, logo: company.logo ?? null };
}

/** Provider logo (or initial) + name, used wherever a statement names its provider. */
export function ProblemStatementCompany({
  company,
  size = "sm",
  className,
  nameClassName,
}: {
  company: EmbeddedCompany | null | undefined;
  size?: "sm" | "default" | "lg";
  className?: string;
  nameClassName?: string;
}) {
  const provider = getProblemStatementProvider(company);
  return (
    <span className={cn("flex min-w-0 items-center gap-2", className)}>
      <Avatar size={size}>
        {provider.logo ? (
          <AvatarImage src={provider.logo} alt="" className="object-cover" />
        ) : null}
        <AvatarFallback className="font-semibold">
          {provider.name[0]?.toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <span
        className={cn("truncate text-xs text-muted-foreground", nameClassName)}
      >
        {provider.name}
      </span>
    </span>
  );
}
