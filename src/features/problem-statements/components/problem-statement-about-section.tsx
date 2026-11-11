"use client";

/**
 * Problem Statement About Section
 *
 * 📍 src/features/problem-statements/components/problem-statement-about-section.tsx
 *
 * Description (markdown, collapsible after ~6 lines) and skills in one Card,
 * shared by the learner detail page and the manage detail page.
 */

import { useEffect, useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MarkdownRenderer } from "@/components/ui/markdown-renderer";
import { cn } from "@/lib/utils";

interface ProblemStatementAboutSectionProps {
  description: string | null | undefined;
  skills?: string[];
  className?: string;
}

export function ProblemStatementAboutSection({
  description,
  skills = [],
  className,
}: ProblemStatementAboutSectionProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  const [prevDescription, setPrevDescription] = useState(description);
  if (description !== prevDescription) {
    setPrevDescription(description);
    setIsExpanded(false);
  }

  // biome-ignore lint/correctness/useExhaustiveDependencies: re-measure overflow when description changes or expansion toggles
  useEffect(() => {
    const el = contentRef.current;
    if (!el || isExpanded) return;

    const checkOverflow = () => {
      setIsOverflowing(el.scrollHeight > el.clientHeight + 1);
    };
    checkOverflow();

    const observer =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(checkOverflow)
        : null;
    observer?.observe(el);
    return () => observer?.disconnect();
  }, [description, isExpanded]);

  if (!description && skills.length === 0) return null;

  return (
    <Card className={cn("rounded-2xl", className)}>
      <CardHeader>
        <CardTitle className="text-base">About this problem</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {description && (
          <div>
            <div className="relative">
              <div
                ref={contentRef}
                className={cn(
                  "text-sm text-foreground/90",
                  !isExpanded && "max-h-60 overflow-hidden",
                )}
              >
                <MarkdownRenderer content={description} />
              </div>
              {isOverflowing && !isExpanded && (
                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-linear-to-t from-card to-transparent" />
              )}
            </div>
            {(isOverflowing || isExpanded) && (
              <Button
                variant="link"
                size="sm"
                onClick={() => setIsExpanded((v) => !v)}
                className="mt-1 px-0"
                aria-expanded={isExpanded}
              >
                {isExpanded ? "Show less" : "Show more"}
              </Button>
            )}
          </div>
        )}

        {skills.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-foreground">
              Skills you'll use
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {skills.map((skill) => (
                <Badge key={skill} variant="secondary">
                  {skill}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
