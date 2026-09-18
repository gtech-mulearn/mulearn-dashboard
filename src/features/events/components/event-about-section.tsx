"use client";

import { FileText } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import rehypeSanitize from "rehype-sanitize";
import remarkGfm from "remark-gfm";
import { Button } from "@/components/ui/button";
import { isHttpUrl } from "../lib/events.url";

interface EventAboutSectionProps {
  description: string | null;
}

export function EventAboutSection({ description }: EventAboutSectionProps) {
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
    if (!el) return;

    const checkOverflow = () => {
      // Only measure rendered overflow when collapsed, where line-clamp is applied
      if (!isExpanded) {
        setIsOverflowing(el.scrollHeight > el.clientHeight + 1);
      }
    };

    checkOverflow();
    const rafId = requestAnimationFrame(checkOverflow);

    let prevWidth = el.clientWidth;
    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined") {
      resizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
          const newWidth = entry.contentRect.width;
          if (Math.abs(newWidth - prevWidth) > 1) {
            prevWidth = newWidth;
            checkOverflow();
          }
        }
      });
      resizeObserver.observe(el);
    }

    window.addEventListener("resize", checkOverflow);

    return () => {
      cancelAnimationFrame(rafId);
      resizeObserver?.disconnect();
      window.removeEventListener("resize", checkOverflow);
    };
  }, [description, isExpanded]);

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
        <div
          ref={contentRef}
          className={`markdown-body whitespace-pre-wrap break-words text-sm leading-7 text-muted-foreground [&_a]:text-primary [&_a]:underline [&_a]:underline-offset-2 hover:[&_a]:text-primary/80 ${!isExpanded ? "line-clamp-6" : ""}`}
        >
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeSanitize]}
            disallowedElements={["img"]}
            unwrapDisallowed={true}
            components={{
              a: ({ children, href, ...props }) => {
                const isSafe = isHttpUrl(href);
                if (!isSafe) {
                  return <span>{children}</span>;
                }
                return (
                  <a
                    {...props}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {children}
                  </a>
                );
              },
              img: ({ alt }) =>
                alt ? (
                  <span className="text-muted-foreground italic">[{alt}]</span>
                ) : null,
            }}
          >
            {description}
          </ReactMarkdown>
        </div>

        {isOverflowing && !isExpanded && (
          <div className="pointer-events-none absolute inset-x-0 bottom-5 h-16 bg-gradient-to-t from-card to-transparent" />
        )}

        {isOverflowing && (
          <Button
            variant="link"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="relative z-10 mt-2 px-0 text-xs font-semibold"
          >
            {isExpanded ? "Read less" : "Read more"}
          </Button>
        )}
      </div>
    </div>
  );
}
