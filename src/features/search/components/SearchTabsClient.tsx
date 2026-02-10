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
    <div className="border-b border-border">
      <nav className="-mb-px flex space-x-8">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "border-b-2 px-1 pb-4 text-sm font-medium transition-colors",
                isActive
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:border-border hover:text-foreground",
              )}
            >
              {tab.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
