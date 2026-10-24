"use client";

import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";

const components: Components = {
  p: ({ children }) => <p className="my-1.5 first:mt-0 last:mb-0">{children}</p>,
  strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
  em: ({ children }) => <em className="italic">{children}</em>,
  ul: ({ children }) => <ul className="my-1.5 ps-5 list-disc space-y-1 marker:text-on-surface-variant">{children}</ul>,
  ol: ({ children }) => <ol className="my-1.5 ps-5 list-decimal space-y-1 marker:text-on-surface-variant">{children}</ol>,
  li: ({ children }) => <li className="ps-0.5">{children}</li>,
  h1: ({ children }) => <p className="mt-3 mb-1 first:mt-0 font-semibold">{children}</p>,
  h2: ({ children }) => <p className="mt-3 mb-1 first:mt-0 font-semibold">{children}</p>,
  h3: ({ children }) => <p className="mt-3 mb-1 first:mt-0 font-semibold">{children}</p>,
  h4: ({ children }) => <p className="mt-2 mb-1 first:mt-0 font-semibold">{children}</p>,
  blockquote: ({ children }) => <blockquote className="my-2 border-s-2 border-outline-variant ps-3 text-on-surface-variant">{children}</blockquote>,
  hr: () => <hr className="my-3 border-outline-variant" />,
  a: ({ children, href }) =>
    href ? (
      <a href={href} target="_blank" rel="noopener noreferrer nofollow" className="text-primary underline underline-offset-2 break-all">
        {children}
      </a>
    ) : (
      <span>{children}</span>
    ),
  code: ({ children, className }) =>
    className?.startsWith("language-") ? (
      <code className="font-mono-data">{children}</code>
    ) : (
      <code dir="ltr" className="font-mono-data text-[0.9em] rounded bg-surface-container-highest px-1 py-0.5 [unicode-bidi:isolate]">
        {children}
      </code>
    ),
  pre: ({ children }) => (
    <pre dir="ltr" className="my-2 overflow-x-auto rounded-lg bg-surface-container-highest p-3 text-end text-xs leading-relaxed">
      {children}
    </pre>
  ),
  table: ({ children }) => (
    <div className="my-2 overflow-x-auto">
      <table className="min-w-full border-collapse text-xs">{children}</table>
    </div>
  ),
  th: ({ children }) => <th className="border border-outline-variant px-2 py-1 text-start font-semibold">{children}</th>,
  td: ({ children }) => <td className="border border-outline-variant px-2 py-1 align-top">{children}</td>,
  img: () => null,
};

const LTR_RUN = /(?<![\w/=.-])(?:#\d+(?:\s+-\s+[A-Za-z]+(?:-[A-Za-z0-9]+)+)?|[A-Z]{2,}-\d{4}-\d{3,}\b|\d{4}-\d{2}-\d{2}\b)/g;

function isolateLtrRuns(markdown: string) {
  return markdown.replace(LTR_RUN, (run) => `⁦${run.replace(/-/g, "-⁠").replace(/ /g, " ")}⁩`);
}

export function ChatMarkdown({ content }: { content: string }) {
  return (
    <div className="break-words [overflow-wrap:anywhere]">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components} skipHtml>
        {isolateLtrRuns(content)}
      </ReactMarkdown>
    </div>
  );
}

export function markdownToPlainText(markdown: string): string {
  return markdown
    .replace(/```[^\n]*\n?/g, "")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/(^|\W)__(\S(?:.*?\S)?)__(?=\W|$)/g, "$1$2")
    .replace(/(^|[^*\w])\*(?!\s)([^*\n]+?)\*(?!\w)/g, "$1$2")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/^(\s*)[*+]\s+/gm, "$1- ")
    .replace(/!?\[([^\]]*)\]\(([^)\s]+)\)/g, "$1 ($2)")
    .trim();
}

const ARABIC_LETTER = /[؀-ۿݐ-ݿ]/;
const LATIN_LETTER = /[A-Za-z]/;

export function messageDirection(text: string): "rtl" | "ltr" {
  const firstLine = text.split("\n").find((line) => line.trim()) ?? "";
  const words = firstLine.split(/\s+/);
  const arabic = words.filter((w) => ARABIC_LETTER.test(w)).length;
  const latin = words.filter((w) => LATIN_LETTER.test(w) && !ARABIC_LETTER.test(w)).length;
  return arabic >= latin ? "rtl" : "ltr";
}
