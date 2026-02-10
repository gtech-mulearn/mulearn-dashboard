"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface SearchTab {
  label: string;
  href: string;
}

interface SearchTabsClientProps {
  tabs: SearchTab[];
}

export function SearchTabsClient({ tabs }: SearchTabsClientProps) {
  const pathname = usePathname();

  return (
    <div className="flex gap-2">
      {tabs.map((tab) => {
        const isActive = pathname === tab.href;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              "px-6 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap",
              isActive
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80",
            )}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
