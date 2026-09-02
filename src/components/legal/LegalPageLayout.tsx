import type { ReactNode } from "react";
import { getTranslations } from "next-intl/server";

type LegalPageLayoutProps = {
  title: string;
  content: string;
  children?: ReactNode;
};

export default async function LegalPageLayout({ title, content, children }: LegalPageLayoutProps) {
  const t = await getTranslations("legal");
  const paragraphs = content.split("\n\n");

  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
      <p className="mt-4 rounded border border-dashed border-amber-500/40 bg-amber-500/10 px-4 py-3 text-xs text-amber-700 dark:text-amber-400">
        {t("disclaimer")}
      </p>
      <div className="mt-8 space-y-4 text-sm text-black/80 dark:text-white/80">
        {paragraphs.map((paragraph) => (
          <p key={paragraph.slice(0, 40)}>{paragraph}</p>
        ))}
      </div>
      {children}
    </div>
  );
}
