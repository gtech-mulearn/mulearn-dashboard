"use client";

import {
  Bold,
  Code,
  Eye,
  Heading2,
  Italic,
  Link,
  List,
  ListOrdered,
  Pencil,
  Quote,
  Strikethrough,
} from "lucide-react";
import { useCallback, useRef, useState, type KeyboardEvent } from "react";
import { cn } from "@/lib/utils";
import { Button } from "./button";
import { MarkdownRenderer } from "./markdown-renderer";
import { Textarea } from "./textarea";

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  className?: string;
  error?: string;
}

type ToolbarAction = {
  icon: React.ElementType;
  label: string;
  prefix: string;
  suffix: string;
  block?: boolean;
};

const TOOLBAR_ACTIONS: ToolbarAction[] = [
  { icon: Bold, label: "Bold", prefix: "**", suffix: "**" },
  { icon: Italic, label: "Italic", prefix: "_", suffix: "_" },
  { icon: Strikethrough, label: "Strikethrough", prefix: "~~", suffix: "~~" },
  { icon: Code, label: "Inline code", prefix: "`", suffix: "`" },
  { icon: Heading2, label: "Heading", prefix: "## ", suffix: "", block: true },
  { icon: Quote, label: "Quote", prefix: "> ", suffix: "", block: true },
  { icon: List, label: "Bullet list", prefix: "- ", suffix: "", block: true },
  {
    icon: ListOrdered,
    label: "Numbered list",
    prefix: "1. ",
    suffix: "",
    block: true,
  },
  { icon: Link, label: "Link", prefix: "[", suffix: "](url)" },
];

/**
 * Markdown editor with a toolbar, write tab, and live preview tab.
 */
