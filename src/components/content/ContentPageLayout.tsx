import type { ReactNode } from "react";

type ContentPageLayoutProps = {
  title: string;
  content: string;
  banner?: ReactNode;
  children?: ReactNode;
};

/**
 * A block prefixed with "## " renders as a section heading; a block whose
 * every line starts with "* " renders as a bullet list; everything else is
 * a paragraph.
 */
export default function ContentPageLayout({ title, content, banner, children }: ContentPageLayoutProps) {
  const blocks = content.split("\n\n");

  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
      {banner}
      <div className="mt-8 space-y-4 text-sm text-black/80">
        {blocks.map((block, blockIndex) => {
          const lines = block.split("\n");

          if (block.startsWith("## ")) {
            return (
              <h2 key={blockIndex} className="pt-2 text-base font-semibold text-black">
                {block.slice(3)}
              </h2>
            );
          }

          if (lines.every((line) => line.startsWith("* "))) {
            return (
              <ul key={blockIndex} className="list-disc space-y-1 pl-5">
                {lines.map((line, lineIndex) => (
                  <li key={lineIndex}>{line.slice(2)}</li>
                ))}
              </ul>
            );
          }

          return <p key={blockIndex}>{block}</p>;
        })}
      </div>
      {children}
    </div>
  );
}
