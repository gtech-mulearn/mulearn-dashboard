/**
 * Markdown Renderer Utility
 *
 * 📍 src/features/mujourney/utils/markdown.tsx
 *
 * Custom markdown renderer for mujourney content
 */

import ReactMarkdown from "react-markdown";
import rehypeSanitize from "rehype-sanitize";
import remarkGfm from "remark-gfm";

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

/**
 * Decode Unicode escape sequences like \u03bc to actual characters
 * Also handles HTML entities and other escape sequences
 */
export function decodeUnicodeEscapes(text: string): string {
  try {
    let decoded = text;

    // Replace \uXXXX with actual Unicode characters
    decoded = decoded.replace(/\\u([0-9a-fA-F]{4})/g, (_match, code) => {
      return String.fromCharCode(parseInt(code, 16));
    });

    // Replace common HTML entities
    const htmlEntities: Record<string, string> = {
      "&amp;": "&",
      "&lt;": "<",
      "&gt;": ">",
      "&quot;": '"',
      "&apos;": "'",
      "&nbsp;": " ",
      "&#39;": "'",
      "&#x27;": "'",
    };

    Object.entries(htmlEntities).forEach(([entity, char]) => {
      decoded = decoded.replace(new RegExp(entity, "g"), char);
    });

    // Decode numeric HTML entities (e.g., &#956; for μ)
    decoded = decoded.replace(/&#(\d+);/g, (_match, code) => {
      return String.fromCharCode(parseInt(code, 10));
    });

    // Decode hex HTML entities (e.g., &#x3BC; for μ)
    decoded = decoded.replace(/&#x([0-9a-fA-F]+);/g, (_match, code) => {
      return String.fromCharCode(parseInt(code, 16));
    });

    return decoded;
  } catch (error) {
    console.error("Error decoding Unicode escapes:", error);
    return text;
  }
}

/**
 * Renders markdown content with support for:
 * - Icons and emojis
 * - Bold, italic, links
 * - Lists (ordered and unordered)
 * - Code blocks and inline code
 * - Tables (via remark-gfm)
 * - Unicode characters (decoded from escape sequences)
 */
export function MarkdownRenderer({
  content,
  className = "",
}: MarkdownRendererProps) {
  // Decode Unicode escape sequences first
  const decodedContent = decodeUnicodeEscapes(content);

  return (
    <div className={className}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeSanitize]}
        components={{
          // Paragraphs
          p: ({ children }) => <p className="mb-3 last:mb-0">{children}</p>,
          // Headings
          h1: ({ children }) => (
            <h1 className="text-2xl font-bold mb-4 mt-6 first:mt-0">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-xl font-bold mb-3 mt-5 first:mt-0">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-lg font-bold mb-2 mt-4 first:mt-0">
              {children}
            </h3>
          ),
          h4: ({ children }) => (
            <h4 className="text-base font-bold mb-2 mt-3 first:mt-0">
              {children}
            </h4>
          ),
          // Lists
          ul: ({ children }) => (
            <ul className="list-disc list-inside mb-3 space-y-1">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal list-inside mb-3 space-y-1">
              {children}
            </ol>
          ),
          li: ({ children }) => <li className="ml-2">{children}</li>,
          // Links
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              {children}
            </a>
          ),
          // Code
          code: ({
            inline,
            children,
          }: {
            inline?: boolean;
            children?: React.ReactNode;
          }) =>
            inline ? (
              <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">
                {children}
              </code>
            ) : (
              <code className="block bg-muted p-3 rounded text-sm font-mono overflow-x-auto mb-3">
                {children}
              </code>
            ),
          // Strong (bold)
          strong: ({ children }) => (
            <strong className="font-bold">{children}</strong>
          ),
          // Emphasis (italic)
          em: ({ children }) => <em className="italic">{children}</em>,
          // Blockquotes
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-muted pl-4 italic my-3">
              {children}
            </blockquote>
          ),
          // Horizontal rule
          hr: () => <hr className="my-4 border-border" />,
        }}
      >
        {decodedContent}
      </ReactMarkdown>
    </div>
  );
}