export function MarkdownEditor({
  value,
  onChange,
  placeholder = "Write your description using Markdown…",
  rows = 8,
  className,
  error,
}: MarkdownEditorProps) {
  const [tab, setTab] = useState<"write" | "preview">("write");
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const applyAction = useCallback(
    (action: ToolbarAction) => {
      const textarea = textareaRef.current;
      if (!textarea) return;

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selected = value.slice(start, end);
      const before = value.slice(0, start);
      const after = value.slice(end);

      if (action.block) {
        // For block actions, add prefix at the start of each selected line
        const lineStart = before.lastIndexOf("\n") + 1;
        const beforeLine = value.slice(0, lineStart);
        const lineContent = value.slice(lineStart, end) || "text";

        // Split into individual lines and prefix each one
        const lines = lineContent.split("\n");
        const isNumberedList = action.prefix === "1. ";
        const prefixedLines = lines.map((line, idx) => {
          const prefix = isNumberedList ? `${idx + 1}. ` : action.prefix;
          return `${prefix}${line}${action.suffix}`;
        });
        const newLineContent = prefixedLines.join("\n");
        const newValue = `${beforeLine}${newLineContent}${after}`;
        onChange(newValue);
        // Restore cursor to end of modified content
        requestAnimationFrame(() => {
          textarea.focus();
          const cursorPos = lineStart + newLineContent.length;
          textarea.setSelectionRange(cursorPos, cursorPos);
        });
      } else {
        const insertion = selected || "text";
        const newValue = `${before}${action.prefix}${insertion}${action.suffix}${after}`;
        onChange(newValue);
        requestAnimationFrame(() => {
          textarea.focus();
          if (selected) {
            textarea.setSelectionRange(
              start + action.prefix.length,
              start + action.prefix.length + insertion.length,
            );
          } else {
            // Select the placeholder "text" so user can type over it
            textarea.setSelectionRange(
              start + action.prefix.length,
              start + action.prefix.length + insertion.length,
            );
          }
        });
      }
    },
    [value, onChange],
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLTextAreaElement>) => {
      const textarea = textareaRef.current;
      if (!textarea) return;

      if (e.key !== "Enter" || e.shiftKey) return;

      const pos = textarea.selectionStart;
      const text = value;

      // Find start of the current line
      const lineStart = text.lastIndexOf("\n", pos - 1) + 1;
      const currentLine = text.slice(lineStart, pos);

      // Match list prefixes: `- `, `* `, `> `, or `N. `
      const bulletMatch = currentLine.match(/^([-*>]\s)/);
      const numberedMatch = currentLine.match(/^(\d+)\.\s/);

      if (!bulletMatch && !numberedMatch) return;

      e.preventDefault();

      if (bulletMatch) {
        const prefix = bulletMatch[1];
        const lineContent = currentLine.slice(prefix.length);

        if (lineContent.trim() === "") {
          // Empty list line → remove prefix and exit list
          const newValue =
            text.slice(0, lineStart) + text.slice(lineStart + prefix.length);
          onChange(newValue);
          requestAnimationFrame(() => {
            textarea.setSelectionRange(lineStart, lineStart);
          });
        } else {
          // Continue with same prefix on next line
          const insertion = "\n" + prefix;
          const newValue = text.slice(0, pos) + insertion + text.slice(pos);
          onChange(newValue);
          const newPos = pos + insertion.length;
          requestAnimationFrame(() => {
            textarea.setSelectionRange(newPos, newPos);
          });
        }
      } else if (numberedMatch) {
        const num = parseInt(numberedMatch[1], 10);
        const prefixLen = numberedMatch[0].length;
        const lineContent = currentLine.slice(prefixLen);

        if (lineContent.trim() === "") {
          // Empty numbered line → remove prefix and exit list
          const newValue =
            text.slice(0, lineStart) + text.slice(lineStart + prefixLen);
          onChange(newValue);
          requestAnimationFrame(() => {
            textarea.setSelectionRange(lineStart, lineStart);
          });
        } else {
          // Continue with next sequential number
          const nextPrefix = `${num + 1}. `;
          const insertion = "\n" + nextPrefix;
          const newValue = text.slice(0, pos) + insertion + text.slice(pos);
          onChange(newValue);
          const newPos = pos + insertion.length;
          requestAnimationFrame(() => {
            textarea.setSelectionRange(newPos, newPos);
          });
        }
      }
    },
    [value, onChange],
  );

  return (
    <div className={cn("rounded-lg border bg-background", className)}>
      {/* Tab bar + toolbar */}
      <div className="flex items-center gap-1 border-b px-2 py-1.5">
        <button
          type="button"
          onClick={() => setTab("write")}
          className={cn(
            "inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
            tab === "write"
              ? "bg-muted text-foreground"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          <Pencil className="h-3 w-3" />
          Write
        </button>
        <button
          type="button"
          onClick={() => setTab("preview")}
          className={cn(
            "inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
            tab === "preview"
              ? "bg-muted text-foreground"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          <Eye className="h-3 w-3" />
          Preview
        </button>

        {tab === "write" && (
          <>
            <div className="mx-1 h-4 w-px bg-border" />
            <div className="flex items-center gap-0.5">
              {TOOLBAR_ACTIONS.map((action) => (
                <Button
                  key={action.label}
                  type="button"
                  variant="secondary"
                  size="icon"
                  className="h-7 w-7"
                  title={action.label}
                  onClick={() => applyAction(action)}
                >
                  <action.icon className="h-3.5 w-3.5" />
                </Button>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Content area */}
      {tab === "write" ? (
        <Textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          rows={rows}
          className="border-0 rounded-none rounded-b-lg focus-visible:ring-0 focus-visible:ring-offset-0 resize-y"
        />
      ) : (
        <div className="min-h-[12rem] p-3">
          {value.trim() ? (
            <MarkdownRenderer content={value} className="text-sm" />
          ) : (
            <p className="text-sm text-muted-foreground italic">
              Nothing to preview
            </p>
          )}
        </div>
      )}

      {error && <p className="px-3 pb-2 text-xs text-destructive">{error}</p>}
    </div>
  );
}
