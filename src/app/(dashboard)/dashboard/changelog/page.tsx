import fs from "node:fs";
import path from "node:path";
import type { Metadata } from "next";
import ReactMarkdown from "react-markdown";
import rehypeSanitize from "rehype-sanitize";
import remarkGfm from "remark-gfm";

export const metadata: Metadata = {
  title: "Changelog",
  description: "View the latest updates and changes.",
};

export const dynamic = "force-static";

export default function ChangelogPage() {
  let md = "No changelog available yet.";
  const changelogPath = path.join(process.cwd(), "CHANGELOG.md");
  if (fs.existsSync(changelogPath)) {
    md = fs.readFileSync(changelogPath, "utf8");
  }

  return (
    <article className="prose dark:prose-invert mx-auto py-10 px-4 max-w-3xl">
      <h1>What&apos;s New</h1>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeSanitize]}
      >
        {md}
      </ReactMarkdown>
    </article>
  );
}
