"use client";

import { FileText } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";

interface EventAboutSectionProps {
  description: string | null;
}

export function EventAboutSection({ description }: EventAboutSectionProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!description) return null;

  return (
    <div className="rounded-2xl border border-border bg-card shadow-sm">
      <div className="flex items-center gap-2.5 px-5 py-4">
        <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10">
          <FileText className="size-4 text-primary" />
        </div>
        <h2 className="text-base font-bold text-foreground">
          About This Event
        </h2>
      </div>
      <div className="relative px-5 pb-5 pt-0">
        <p
          className={`whitespace-pre-wrap text-sm leading-7 text-muted-foreground ${!isExpanded ? "line-clamp-7" : ""}`}
        >
          {description}
        </p>

        {!isExpanded && (
          <div className="pointer-events-none absolute inset-x-0 bottom-5 h-16 bg-gradient-to-t from-card to-transparent" />
        )}

        <Button
          variant="link"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="relative z-10 mt-2 px-0 text-xs font-semibold"
        >
          {isExpanded ? "Read less" : "Read more"}
        </Button>
      </div>
    </div>
  );
}
