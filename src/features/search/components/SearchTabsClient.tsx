"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
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
    <div className="w-full sm:w-auto">
      <div className="grid grid-cols-3 sm:flex gap-2 w-full sm:w-auto pb-1">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href;
          return (
            <Button
              key={tab.href}
              asChild
              variant={isActive ? "default" : "secondary"}
              className={cn(
                "w-full sm:w-auto whitespace-nowrap text-xs sm:text-sm px-2 sm:px-4",
              )}
            >
              <Link href={tab.href}>{tab.label}</Link>
            </Button>
          );
        })}
      </div>
    </div>
  );
}
