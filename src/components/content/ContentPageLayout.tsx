import type { ReactNode } from "react";

type ContentPageLayoutProps = {
  title: string;
  content: string;
  banner?: ReactNode;
  children?: ReactNode;
};

/** A block prefixed with "## " renders as a section heading; everything else is a paragraph. */
export default function ContentPageLayout({ title, content, banner, children }: ContentPageLayoutProps) {
  const blocks = content.split("\n\n");

  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
      {banner}
      <div className="mt-8 space-y-4 text-sm text-black/80">
        {blocks.map((block) =>
          block.startsWith("## ") ? (
            <h2 key={block.slice(0, 40)} className="pt-2 text-base font-semibold text-black">
              {block.slice(3)}
            </h2>
          ) : (
            <p key={block.slice(0, 40)}>{block}</p>
          ),
        )}
      </div>
      {children}
    </div>
  );
}
