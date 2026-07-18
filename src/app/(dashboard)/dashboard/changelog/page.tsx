import fs from "node:fs";
import path from "node:path";
import type { Metadata } from "next";
import ReactMarkdown, { type Components } from "react-markdown";
import rehypeSanitize from "rehype-sanitize";
import remarkGfm from "remark-gfm";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Changelog",
  description: "View the latest updates and changes.",
};

export const dynamic = "force-static";

const components: Components = {
  h1: () => null,
  h2: ({ node, ...props }) => {
    const text = String(props.children ?? "");
    const isVersion = /^\d+\.\d+/.test(text.trim());

    if (!isVersion) {
      return (
        <h2 className="text-lg font-semibold text-foreground mt-10 mb-4">
          {props.children}
        </h2>
      );
    }

    return (
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-border pb-4 mt-16 mb-8 gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <h2 className="text-xl sm:text-2xl font-bold text-foreground m-0">
            v{props.children}
          </h2>
          <div className="hidden sm:flex items-center gap-3 text-sm text-muted-foreground">
            <span className="text-muted-foreground/30">•</span>
            <a
              href="https://github.com/gtech-mulearn/mulearn-dashboard/releases"
              target="_blank"
              rel="noreferrer"
              className="hover:text-foreground transition-colors"
            >
              GitHub Release
            </a>
            <span className="text-muted-foreground/30">•</span>
            <a
              href="https://github.com/gtech-mulearn/mulearn-dashboard/commits/main"
              target="_blank"
              rel="noreferrer"
              className="hover:text-foreground transition-colors"
            >
              Compare changes
            </a>
          </div>
        </div>
        <div className="text-sm text-muted-foreground font-medium"></div>
      </div>
    );
  },
  h3: ({ node, ...props }) => (
    <h3 className="text-sm font-semibold tracking-wide uppercase text-muted-foreground mt-8 mb-4">
      {props.children}
    </h3>
  ),
  ul: ({ node, ...props }) => (
    <ul className="flex flex-col gap-3 list-none pl-0 m-0">{props.children}</ul>
  ),
  li: ({ node, ...props }) => (
    <li className="flex items-start gap-4 text-foreground text-sm leading-relaxed m-0 group">
      <div className="mt-2 w-1.5 h-1.5 rounded-full bg-border group-hover:bg-primary transition-colors shrink-0" />
      <div className="flex-1 space-y-1">{props.children}</div>
    </li>
  ),
  p: ({ node, ...props }) => <p className="m-0 inline">{props.children}</p>,
  a: ({ node, ...props }) => (
    <a
      className="text-primary hover:text-ring underline decoration-border hover:decoration-ring underline-offset-4 transition-colors"
      {...props}
    >
      {props.children}
    </a>
  ),
  strong: ({ node, ...props }) => (
    <strong className="font-semibold text-foreground" {...props}>
      {props.children}
    </strong>
  ),
  code: ({ node, ...props }) => (
    <code
      className="bg-muted text-muted-foreground px-1.5 py-0.5 rounded-md text-xs font-mono border border-border/50"
      {...props}
    >
      {props.children}
    </code>
  ),
  hr: () => null,
};

export default function ChangelogPage() {
  let md = "No changelog available yet.";
  const changelogPath = path.join(process.cwd(), "CHANGELOG.md");
  if (fs.existsSync(changelogPath)) {
    md = fs.readFileSync(changelogPath, "utf8");
  }

  return (
    <div id="top" className="mx-auto w-full max-w-4xl py-6 sm:py-20">
      {/* Hero Section */}
      <div className="flex flex-col items-start gap-6 mb-16">
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-foreground font-display">
          Changelog
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl leading-relaxed">
          Stay up to date with the latest changes to μLearn Dashboard! Since the
          first release, we&apos;ve been working hard to make the platform the
          best it can be. Thanks everyone for your feedback! ❤️
        </p>
        <div className="flex flex-wrap items-center gap-3 mt-2">
          <Button
            asChild
            className="inline-flex items-center justify-center font-semibold"
          >
            <a
              href="https://mulearn.org/donate"
              target="_blank"
              rel="noreferrer"
            >
              Give us some support!
            </a>
          </Button>
        </div>
      </div>

      {/* Markdown Content */}
      <article className="prose-none">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeSanitize]}
          components={components}
        >
          {md}
        </ReactMarkdown>
      </article>

      {/* Back to top button */}
      <div className="flex justify-end mt-20">
        <Button
          asChild
          className="inline-flex items-center justify-center font-semibold"
        >
          <a href="#top">Back to the top &uarr;</a>
        </Button>
      </div>
    </div>
  );
}
