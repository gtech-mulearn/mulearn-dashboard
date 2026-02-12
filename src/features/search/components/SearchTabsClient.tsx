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
    <div className="flex gap-2">
      {tabs.map((tab) => {
        const isActive = pathname === tab.href;
        return (
          <Button
            key={tab.href}
            asChild
            variant={isActive ? "default" : "secondary"}
            className={cn("whitespace-nowrap")}
          >
            <Link href={tab.href}>{tab.label}</Link>
          </Button>
        );
      })}
    </div>
  );
}
