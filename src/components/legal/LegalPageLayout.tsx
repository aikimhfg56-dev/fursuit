import type { ReactNode } from "react";
import { getTranslations } from "next-intl/server";

type LegalPageLayoutProps = {
  title: string;
  content: string;
  children?: ReactNode;
};

/** A block prefixed with "## " renders as a section heading; everything else is a paragraph. */
export default async function LegalPageLayout({ title, content, children }: LegalPageLayoutProps) {
  const t = await getTranslations("legal");
  const blocks = content.split("\n\n");

  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
      <p className="mt-4 rounded border border-dashed border-amber-500/40 bg-amber-500/10 px-4 py-3 text-xs text-amber-700 dark:text-amber-400">
        {t("disclaimer")}
      </p>
      <div className="mt-8 space-y-4 text-sm text-black/80 dark:text-white/80">
        {blocks.map((block) =>
          block.startsWith("## ") ? (
            <h2 key={block.slice(0, 40)} className="pt-2 text-base font-semibold text-black dark:text-white">
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
